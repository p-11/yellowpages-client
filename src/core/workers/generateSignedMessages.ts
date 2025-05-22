import { generateSignedMessages, Mnemonic24 } from '../cryptography';

addEventListener(
  'message',
  (event: MessageEvent<{ mnemonic24: Mnemonic24; bitcoinAddress: string }>) => {
    const input = event.data;
    const result = generateSignedMessages(
      input.mnemonic24,
      input.bitcoinAddress
    );
    input.mnemonic24 = '' as Mnemonic24;
    postMessage(result);
  }
);
