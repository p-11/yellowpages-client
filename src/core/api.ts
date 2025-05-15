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
 * Expected WebSocket message response format
 */
interface HandshakeResponse {
  message: string;
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
  
  // Set up event handlers
  const { 
    waitForHandshakeResponse,
    waitForSocketOpen,
    onErrorEvent, 
    onSuccessClose, 
    onErrorClose
  } = setupWebSocketHandlers(ws);

  try {
    // Step 1: Wait for WebSocket to connect
    console.log('Waiting for WebSocket connection to open');
    await executeWithTimeout(
      'Connection', 
      waitForSocketOpen(), 
      [onErrorEvent]
    );
    
    console.log('WebSocket connection opened, sending handshake');
    
    // Step 2: Send handshake
    ws.send(JSON.stringify({ message: 'hello' }));
    
    // Step 3: Wait for handshake acknowledgment
    const handshakeResponse = await executeWithTimeout(
      'Handshake',
      waitForHandshakeResponse(),
      [onErrorEvent, onErrorClose]
    );
    
    if (handshakeResponse.message !== 'ack') {
      throw new Error(`Unexpected server response: ${JSON.stringify(handshakeResponse)}`);
    }
    
    console.log('Received handshake acknowledgment, sending proof request');
    
    // Step 4: Send proof request
    const proofRequest = {
      bitcoin_address: body.btcAddress,
      bitcoin_signed_message: body.btcSignedMessage,
      ml_dsa_address: body.mldsa44Address,
      ml_dsa_signed_message: body.mldsa44SignedMessage,
      ml_dsa_public_key: body.mldsa44PublicKey
    };
    ws.send(JSON.stringify(proofRequest));
    console.log('Proof request sent');
    
    // Step 5: Wait for successful completion (normal close)
    await executeWithTimeout(
      'Proof verification',
      onSuccessClose,
      [onErrorEvent, onErrorClose],
      45000  // Allow more time for proof verification
    );
  } finally {
    // Ensure connection is closed if still open
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  }
}

/**
 * Execute a promise with a timeout, cleaning up the timeout afterward
 * @param operation Name of the operation for the timeout message
 * @param mainPromise The main promise to execute
 * @param errorPromises Promises that only reject on error conditions
 * @param timeoutMs Timeout in milliseconds (default: 30000)
 */
async function executeWithTimeout<T>(
  operation: string,
  mainPromise: Promise<T>,
  errorPromises: Promise<never>[] = [],
  timeoutMs: number = 30000
): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      console.log(`${operation} timed out after ${timeoutMs/1000} seconds`);
      reject(new Error(`${operation} timed out`));
    }, timeoutMs);
  });
  
  try {
    return await Promise.race([
      mainPromise,
      ...errorPromises,
      timeoutPromise
    ]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Set up all WebSocket event handlers
 */
function setupWebSocketHandlers(ws: WebSocket) {
  // Create a promise that resolves when the socket connects
  const waitForSocketOpen = (): Promise<void> => {
    return new Promise<void>((resolve) => {
      ws.addEventListener('open', () => resolve());
    });
  };
  
  // Create a promise that resolves when a handshake response is received
  const waitForHandshakeResponse = (): Promise<HandshakeResponse> => {
    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        console.log(`WebSocket message received:`, event.data);
        try {
          const data = JSON.parse(event.data);
          ws.removeEventListener('message', messageHandler);
          
          // Validate that this is a handshake response
          if (typeof data.message !== 'string') {
            reject(new Error(`Expected handshake response with message field, got: ${JSON.stringify(data)}`));
            return;
          }
          
          resolve(data as HandshakeResponse);
        } catch (e) {
          ws.removeEventListener('message', messageHandler);
          reject(new Error(`Failed to parse JSON from WebSocket: ${e}`));
        }
      };
      
      ws.addEventListener('message', messageHandler);
    });
  };
  
  // Create a promise that rejects when an error occurs
  const onErrorEvent = new Promise<never>((_, reject) => {
    ws.addEventListener('error', (event) => {
      console.error('WebSocket error occurred:', event);
      reject(new Error('Network error while connecting to proof service'));
    });
  });
  
  // Create a promise that resolves when the socket closes successfully
  const onSuccessClose = new Promise<void>((resolve) => {
    ws.addEventListener('close', (event) => {
      if (event.code === 1000) {
        console.log('WebSocket closed with success code 1000');
        resolve();
      }
    });
  });
  
  // Create a promise that rejects when the socket closes with an error
  const onErrorClose = new Promise<never>((_, reject) => {
    ws.addEventListener('close', (event) => {
      if (event.code !== 1000) {
        console.log(`WebSocket closed with error code: ${event.code}, reason: ${event.reason}`);
        
        let errorMessage = `Connection closed unexpectedly: code ${event.code}`;
        
        if (event.code === 1008) {
          errorMessage = 'Policy violation';
          console.error('Policy violation detected (code 1008)');
        } else if (event.code === 1011) {
          errorMessage = 'Server error';
          console.error('Server encountered an internal error (code 1011)');
        } else if (event.code === 4000) {
          errorMessage = 'Operation timed out on server';
          console.error('Server timeout detected (code 4000)');
        } else {
          console.error(`Unexpected close code: ${event.code}`);
        }
        
        reject(new Error(errorMessage));
      }
    });
  });
  
  return { 
    waitForHandshakeResponse,
    waitForSocketOpen,
    onErrorEvent, 
    onSuccessClose, 
    onErrorClose
  };
}
