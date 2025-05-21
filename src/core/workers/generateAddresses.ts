import { generateAddresses, Mnemonic24 } from '../cryptography';

addEventListener(
  'message',
  (event: MessageEvent<{ mnemonic24: Mnemonic24 }>) => {
    const input = event.data;
    const result = generateAddresses(input.mnemonic24);
    postMessage(result);
  }
);
