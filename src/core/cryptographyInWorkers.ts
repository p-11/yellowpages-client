import type { Mnemonic24, PQAddress, SignedMessages } from './cryptography';

export const generateSignedMessagesInWorker = async (
  mnemonic24: Mnemonic24,
  bitcoinAddress: string
) => {
  return new Promise<SignedMessages>((resolve, reject) => {
    const worker = new Worker(
      new URL('./workers/generateSignedMessages.ts', import.meta.url),
      {
        type: 'module'
      }
    );

    worker.addEventListener(
      'message',
      (event: MessageEvent<SignedMessages>) => {
        resolve(event.data);
        worker.terminate();
      }
    );

    worker.addEventListener('error', err => {
      reject(err);
      worker.terminate();
    });

    worker.postMessage({ mnemonic24, bitcoinAddress });
  });
};

export const generateAddressesInWorker = async (mnemonic24: Mnemonic24) => {
  return new Promise<{
    mldsa44Address: PQAddress;
    slhdsaSha2S128Address: PQAddress;
  }>((resolve, reject) => {
    const worker = new Worker(
      new URL('./workers/generateAddresses.ts', import.meta.url),
      {
        type: 'module'
      }
    );

    worker.addEventListener(
      'message',
      (
        event: MessageEvent<{
          mldsa44Address: PQAddress;
          slhdsaSha2S128Address: PQAddress;
        }>
      ) => {
        resolve(event.data);
        worker.terminate();
      }
    );

    worker.addEventListener('error', err => {
      reject(err);
      worker.terminate();
    });

    worker.postMessage({ mnemonic24 });
  });
};
