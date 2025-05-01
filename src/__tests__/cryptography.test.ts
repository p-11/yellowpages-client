import {
  generateSeedPhrase,
  generateSignedMessages,
  deriveBip85Entropy,
  isValidBitcoinAddress,
  isValidBitcoinSignature
} from './../core/cryptography';
import { utf8ToBytes } from '@noble/post-quantum/utils';
import { ml_dsa44 } from '@noble/post-quantum/ml-dsa';

// Helper function to convert base64 to bytes
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Helper: convert Uint8Array to hex string
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

describe('crypto module', () => {
  const mnemonic = generateSeedPhrase();

  test('mnemonic is 24 words', () => {
    expect(mnemonic.split(/\s+/)).toHaveLength(24);
  });

  test('ML_DSA_44 signed message is valid', () => {
    const msg = 'hello world';
    const signedMessages = generateSignedMessages(mnemonic, msg);
    // Convert base64 strings to byte arrays
    const messageBytes = utf8ToBytes(msg);
    const publicKeyBytes = base64ToBytes(signedMessages.ML_DSA_44.publicKey);
    const signedMessageBytes = base64ToBytes(
      signedMessages.ML_DSA_44.signedMessage
    );
    // Verify the signed message
    const isValid = ml_dsa44.verify(
      publicKeyBytes,
      messageBytes,
      signedMessageBytes
    );
    expect(isValid).toBe(true);
  });

  describe('BIP-85 entropy derivation', () => {
    const TEST_XPRV =
      'xprv9s21ZrQH143K2LBWUUQRFXhucrQqBpKdRRxNVq2zBqsx8HVqFk2uYo8kmbaLLHRdqtQpUm98uKfu3vca1LqdGhUtyoFnCNkfmXRyPXLjbKb';

    test('index 0, length 64', () => {
      const entropy = deriveBip85Entropy({
        root: TEST_XPRV,
        derIndex: 0,
        length: 64
      });
      const hex = toHex(entropy);
      expect(hex).toBe(
        'efecfbccffea313214232d29e71563d941229afb4338c21f9517c41aaa0d16f00b83d2a09ef747e7a64e8e2bd5a14869e693da66ce94ac2da570ab7ee48618f7'
      );
    });

    test('index 1, length 64', () => {
      const entropy = deriveBip85Entropy({
        root: TEST_XPRV,
        derIndex: 1,
        length: 64
      });
      const hex = toHex(entropy);
      expect(hex).toBe(
        '70c6e3e8ebee8dc4c0dbba66076819bb8c09672527c4277ca8729532ad711872218f826919f6b67218adde99018a6df9095ab2b58d803b5b93ec9802085a690e'
      );
    });
  });

  describe('Bitcoin address validation', () => {
    // P2PKH
    test('passes for P2PKH address', () => {
      const address = '17VZNX1SN5NtKa8UQFxwQbFeFc3iqRYhem';
      expect(isValidBitcoinAddress(address)).toBe(true);
    });
    test('fails for P2PKH testnet address', () => {
      const address = 'mx6h8cxmRiMFFcBpa1GUMg2xCQkEfLVxT6';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });

    // P2WPKH
    test('passes for P2WPKH address', () => {
      const address = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
      expect(isValidBitcoinAddress(address)).toBe(true);
    });
    test('fails for P2WPKH testnet address', () => {
      const address = 'tb1qkh3hlq7lvlu2ga5gdmclgppqrqn79c8myz3uzx';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });

    // P2SH
    test('fails for P2SH address', () => {
      const address = '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });
    test('fails for P2SH testnet address', () => {
      const address = '2N3QUuXmP1nb5U81gRJXLNxNX72EnFC9mUP';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });

    // P2WSH
    test('fails for P2WSH address', () => {
      const address =
        'bc1qeqye4kftje0n0v7thznwfumfqae5e7nlueewd7l2gxgq0kgu3zds2expml';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });
    test('fails for P2WSH testnet address', () => {
      const address =
        'tb1qtaaht82ct50ufdnl5xyr6mrxdmstxtxc62uvvqk733ctp4t92esqf4gkfk';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });

    // P2TR
    test('fails for P2TR address', () => {
      const address =
        'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });
    test('fails for P2TR testnet address', () => {
      const address =
        'tb1ptp7ys2n3xmt3va9mczcalqva47y73ka3jnmg35l4wdc83sms2xcs0kv4vl';
      expect(isValidBitcoinAddress(address)).toBe(false);
    });
  });

  describe('Bitcoin signed message validation', () => {
    test('passes for P2PKH signed message', () => {
      const address = '1M36YGRbipdjJ8tjpwnhUS5Njo2ThBVpKm';
      const signedMessage =
        'IE1Eu4G/OO+hPFd//epm6mNy6EXoYmzY2k9Dw4mdDRkjL9wYE7GPFcFN6U38tpsBUXZlNVBZRSeLrbjrgZnkJ1I=';
      const message = 'hello world';
      const res = isValidBitcoinSignature(message, signedMessage, address);
      expect(res).toBe(true);
    });

    test('passes for P2WPKH signed message', () => {
      const address = 'bc1qqylnmgkvfa7t68e7a7m3ms2cs9xu6kxtzemdre';
      const signedMessage =
        'H079G3RGX1L4T7+4XN5lB+vMmrP1Pfxf2ExVFDWB042JXS0E9gu+te+1sYDsthUlc6yv0V8O3ctr9i19tCfkjjk=';
      const message = 'hello world';
      const res = isValidBitcoinSignature(message, signedMessage, address);
      expect(res).toBe(true);
    });

    test('fails for incorrect P2PKH signed message', () => {
      const address = '1M36YGRbipdjJ8tjpwnhUS5Njo2ThBVpKm';
      const signedMessage =
        'IE1Eu4G/OO+hPFd//epm6mNy6EXoYmzY2k9Dw4mdDRkjL9wYE7GPFcFN6U38tpsBUXZlNVBZRSeLrbjrgZnkJ1I=';
      const message = 'hello world!';
      const res = isValidBitcoinSignature(message, signedMessage, address);
      expect(res).toBe(false);
    });

    test('fails for incorrect P2WPKH signed message', () => {
      const address = 'bc1qqylnmgkvfa7t68e7a7m3ms2cs9xu6kxtzemdre';
      const signedMessage =
        'H079G3RGX1L4T7+4XN5lB+vMmrP1Pfxf2ExVFDWB042JXS0E9gu+te+1sYDsthUlc6yv0V8O3ctr9i19tCfkjjk=';
      const message = 'hello world!';
      const res = isValidBitcoinSignature(message, signedMessage, address);
      expect(res).toBe(false);
    });
  });
});
