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
  try {
    const wsUrl = `${domains.proofService.replace('http', 'ws')}/prove`;
    console.log(`Opening WebSocket connection to: ${wsUrl}`);

    return await new Promise<void>((resolve, reject) => {
      let isResolved = false;
      let proofSent = false;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connection opened, sending handshake');
        // Send handshake
        ws.send(JSON.stringify({ message: 'hello' }));
      };

      ws.onmessage = event => {
        console.log(`WebSocket message received:`, event.data);
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
          cleanupAndReject(
            new Error(`Failed to parse JSON from WebSocket: ${e}`)
          );
          return;
        }

        // After receiving handshake ack, send proof request
        if (data.message === 'ack') {
          console.log(
            'Received handshake acknowledgment, sending proof request'
          );
          const proofRequest = {
            bitcoin_address: body.btcAddress,
            bitcoin_signed_message: body.btcSignedMessage,
            ml_dsa_address: body.mldsa44Address,
            ml_dsa_signed_message: body.mldsa44SignedMessage,
            ml_dsa_public_key: body.mldsa44PublicKey
          };
          ws.send(JSON.stringify(proofRequest));
          proofSent = true;
          console.log('Proof request sent');
        } else {
          console.error('Unexpected message received:', data);
          cleanupAndReject(
            new Error(`Unexpected server response: ${JSON.stringify(data)}`)
          );
        }
      };

      ws.onerror = (event: Event) => {
        console.error('WebSocket error occurred:', event);
        cleanupAndReject(
          new Error('Network error while connecting to proof service')
        );
      };

      ws.onclose = event => {
        console.log(
          `WebSocket closed: code=${event.code}, reason=${event.reason}, clean=${event.wasClean}`
        );

        // Process based on close code
        if (event.code === 1000) {
          if (proofSent && !isResolved) {
            cleanupAndResolve();
          }
        } else if (event.code === 1008) {
          console.error('Policy violation detected (code 1008)');
          cleanupAndReject(new Error('Policy violation'));
        } else if (event.code === 1011) {
          console.error('Server encountered an internal error (code 1011)');
          cleanupAndReject(new Error('Server error'));
        } else if (event.code === 4000) {
          console.error('Server timeout detected (code 4000)');
          cleanupAndReject(new Error('Operation timed out on server'));
        } else {
          console.error(`Unexpected close code: ${event.code}`);
          cleanupAndReject(
            new Error(`Connection closed unexpectedly: code ${event.code}`)
          );
        }
      };

      // Set a timeout for the entire operation
      const timeoutId = setTimeout(() => {
        console.log('WebSocket operation timed out after 60 seconds');
        cleanupAndReject(new Error('Operation timed out'));
      }, 60000); // 60 second timeout

      function cleanupAndReject(error: Error) {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timeoutId);
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close();
        }
        reject(error);
      }

      function cleanupAndResolve() {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timeoutId);
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close();
        }
        resolve();
      }
    });
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    } else {
      throw new Error(`Error during proof creation: ${e}`);
    }
  }
}
