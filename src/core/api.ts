/**
 * Types
 */
import {
  generateMlKem768Keypair,
  destroyMlKem768Keypair,
  encryptProofRequestData,
  ML_KEM_768_CIPHERTEXT_SIZE,
  MAX_BASE64_ML_KEM_768_CIPHERTEXT_SIZE,
  MlKem768Keypair,
  MlKem768CiphertextBytes,
  ProofRequestBytes,
  BitcoinAddress,
  SignedMessage,
  PQAddress,
  PQPublicKeyString,
  AttestationDocBase64,
  verifyAttestationDoc,
  PCR8Value
} from './cryptography';
import { base64 } from '@scure/base';
import { utf8ToBytes } from '@noble/ciphers/utils.js';
import { ErrorWithCode } from '@/utils/errorWithCode';
import { domains } from '@/lib/domains';

export interface Proof {
  id: string;
  btc_address: string;
  ml_dsa_44_address: string;
  slh_dsa_sha2_s_128_address: string;
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
  auth_attestation_doc: string; // Base64-encoded attestation document
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
  Timeout = 4000,
  // eslint-disable-next-line no-unused-vars
  InsufficientBtcBalance = 4002
}

/**
 * Expected PCR8 values for attestation document verification.
 * These values represent the known-good PCR8 measurements for our enclaves.
 */
const IS_PROD = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const expectedPCR8: PCR8Value = IS_PROD
  ? ('963ce555a9ffd22df1813b9a8c2137c2fd3eca51a83067c932da42acb962f8b154916cc148186bb2dd8555fc4f532345' as PCR8Value) // prod enclave PCR8
  : ('6b3e6d52305145a280af7ec4aaf9327781a3f30441205294b37025a8921f28235cf0ea8603829498d6c95cc3edf54a83' as PCR8Value); // dev enclave PCR8

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
    throw new ErrorWithCode(
      `Network error while fetching ${url}: ${e}`,
      'YP-005'
    );
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
  btcAddress: BitcoinAddress
): Promise<Proof> {
  const url = `${domains.verificationService}/v1/proofs/by-btc-address/${encodeURIComponent(btcAddress)}`;
  return await request(url, { method: 'GET' });
}

/**
 * Create proof
 */
export async function createProof(
  body: {
    btcAddress: BitcoinAddress;
    btcSignedMessage: SignedMessage;
    mldsa44Address: PQAddress;
    mldsa44SignedMessage: SignedMessage;
    mldsa44PublicKey: PQPublicKeyString;
    slhdsaSha2S128Address: PQAddress;
    slhdsaSha2S128PublicKey: PQPublicKeyString;
    slhdsaSha2S128SignedMessage: SignedMessage;
  },
  cfTurnstileToken: string
): Promise<void> {
  // Initialize variables outside try block so we can clean them up in finally
  let mlKem768Keypair: MlKem768Keypair | undefined;
  let cleanup: (() => void) | undefined;
  let cleanupSocketOpen: (() => void) | undefined;
  let cleanupHandshake: (() => void) | undefined;
  let cleanupSuccessClose: (() => void) | undefined;

  try {
    // Create WebSocket connection
    const ws = new WebSocket(
      `${domains.proofService}/prove?cf_turnstile_token=${cfTurnstileToken}`
    );

    // Set up event handlers
    const handlers = setupWebSocketHandlers(ws);
    cleanup = handlers.cleanup;
    const {
      onHandshakeResponse,
      onSocketOpen,
      onSuccessClose,
      withAbortHandling
    } = handlers;

    // Step 1: Wait for WebSocket to connect
    const {
      wrappedPromise: onSocketOpenWithAbortHandling,
      cleanup: cleanupSocketOpenFn
    } = withAbortHandling(onSocketOpen, 'Connection aborted');
    cleanupSocketOpen = cleanupSocketOpenFn;
    await raceWithTimeout('Connection', onSocketOpenWithAbortHandling);

    // Step 2: Generate ML-KEM-768 key pair
    mlKem768Keypair = generateMlKem768Keypair();

    if (!mlKem768Keypair.encapsulationKey)
      throw new Error('Invalid ML-KEM-768 keypair');

    const mlKem768EncapsulationKeyBase64 = base64.encode(
      mlKem768Keypair.encapsulationKey
    );

    // Step 3: Send handshake with ML-KEM-768 public key
    const handshakeMessage: HandshakeMessage = {
      ml_kem_768_encapsulation_key: mlKem768EncapsulationKeyBase64
    };
    ws.send(JSON.stringify(handshakeMessage));

    // Step 4: Wait for handshake acknowledgment
    const {
      wrappedPromise: onHandshakeResponseWithAbortHandling,
      cleanup: cleanupHandshakeFn
    } = withAbortHandling(onHandshakeResponse, 'Handshake aborted');
    cleanupHandshake = cleanupHandshakeFn;
    const handshakeResponse = await raceWithTimeout<HandshakeResponse>(
      'Handshake',
      onHandshakeResponseWithAbortHandling
    );

    // Step 5: Validate and decode the ciphertext
    const mlKem768CiphertextBase64 = handshakeResponse.ml_kem_768_ciphertext;

    // Validate base64 ciphertext length
    if (
      !mlKem768CiphertextBase64 ||
      mlKem768CiphertextBase64.length > MAX_BASE64_ML_KEM_768_CIPHERTEXT_SIZE
    ) {
      throw new Error(
        `Invalid ML-KEM-768 ciphertext length: expected base64 length <= ${MAX_BASE64_ML_KEM_768_CIPHERTEXT_SIZE}, got ${mlKem768CiphertextBase64.length}`
      );
    }

    // Decode base64 to bytes
    const mlKem768CiphertextBytes = base64.decode(
      mlKem768CiphertextBase64
    ) as MlKem768CiphertextBytes;

    // Validate exact byte length
    if (mlKem768CiphertextBytes.length !== ML_KEM_768_CIPHERTEXT_SIZE) {
      throw new Error(
        `Invalid ML-KEM-768 ciphertext byte length: expected ${ML_KEM_768_CIPHERTEXT_SIZE}, got ${mlKem768CiphertextBytes.length}`
      );
    }

    // Step 6: Verify the attestation document
    // const attestationDoc =
    //   handshakeResponse.auth_attestation_doc as AttestationDocBase64;
    // try {
    //   await verifyAttestationDoc(
    //     attestationDoc,
    //     expectedPCR8,
    //     mlKem768CiphertextBytes
    //   );
    // } catch (error) {
    //   const errorMessage =
    //     error instanceof Error ? error.message : String(error);
    //   throw new ErrorWithCode(
    //     `Failed to verify attestation document: ${errorMessage}`,
    //     'YP-008'
    //   );
    // }

    // Step 7: Create and encrypt proof request
    const proofRequest = {
      bitcoin_address: body.btcAddress,
      bitcoin_signed_message: body.btcSignedMessage,
      ml_dsa_44_address: body.mldsa44Address,
      ml_dsa_44_signed_message: body.mldsa44SignedMessage,
      ml_dsa_44_public_key: body.mldsa44PublicKey,
      slh_dsa_sha2_s_128_address: body.slhdsaSha2S128Address,
      slh_dsa_sha2_s_128_signed_message: body.slhdsaSha2S128SignedMessage,
      slh_dsa_sha2_s_128_public_key: body.slhdsaSha2S128PublicKey
    };
    const proofRequestBytes = utf8ToBytes(
      JSON.stringify(proofRequest)
    ) as ProofRequestBytes;

    // Encrypt the proof request - this also handles destroying the keypair
    const aes256GcmEncryptedMessage = encryptProofRequestData(
      proofRequestBytes,
      mlKem768Keypair,
      mlKem768CiphertextBytes
    );
    mlKem768Keypair = undefined; // Keypair is destroyed by encryptProofRequestData

    // Send the encrypted proof request as a binary message
    ws.send(aes256GcmEncryptedMessage);

    // Step 9: Wait for successful completion (normal close)
    const {
      wrappedPromise: onSuccessCloseWithAbortHandling,
      cleanup: cleanupSuccessCloseFn
    } = withAbortHandling(onSuccessClose, 'Connection aborted');
    cleanupSuccessClose = cleanupSuccessCloseFn;
    await raceWithTimeout(
      'Proof verification',
      onSuccessCloseWithAbortHandling
    );
  } finally {
    // Clean up abort handlers
    if (cleanupSocketOpen) cleanupSocketOpen();
    if (cleanupHandshake) cleanupHandshake();
    if (cleanupSuccessClose) cleanupSuccessClose();

    // Clean up WebSocket event listeners
    if (cleanup) {
      cleanup();
    }

    // Clean up cryptographic material
    if (mlKem768Keypair) {
      destroyMlKem768Keypair(mlKem768Keypair);
    }
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
        new ErrorWithCode(
          `Operation "${operation}" timed out after ${timeoutMs / 1000} seconds`,
          'YP-006'
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
  const successHandlers = setupWebSocketSuccessHandlers(ws);

  // Function to clean up all listeners
  const cleanup = () => {
    successHandlers.cleanupSuccessHandlers();
    errorHandlers.cleanupErrorHandlers();
  };

  return {
    onHandshakeResponse: successHandlers.onHandshakeResponse,
    onSocketOpen: successHandlers.onSocketOpen,
    onSuccessClose: successHandlers.onSuccessClose,
    withAbortHandling: errorHandlers.withAbortHandling,
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
      reject(signal.reason || new ErrorWithCode(customMessage, 'YP-007'));
    };
    signal.addEventListener('abort', abortHandler, { once: true });
    return () => signal.removeEventListener('abort', abortHandler);
  };

  // Function to wrap a promise with abort handling only when we're about to await it
  const withAbortHandling = <T>(
    promise: Promise<T>,
    customMessage: string
  ): {
    wrappedPromise: Promise<T>;
    cleanup: () => void;
  } => {
    let removeAbortHandler: (() => void) | undefined;

    const wrappedPromise = new Promise<T>((resolve, reject) => {
      // Register abort handler for this specific promise
      removeAbortHandler = registerAbortHandler(reject, customMessage);

      // Forward the original promise result
      promise.then(resolve, reject);

      // Clean up abort handler when promise settles
      promise.finally(() => {
        if (removeAbortHandler) {
          removeAbortHandler();
          removeAbortHandler = undefined;
        }
      });
    });

    const cleanup = () => {
      if (removeAbortHandler) {
        removeAbortHandler();
        removeAbortHandler = undefined;
      }
    };

    return { wrappedPromise, cleanup };
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
      } else if (event.code === WebSocketCloseCode.InsufficientBtcBalance) {
        errorMessage = 'The submitted Bitcoin address is an empty wallet: As a spam mitigation, we only allow yellowpages registrations for mainnet Bitcoin wallets that have a non-zero balance.';
      }

      const error = new ErrorWithCode(errorMessage, event.code);
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
    withAbortHandling,
    cleanupErrorHandlers
  };
}

/**
 * Set up WebSocket success handlers
 */
function setupWebSocketSuccessHandlers(ws: WebSocket) {
  // Store success listener references for cleanup
  const successListeners = {
    open: null as (() => void) | null,
    message: null as ((_event: MessageEvent) => void) | null,
    successClose: null as ((_event: CloseEvent) => void) | null
  };

  // Promise that resolves when the socket connects
  const onSocketOpen = new Promise<void>(resolve => {
    const openHandler = () => {
      resolve();
    };

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

      successListeners.message = messageHandler;
      ws.addEventListener('message', messageHandler);
    }
  );

  // Promise that resolves when the socket closes successfully
  const onSuccessClose = new Promise<void>(resolve => {
    const successCloseHandler = (event: CloseEvent) => {
      if (event.code === WebSocketCloseCode.Normal) {
        resolve();
      }
    };

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
  };

  return {
    onHandshakeResponse,
    onSocketOpen,
    onSuccessClose,
    cleanupSuccessHandlers
  };
}
