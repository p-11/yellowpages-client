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
 * - `waitForResult(): Promise<TOutput | null>`: Resolves with the result or null on error.
 * - `terminate()`: Cancels any running worker task and releases resources.
 */
function createWorkerTask<TInput, TOutput>(createWorker: () => Worker) {
  let worker: Worker | null = null;
  let resolvePromise: (() => void) | null = null;
  let promise: Promise<void> | null = null;
  let result: TOutput | null = null;

  const terminate = () => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    if (resolvePromise) {
      resolvePromise();
      resolvePromise = null;
    }
  };

  const start = (input: TInput) => {
    terminate();

    promise = new Promise<void>(resolve => {
      resolvePromise = resolve;
    });

    worker = createWorker();

    const cleanup = () => {
      if (worker) {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        worker.terminate();
        worker = null;
      }
      resolvePromise?.();
      resolvePromise = null;
    };

    const onMessage = (event: MessageEvent<TOutput>) => {
      result = event.data;
      cleanup();
    };

    const onError = () => {
      result = null;
      cleanup();
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);

    worker.postMessage(input);
  };

  const waitForResult = async (): Promise<TOutput | null> => {
    if (promise) {
      await promise;
    }
    const output = result;
    result = null;
    return output;
  };

  return {
    start,
    waitForResult,
    terminate
  };
}
