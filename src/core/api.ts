/**
 * Types
 */
import { 
  bytesToBase64, 
  generateMlKem768Keypair, 
  deriveMlKem768SharedSecret,
  ML_KEM_768_CIPHERTEXT_SIZE,
  MAX_BASE64_ML_KEM_768_CIPHERTEXT_SIZE
} from './cryptography';

/**
 * Function to convert base64 to bytes
 */
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

interface Proof {
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
  ml_kem_768_ciphertext: string; // Base64-encoded ML-KEM ciphertext
}

/**
 * Handshake message format
 */
interface HandshakeMessage {
  ml_kem_768_encapsulation_key: string; // Base64-encoded ML-KEM encapsulation key
}

/**
 * WebSocket close codes that we use in this application
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
 */
enum WebSocketCloseCode {
  // eslint-disable-next-line no-unused-vars
  Normal = 1000,
  // eslint-disable-next-line no-unused-vars
  PolicyViolation = 1008,
  // eslint-disable-next-line no-unused-vars
  InternalError = 1011,
  // Custom codes
  // eslint-disable-next-line no-unused-vars
  Timeout = 4000
}

/**
 * Base domains per service and environment.
 */
const IS_PROD = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const domains = {
  verificationService: IS_PROD
    ? 'https://verification-api.yellowpages.xyz'
    : 'https://verification-api.yellowpages-development.xyz',
  proofService: IS_PROD ? 'wss://not.implemented.com' : 'ws://localhost:8008'
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
  const { onHandshakeResponse, onSocketOpen, onSuccessClose, cleanup } =
    setupWebSocketHandlers(ws);

  try {
    // Step 1: Wait for WebSocket to connect
    await raceWithTimeout('Connection', onSocketOpen);

    // Step 2: Generate ML-KEM-768 key pair
    const keyPair = generateMlKem768Keypair();
    const encapsulationKeyBase64 = bytesToBase64(keyPair.encapsulationKey);

    // Step 3: Send handshake with ML-KEM-768 public key
    const handshakeMessage: HandshakeMessage = {
      ml_kem_768_encapsulation_key: encapsulationKeyBase64
    };
    ws.send(JSON.stringify(handshakeMessage));

    // Step 4: Wait for handshake acknowledgment
    const handshakeResponse = await raceWithTimeout<HandshakeResponse>(
      'Handshake',
      onHandshakeResponse
    );

    // Step 5: Validate and decode the ciphertext
    const ciphertextBase64 = handshakeResponse.ml_kem_768_ciphertext;
    
    // Validate base64 ciphertext length
    if (!ciphertextBase64 || ciphertextBase64.length > MAX_BASE64_ML_KEM_768_CIPHERTEXT_SIZE) {
      throw new Error(`Invalid ML-KEM-768 ciphertext length: expected base64 length <= ${MAX_BASE64_ML_KEM_768_CIPHERTEXT_SIZE}, got ${ciphertextBase64.length}`);
    }

    // Decode base64 to bytes
    const ciphertextBytes = base64ToBytes(ciphertextBase64);
    
    // Validate exact byte length
    if (ciphertextBytes.length !== ML_KEM_768_CIPHERTEXT_SIZE) {
      throw new Error(`Invalid ML-KEM-768 ciphertext byte length: expected ${ML_KEM_768_CIPHERTEXT_SIZE}, got ${ciphertextBytes.length}`);
    }
    
    // Derive shared secret
    const _sharedSecret = deriveMlKem768SharedSecret(
      ciphertextBytes,
      keyPair.decapsulationKey
    );

    // Step 6: Send proof request
    const proofRequest = {
      bitcoin_address: body.btcAddress,
      bitcoin_signed_message: body.btcSignedMessage,
      ml_dsa_address: body.mldsa44Address,
      ml_dsa_signed_message: body.mldsa44SignedMessage,
      ml_dsa_public_key: body.mldsa44PublicKey
    };
    ws.send(JSON.stringify(proofRequest));

    // Step 7: Wait for successful completion (normal close)
    await raceWithTimeout('Proof verification', onSuccessClose);
  } finally {
    // Clean up all event listeners
    cleanup();
  }
}

/**
 * Execute a promise race with a timeout, cleaning up the timeout afterward
 * @param operation Name of the operation for the timeout message
 * @param operationPromise The main promise that should resolve if successful
 * @param timeoutMs Timeout in milliseconds (default: 30000)
 */
async function raceWithTimeout<T>(
  operation: string,
  operationPromise: Promise<T>,
  timeoutMs = 30000
): Promise<T> {
  // Create a timeout promise with cleanup
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Operation "${operation}" timed out after ${timeoutMs / 1000} seconds`
        )
      );
    }, timeoutMs);
  });

  try {
    // Simple race between the main promise and timeout
    return await Promise.race([operationPromise, timeoutPromise]);
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
  // First set up error handlers
  const errorHandlers = setupWebSocketErrorHandlers(ws);

  // Then set up success handlers
  const successHandlers = setupWebSocketSuccessHandlers(
    ws,
    errorHandlers.registerAbortHandler
  );

  // Function to clean up all listeners
  const cleanup = () => {
    successHandlers.cleanupSuccessHandlers();
    errorHandlers.cleanupErrorHandlers();
  };

  return {
    onHandshakeResponse: successHandlers.onHandshakeResponse,
    onSocketOpen: successHandlers.onSocketOpen,
    onSuccessClose: successHandlers.onSuccessClose,
    cleanup
  };
}

/**
 * Set up WebSocket error handlers
 */
function setupWebSocketErrorHandlers(ws: WebSocket) {
  // Create abort controller for coordinating cancellation
  const abortController = new AbortController();
  const signal = abortController.signal;

  // Store error listener references for cleanup
  const errorListeners = {
    error: null as ((_event: Event) => void) | null,
    errorClose: null as ((_event: CloseEvent) => void) | null
  };

  // Helper function to register an abort handler
  const registerAbortHandler = (
    reject: (_reason: unknown) => void,
    customMessage: string
  ) => {
    const abortHandler = () => {
      reject(signal.reason || new Error(customMessage));
    };
    signal.addEventListener('abort', abortHandler, { once: true });
    return () => signal.removeEventListener('abort', abortHandler);
  };

  // Handle WebSocket network error events
  const networkErrorHandler = () => {
    const error = new Error('Network error while connecting to proof service');
    abortController.abort(error);
  };

  errorListeners.error = networkErrorHandler;
  ws.addEventListener('error', networkErrorHandler);

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
      }

      const error = new Error(errorMessage);
      abortController.abort(error);
    }
  };

  errorListeners.errorClose = closeErrorHandler;
  ws.addEventListener('close', closeErrorHandler);

  // Function to clean up error listeners
  const cleanupErrorHandlers = () => {
    if (errorListeners.error)
      ws.removeEventListener('error', errorListeners.error);
    if (errorListeners.errorClose)
      ws.removeEventListener('close', errorListeners.errorClose);
  };

  return {
    abortController,
    signal,
    registerAbortHandler,
    cleanupErrorHandlers
  };
}

/**
 * Set up WebSocket success handlers
 */
function setupWebSocketSuccessHandlers(
  ws: WebSocket,
  registerAbortHandler: (
    _reject: (_reason: unknown) => void,
    _customMessage: string
  ) => () => void
) {
  // Store success listener references for cleanup
  const successListeners = {
    open: null as (() => void) | null,
    message: null as ((_event: MessageEvent) => void) | null,
    successClose: null as ((_event: CloseEvent) => void) | null
  };

  // Store abort handlers for cleanup
  const abortHandlers: Array<() => void> = [];

  // Promise that resolves when the socket connects
  const onSocketOpen = new Promise<void>((resolve, reject) => {
    const openHandler = () => {
      resolve();
    };

    // Handle abort
    abortHandlers.push(registerAbortHandler(reject, 'Connection aborted'));

    successListeners.open = openHandler;
    ws.addEventListener('open', openHandler);
  });

  // Promise that resolves when a handshake response is received
  const onHandshakeResponse = new Promise<HandshakeResponse>(
    (resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);

          // Validate that this is a handshake response
          if (typeof data.ml_kem_768_ciphertext !== 'string') {
            reject(
              new Error(
                `Expected handshake response with ml_kem_768_ciphertext field, got: ${JSON.stringify(data)}`
              )
            );
            return;
          }

          resolve(data as HandshakeResponse);
        } catch (e) {
          reject(new Error(`Failed to parse JSON from WebSocket: ${e}`));
        }
      };

      // Handle abort
      abortHandlers.push(registerAbortHandler(reject, 'Handshake aborted'));

      successListeners.message = messageHandler;
      ws.addEventListener('message', messageHandler);
    }
  );

  // Promise that resolves when the socket closes successfully
  const onSuccessClose = new Promise<void>((resolve, reject) => {
    const successCloseHandler = (event: CloseEvent) => {
      if (event.code === WebSocketCloseCode.Normal) {
        resolve();
      }
    };

    // Handle abort
    abortHandlers.push(registerAbortHandler(reject, 'Connection aborted'));

    successListeners.successClose = successCloseHandler;
    ws.addEventListener('close', successCloseHandler);
  });

  // Function to clean up success listeners
  const cleanupSuccessHandlers = () => {
    if (successListeners.open)
      ws.removeEventListener('open', successListeners.open);
    if (successListeners.message)
      ws.removeEventListener('message', successListeners.message);
    if (successListeners.successClose)
      ws.removeEventListener('close', successListeners.successClose);

    // Clean up abort handlers
    abortHandlers.forEach(removeHandler => removeHandler());
  };

  return {
    onHandshakeResponse,
    onSocketOpen,
    onSuccessClose,
    cleanupSuccessHandlers
  };
}
