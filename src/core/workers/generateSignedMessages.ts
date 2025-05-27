import {
  BitcoinAddress,
  generatePQSignedMessages,
  Mnemonic24
} from '../cryptography';

addEventListener(
  'message',
  (
    event: MessageEvent<{
      mnemonic24: Mnemonic24;
      bitcoinAddress: BitcoinAddress;
    }>
  ) => {
    const input = event.data;
    const result = generatePQSignedMessages(
      input.mnemonic24,
      input.bitcoinAddress
    );
    input.mnemonic24 = '' as Mnemonic24;
    postMessage(result);
  }
);
