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
    const result = generatePQSignedMessages(
      event.data.mnemonic24,
      event.data.bitcoinAddress
    );
    // zero out sensitive event data
    event.data.mnemonic24 = '' as Mnemonic24;
    postMessage(result);
  }
);
