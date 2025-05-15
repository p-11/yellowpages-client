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
 * WebSocket close codes that we use in this application
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
 */
enum WebSocketCloseCode {
  Normal = 1000,
  PolicyViolation = 1008,
  InternalError = 1011,
  // Custom codes
  Timeout = 4000
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
    ? 'wss://not.implemented.com'
    : 'ws://localhost:8008'
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
  // Create WebSocket connection
  const ws = new WebSocket(`${domains.proofService}/prove`);
  
  // Set up event handlers
  const { 
    onHandshakeResponse,
    onSocketOpen,
    onSuccessClose, 
    abortController,
    cleanup
  } = setupWebSocketHandlers(ws);

  try {
    // Step 1: Wait for WebSocket to connect
    await raceWithTimeout({
      operation: 'Connection',
      resolvePromise: onSocketOpen,
      timeoutMs: 30000
    });
    
    // Step 2: Send handshake
    ws.send(JSON.stringify({ message: 'hello' }));
    
    // Step 3: Wait for handshake acknowledgment
    const handshakeResponse = await raceWithTimeout<HandshakeResponse>({
      operation: 'Handshake',
      resolvePromise: onHandshakeResponse,
      timeoutMs: 30000
    });
    
    if (handshakeResponse.message !== 'ack') {
      throw new Error(`Unexpected server response: ${JSON.stringify(handshakeResponse)}`);
    }
    
    // Step 4: Send proof request
    const proofRequest = {
      bitcoin_address: body.btcAddress,
      bitcoin_signed_message: body.btcSignedMessage,
      ml_dsa_address: body.mldsa44Address,
      ml_dsa_signed_message: body.mldsa44SignedMessage,
      ml_dsa_public_key: body.mldsa44PublicKey
    };
    ws.send(JSON.stringify(proofRequest));
    
    // Step 5: Wait for successful completion (normal close)
    await raceWithTimeout({
      operation: 'Proof verification',
      resolvePromise: onSuccessClose,
      timeoutMs: 45000  // Allow more time for proof verification
    });
  } catch (error) {
    // Make sure we abort on any error
    abortController.abort(error);
    throw error;
  } finally {
    // Clean up all event listeners
    cleanup();
  }
}

/**
 * Execute a promise race with a timeout, cleaning up the timeout afterward
 * @param params Configuration object for the race
 * @param params.operation Name of the operation for the timeout message
 * @param params.resolvePromise The main promise that should resolve if successful
 * @param params.timeoutMs Timeout in milliseconds (default: 30000)
 */
async function raceWithTimeout<T>({
  operation,
  resolvePromise,
  timeoutMs = 30000
}: {
  operation: string;
  // NOTE: TypeScript cannot statically prevent Promise<never> from being used here for `resolvePromise`.
  resolvePromise: Promise<T>;
  timeoutMs?: number;
}): Promise<T> {
  // Create a timeout promise with cleanup
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation "${operation}" timed out after ${timeoutMs/1000} seconds`));
    }, timeoutMs);
  });
  
  try {
    // Simple race between the main promise and timeout
    return await Promise.race([
      resolvePromise,
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
  // Create abort controller for coordinating cancellation
  const abortController = new AbortController();
  const signal = abortController.signal;
  
  // Store listener references for cleanup
  const listeners = {
    open: null as ((event: Event) => void) | null,
    message: null as ((event: MessageEvent) => void) | null,
    error: null as ((event: Event) => void) | null,
    successClose: null as ((event: CloseEvent) => void) | null,
    errorClose: null as ((event: CloseEvent) => void) | null
  };
  
  // Store abort handlers for cleanup
  const abortHandlers: Array<() => void> = [];
  
  // Helper function to register an abort handler
  const registerAbortHandler = (reject: (reason: any) => void, customMessage: string) => {
    const abortHandler = () => {
      reject(signal.reason || new Error(customMessage));
    };
    signal.addEventListener('abort', abortHandler, { once: true });
    abortHandlers.push(() => signal.removeEventListener('abort', abortHandler));
    return abortHandler;
  };
  
  // Promise that resolves when the socket connects
  const onSocketOpen = new Promise<void>((resolve, reject) => {
    const openHandler = (event: Event) => {
      resolve();
    };
    
    // Handle abort
    registerAbortHandler(reject, 'Connection aborted');
    
    listeners.open = openHandler;
    ws.addEventListener('open', openHandler);
  });
  
  // Promise that resolves when a handshake response is received
  const onHandshakeResponse = new Promise<HandshakeResponse>((resolve, reject) => {
    const messageHandler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        // Validate that this is a handshake response
        if (typeof data.message !== 'string') {
          reject(new Error(`Expected handshake response with message field, got: ${JSON.stringify(data)}`));
          return;
        }
        
        resolve(data as HandshakeResponse);
      } catch (e) {
        reject(new Error(`Failed to parse JSON from WebSocket: ${e}`));
      }
    };
    
    // Handle abort
    registerAbortHandler(reject, 'Handshake aborted');
    
    listeners.message = messageHandler;
    ws.addEventListener('message', messageHandler);
  });
  
  // Handle WebSocket error events
  const errorHandler = (event: Event) => {
    const error = new Error('Network error while connecting to proof service');
    abortController.abort(error);
  };
  
  listeners.error = errorHandler;
  ws.addEventListener('error', errorHandler);
  
  // Handle WebSocket close error events
  const closeErrorHandler = (event: CloseEvent) => {
    if (event.code !== WebSocketCloseCode.Normal) {
      let errorMessage = `Connection closed unexpectedly: code ${event.code}`;
      
      if (event.code === WebSocketCloseCode.PolicyViolation) {
        errorMessage = `Policy violation (code ${WebSocketCloseCode.PolicyViolation})`;
      } else if (event.code === WebSocketCloseCode.InternalError) {
        errorMessage = `Server encountered an internal error (code ${WebSocketCloseCode.InternalError})`;
      } else if (event.code === WebSocketCloseCode.Timeout) {
        errorMessage = `Operation timed out on server (code ${WebSocketCloseCode.Timeout})`;
      } else {
        errorMessage = `Connection closed unexpectedly: code ${event.code}`;
      }
      
      const error = new Error(errorMessage);
      abortController.abort(error);
    }
  };
  
  // Promise that resolves when the socket closes successfully
  const onSuccessClose = new Promise<void>((resolve, reject) => {
    const successCloseHandler = (event: CloseEvent) => {
      if (event.code === WebSocketCloseCode.Normal) {
        resolve();
      }
    };
    
    // Handle abort
    registerAbortHandler(reject, 'Connection aborted');
    
    listeners.successClose = successCloseHandler;
    ws.addEventListener('close', successCloseHandler);
  });
  
  // Set up error close handler
  listeners.errorClose = closeErrorHandler;
  ws.addEventListener('close', closeErrorHandler);
  
  // Function to clean up all listeners
  const cleanup = () => {
    if (listeners.open) ws.removeEventListener('open', listeners.open);
    if (listeners.message) ws.removeEventListener('message', listeners.message);
    if (listeners.error) ws.removeEventListener('error', listeners.error);
    if (listeners.successClose) ws.removeEventListener('close', listeners.successClose);
    if (listeners.errorClose) ws.removeEventListener('close', listeners.errorClose);
    
    // Clean up abort handlers
    abortHandlers.forEach(removeHandler => removeHandler());
  };
  
  return { 
    onHandshakeResponse,
    onSocketOpen,
    onSuccessClose,
    abortController,
    cleanup
  };
}
