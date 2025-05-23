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

function createWorkerTask<TInput, TOutput>(createWorkerFn: () => Worker) {
  let worker: Worker | null = null;
  let resolveFn: (() => void) | null = null;
  let promise: Promise<void> | null = null;
  let result: TOutput | null = null;

  const terminate = () => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    if (resolveFn) {
      resolveFn();
      resolveFn = null;
    }
  };

  const start = (input: TInput) => {
    terminate();

    promise = new Promise<void>(resolve => {
      resolveFn = resolve;
    });

    worker = createWorkerFn();

    const cleanup = () => {
      if (worker) {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        worker.terminate();
        worker = null;
      }
      resolveFn?.();
      resolveFn = null;
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
