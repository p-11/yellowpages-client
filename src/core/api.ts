/**
 * Types
 */
export interface Proof {
  id: string;
  btc_address: string;
  ml_dsa_44_address: string;
  creation_date: string;
  version: string;
  proof: string;
  // if major version is 1, aws_nitro_pcr_measurement_set will be returned
  aws_nitro_pcr_measurement_set?: {
    id: string;
    creation_date: string;
    version: string;
    pcr_0: string;
    pcr_1: string;
    pcr_2: string;
    pcr_8: string;
  };
}

/**
 * Base domains per service and environment.
 */
const IS_PROD = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const domains = {
  verificationService: IS_PROD
    ? 'https://verification-api.yellowpages.xyz'
    : 'http://localhost:8080',
  proofService: IS_PROD
    ? 'https://not.implemented.com'
    : 'http://localhost:8008'
};

/**
 * Low-level wrapper around fetch.
 * - Throws on network errors.
 * - Throws on HTTP errors (non-2xx), including response text.
 * - Parses JSON.
 *
 * Handle errors:
 *
 * try {
 *  const x = await foo();
 *  console.log(x);
 * } catch (error) {
 *  if (error instanceof Error) console.error(error.message);
 *  else console.error(error);
 * }
 */
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (e) {
    // networkError is e.g. DNS failure, offline, CORS issues, etc.
    throw new Error(`Network error while fetching ${url}: ${e}`);
  }

  // HTTP-level error
  if (!response.ok) {
    let errBody: unknown;
    try {
      errBody = await response.json();
    } catch {
      errBody = await response.text().catch(() => '');
    }
    const msg =
      typeof errBody === 'string'
        ? errBody
        : /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          ((errBody as any).error ?? JSON.stringify(errBody));
    throw new Error(`${response.status} ${response.statusText} ${msg}`);
  }

  // No content
  if (response.status === 204) {
    return {} as T;
  }

  // Try to parse JSON
  try {
    return (await response.json()) as T;
  } catch (parseError) {
    throw new Error(`Failed to parse JSON from ${url}: ${parseError}`);
  }
}

/**
 * Search yellowpages by BTC address
 */
export async function searchYellowpagesByBtcAddress(
  btcAddress: string
): Promise<Proof> {
  const url = `${domains.verificationService}/v1/proofs/by-btc-address/${encodeURIComponent(btcAddress)}`;
  return await request(url, { method: 'GET' });
}

/**
 * Create proof
 */
export async function createProof(body: {
  btcAddress: string;
  btcSignedMessage: string;
  mldsa44Address: string;
  mldsa44SignedMessage: string;
  mldsa44PublicKey: string;
}): Promise<void> {
  const wsUrl = `${domains.proofService.replace('http', 'ws')}/prove`;
  console.log(`Opening WebSocket connection to: ${wsUrl}`);

  // Create WebSocket connection
  const ws = new WebSocket(wsUrl);
  
  // Set up promise-based message handler
  async function waitForMessage(): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        console.log(`WebSocket message received:`, event.data);
        try {
          const data = JSON.parse(event.data);
          ws.removeEventListener('message', messageHandler);
          resolve(data);
        } catch (e) {
          ws.removeEventListener('message', messageHandler);
          reject(new Error(`Failed to parse JSON from WebSocket: ${e}`));
        }
      };
      
      ws.addEventListener('message', messageHandler);
    });
  }

  // Set up error handler
  const errorPromise = new Promise<never>((_, reject) => {
    ws.addEventListener('error', (event) => {
      console.error('WebSocket error occurred:', event);
      reject(new Error('Network error while connecting to proof service'));
    });
  });

  // Set up close handler with code interpretation
  const closePromise = new Promise<never>((_, reject) => {
    ws.addEventListener('close', (event) => {
      console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}, clean=${event.wasClean}`);
      
      // Only reject if it's not a normal closure
      if (event.code !== 1000) {
        let errorMessage = `Connection closed unexpectedly: code ${event.code}`;
        
        if (event.code === 1008) {
          errorMessage = 'Policy violation';
        } else if (event.code === 1011) {
          errorMessage = 'Server error';
        } else if (event.code === 4000) {
          errorMessage = 'Operation timed out on server';
        }
        
        reject(new Error(errorMessage));
      }
    });
  });

  // Set timeout for the entire operation
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      console.log('WebSocket operation timed out after 60 seconds');
      reject(new Error('Operation timed out'));
      
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }, 60000); // 60 second timeout
    
    // Clear timeout when connection closes
    ws.addEventListener('close', () => clearTimeout(timeoutId));
  });

  // Wait for connection to open
  await new Promise<void>((resolve, reject) => {
    ws.addEventListener('open', () => resolve());
    // The error and close handlers will trigger reject if needed
  });

  try {
    console.log('WebSocket connection opened, sending handshake');
    
    // Step 1: Send handshake
    ws.send(JSON.stringify({ message: 'hello' }));
    
    // Step 2: Wait for handshake acknowledgment
    const handshakeResponse = await Promise.race([
      waitForMessage(),
      errorPromise,
      closePromise,
      timeoutPromise
    ]);
    
    if (handshakeResponse.message !== 'ack') {
      throw new Error(`Unexpected server response: ${JSON.stringify(handshakeResponse)}`);
    }
    
    console.log('Received handshake acknowledgment, sending proof request');
    
    // Step 3: Send proof request
    const proofRequest = {
      bitcoin_address: body.btcAddress,
      bitcoin_signed_message: body.btcSignedMessage,
      ml_dsa_address: body.mldsa44Address,
      ml_dsa_signed_message: body.mldsa44SignedMessage,
      ml_dsa_public_key: body.mldsa44PublicKey
    };
    ws.send(JSON.stringify(proofRequest));
    console.log('Proof request sent');
    
    // Step 4: Wait for successful completion (normal close)
    await new Promise<void>((resolve, reject) => {
      ws.addEventListener('close', (event) => {
        if (event.code === 1000) {
          resolve();
        }
      });
      
      // These promises will reject if anything goes wrong
      Promise.race([errorPromise, closePromise, timeoutPromise])
        .catch(error => reject(error));
    });
    
  } finally {
    // Ensure connection is closed if still open
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  }
}
