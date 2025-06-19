import type {
  BitcoinAddress,
  Mnemonic24,
  PQAddress,
  SignedMessages
} from './cryptography';

export const createGenerateAddressesTask = () =>
  createWorkerTask<
    { mnemonic24: Mnemonic24 },
    { mldsa44Address: PQAddress; slhdsaSha2S128Address: PQAddress }
  >(() => {
    return new Worker(
      new URL('./workers/generateAddresses.ts', import.meta.url),
      {
        type: 'module'
      }
    );
  });

export const createGenerateSignedMessagesTask = () =>
  createWorkerTask<
    { mnemonic24: Mnemonic24; bitcoinAddress: BitcoinAddress },
    SignedMessages
  >(() => {
    return new Worker(
      new URL('./workers/generateSignedMessages.ts', import.meta.url),
      {
        type: 'module'
      }
    );
  });

/**
 * Helper function to manage the lifecycle of background tasks.
 *
 * Manages a Promise internally that resolves when the worker completes or fails.
 * Uses a provided factory function (`createWorker`) to instantiate a new Worker.
 * Each call to `start` restarts the task with new input, terminating any existing worker.
 *
 * Returns:
 * - `start(input: TInput)`: Starts a new worker task with the specified input.
 * - `waitForResult(): Promise<TOutput | null>`: Resolves with the result or rejects.
 * - `terminate()`: Cancels any running worker task and promise.
 */
function createWorkerTask<TInput, TOutput>(createWorker: () => Worker) {
  let currentWorker: Worker | null = null;
  let currentPromise: Promise<TOutput | null> | null = null;
  let resolveCurrentPromise: ((_value: TOutput | null) => void) | null = null;

  const terminate = () => {
    currentWorker?.terminate();
    currentWorker = null;
    currentPromise = null;
    resolveCurrentPromise?.(null);
    resolveCurrentPromise = null;
  };

  const start = (input: TInput) => {
    terminate();

    currentWorker = createWorker();

    currentPromise = new Promise<TOutput | null>((resolve, reject) => {
      resolveCurrentPromise = resolve;

      const onMessage = (event: MessageEvent<TOutput>) => {
        cleanup();
        resolve(event.data);
      };

      const onError = (event: ErrorEvent) => {
        cleanup();
        reject(new Error(event.message));
      };

      const cleanup = () => {
        currentWorker?.removeEventListener('message', onMessage);
        currentWorker?.removeEventListener('error', onError);
        currentWorker?.terminate();
        currentWorker = null;
      };

      currentWorker?.addEventListener('message', onMessage);
      currentWorker?.addEventListener('error', onError);
      currentWorker?.postMessage(input);
    });
  };

  const waitForResult = async (): Promise<TOutput | null> => {
    if (!currentPromise) return null;
    try {
      return await currentPromise;
    } finally {
      terminate();
    }
  };

  return {
    start,
    waitForResult,
    terminate
  };
}
