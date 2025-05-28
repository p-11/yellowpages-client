import { generatePQAddresses, Mnemonic24 } from '../cryptography';

addEventListener(
  'message',
  (event: MessageEvent<{ mnemonic24: Mnemonic24 }>) => {
    const result = generatePQAddresses(event.data.mnemonic24);
    event.data.mnemonic24 = '' as Mnemonic24;
    postMessage(result);
  }
);
