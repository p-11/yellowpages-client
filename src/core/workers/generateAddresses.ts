import { generateAddresses, Mnemonic24 } from '../cryptography';

addEventListener(
  'message',
  (event: MessageEvent<{ mnemonic24: Mnemonic24 }>) => {
    const input = event.data;
    const result = generateAddresses(input.mnemonic24);
    input.mnemonic24 = '' as Mnemonic24;
    postMessage(result);
  }
);
