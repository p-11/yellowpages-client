import type {
  BitcoinAddress,
  Mnemonic24,
  PQAddress,
  SignedMessages
} from './cryptography';

export const createSignedMessagesWorker = () => {
  let worker: Worker | null = null;

  const run = async (
    mnemonic24: Mnemonic24,
    bitcoinAddress: BitcoinAddress
  ) => {
    return new Promise<SignedMessages>((resolve, reject) => {
      if (worker) terminate();

      worker = new Worker(
        new URL('./workers/generateSignedMessages.ts', import.meta.url),
        {
          type: 'module'
        }
      );

      try {
        worker.addEventListener(
          'message',
          (event: MessageEvent<SignedMessages>) => {
            resolve(event.data);
            terminate();
          }
        );

        worker.addEventListener('error', err => {
          reject(err);
          terminate();
        });

        worker.postMessage({ mnemonic24, bitcoinAddress });
      } catch (err) {
        reject(err);
        terminate();
      }
    });
  };

  const terminate = () => {
    worker?.terminate();
    worker = null;
  };

  return {
    run,
    terminate
  };
};

export const createGenerateAddressesWorker = () => {
  let worker: Worker | null = null;

  const run = async (mnemonic24: Mnemonic24) => {
    return new Promise<{
      mldsa44Address: PQAddress;
      slhdsaSha2S128Address: PQAddress;
    }>((resolve, reject) => {
      if (worker) terminate();

      worker = new Worker(
        new URL('./workers/generateAddresses.ts', import.meta.url),
        {
          type: 'module'
        }
      );

      try {
        worker.addEventListener(
          'message',
          (
            event: MessageEvent<{
              mldsa44Address: PQAddress;
              slhdsaSha2S128Address: PQAddress;
            }>
          ) => {
            resolve(event.data);
            terminate();
          }
        );

        worker.addEventListener('error', err => {
          reject(err);
          terminate();
        });

        worker.postMessage({ mnemonic24 });
      } catch (err) {
        reject(err);
        terminate();
      }
    });
  };

  const terminate = () => {
    worker?.terminate();
    worker = null;
  };

  return {
    run,
    terminate
  };
};
