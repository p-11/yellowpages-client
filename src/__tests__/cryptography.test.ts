import {
  generateSeedPhrase,
  generateMessage,
  generateSignedMessages,
  generateKeypair,
  deriveBip85Entropy,
  isValidBitcoinAddress,
  isValidBitcoinSignature,
  Message,
  SignedMessage,
  BitcoinAddress,
  Mnemonic24,
  generateMlKem768Keypair,
  deriveMlKem768SharedSecret,
  destroyMlKem768Keypair,
  ML_KEM_768_CIPHERTEXT_SIZE,
  ML_KEM_768_DECAPSULATION_KEY_SIZE,
  MlKem768CiphertextBytes
} from './../core/cryptography';
import { ml_dsa44 } from '@noble/post-quantum/ml-dsa';
import { ml_kem768 } from '@noble/post-quantum/ml-kem';
import { HDKey } from '@scure/bip32';
import { randomBytes } from '@noble/hashes/utils';
import { base64 } from '@scure/base';

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

  test('ML_DSA_44 key pair generation is deterministic', () => {
    const mnemonic =
      'abstract reform twelve inspire cry master vague skirt mention ill velvet nice limit input present old equip double best doctor decrease survey spray wife' as Mnemonic24;
    const keyPair = generateKeypair(mnemonic, 0);
    const privateKey =
      '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';
    const publicKey =
      'e+ffcul9XkuQCkiCEYX2ES6KMGJ9c7+Z0PFfhnJRckbaHzh4EH9hcEkUoFZ4gK2ta6/xPzgxB1yTT92wPZw8SmrK3DeLMz9mkst0IWkSzJ/TPPHRcSYJekO+CLV8k7uXsGSSoK4fbLqkX8leQFMCzjzRYg06zb3SD7iQwK3O8dP2WWLa9PkBMl1LECCBtTHrxoqyYtKopNbn3wICOOxI1jjTTL46AZnE6Vw2vQdLB/Qg59Pq6su8P3zEqBbsVPwPpT9ZbBNCHE+puWjdYnOfttj6DZ748CRHibQ9WTkH+VpxssIxU62nsYes/fV85nDozwddZggZoLfRsmSlG1Yz6h4m5hMMu9Nku9myTTw4UCiGSxZmad+yIjl7hh6J3wDaLMDA6SXajLSXTk2RwmnsEUlYs+uXS6Wj5wzg+bLQDQVMkU+doOf4vPTArf4uwzJdZ9Ghp8vjHd+rQgKjuo+Hy+HWz4JgvaQXlln+3yF0eY4/v01Bhe8BwVCbFZX8ts2Ay53gJmZEtsnXw3d5xedAMO9LJt4UqwovnmWCuApzAG9jyvG3Wxxe572E725S4vLtgnESzfrsD3wWo/A0oP+wk4oOFjhRDdVwHzwBDiHPhl43b/lt6omQuxK+xF0BJ77X/VhAoCx5zwIQ1GnmtXmP5xqx8f+e9ceFWNSxBPVKakKx/BveCxF1uOLc7DZUFLDVxRBURiF4BQX/670+FaYF2BWS3XtxfCqxaCz3F177qUev3pYuwpvSIj6WNSmU8uyxvibSzvYtA50gQtznTfteWja14B8AB+rgagz5nEzRzO7u1+QmxbdvEyBKvmWzNtnvsNqee4LhU9sl6rPdyUScmDrCPVLiPhrqY/sBVfxzX6z40suflYFPYU+fE6lApXnpyDB8he25DmnmPYTEsCq9d2uYaYTSBAgeir0qi9Jnjj/mcJ/3sNwwTlh7Tp6ahJlqWEUJ4myGxcHEesgWAeIrqJ6bhHTxP1n+do4ffry4CMcAjoAPAwYY0JUTYANy722LbOgiN+z5KUryC/MYjw/azOHFcpYjsGR60fARG03yVBgNBuD5okkmxtrAGdS4w85UDMAa/dwobUI5bdigFHP0Av6hHQ5uxeaxt1gAO53veGmA8aIOidhtZyHhlv+ANl9VYyZMOdPP1DjBTd8AQTIGR2JglmGzE8/00Ndx736MNdVzxNG0iKOvLlgl3cd1cEjW6hfC47juSDCgZTs9oPeo2mr1qvtak7zVd/yByjP9KHh0mjCi3cZDButaTe/oic4bdf24xQDtahSEJpAf49i9gzIpqxG92pyM7HRaVSvScFmCNnNKLJSDCeYw4+zlU+jawGKPjX6ebFDGFV1gNiPvkZdYd/5UXFwpHt5saj/Lgfoe/BtJWUx53TNkYlTNytflgV/ssFo8k9aYlIq2SDDKeZdlZexeNJOvhr8yntOQzLK6WWVONUgilTFNKX3+NQTmMR1LhA7VSP17+/3NjM0wEaz/JpKRoqMMvrgzl2A/6s019UMoT81hGXNtk9Ed8vxtdeNi1BC+SHWWyazundxXMQ4/gD7PnJXQJduz0QZ8quxRQZZTn+u+t1hKyMQikRKqephJaIQv9NLnKffPncEii9ukfRuLLCy7hPFuAho1Bfgi6rJMN0AxlX9URe6LB6vjLMNdTvWVqCHtBvay4scJg58my00razBF8BhQe7db+UJiv5JwADSJ2fwO/oooReksH3Sv1U4UOx5Y7kK8bbChFg==';
    const address =
      'rh1qpqg39uw700gcctpahe650p9zlzpnjt60cpz09m4kx7ncz8922635hsmmfzpd';
    expect(base64.encode(keyPair.privateKey)).toEqual(privateKey);
    expect(base64.encode(keyPair.publicKey)).toEqual(publicKey);
    expect(keyPair.address).toEqual(address);
  });

  test('ML_DSA_44 key pair signing is deterministic', () => {
    const bitcoinAddress = '1M36YGRbipdjJ8tjpwnhUS5Njo2ThBVpKm';
    const signedMessagesOne = generateSignedMessages(mnemonic, bitcoinAddress);
    const signedMessagesTwo = generateSignedMessages(mnemonic, bitcoinAddress);
    expect(signedMessagesOne.ML_DSA_44.publicKey).toEqual(
      signedMessagesTwo.ML_DSA_44.publicKey
    );
    expect(signedMessagesOne.ML_DSA_44.signedMessage).toEqual(
      signedMessagesTwo.ML_DSA_44.signedMessage
    );
  });

  test('message generation', () => {
    const bitcoinAddress = 'btc';
    const mldsa44Address = 'mldsa44';
    const { message, messageBytes } = generateMessage({
      bitcoinAddress: bitcoinAddress,
      mldsa44Address: mldsa44Address
    });
    expect(message).toEqual(
      'I want to permanently link my Bitcoin address btc with my post-quantum address mldsa44'
    );
    expect(messageBytes.length).toEqual(86);
  });

  test('ML_DSA_44 signed message is valid', () => {
    const bitcoinAddress = '1M36YGRbipdjJ8tjpwnhUS5Njo2ThBVpKm';
    const signedMessages = generateSignedMessages(mnemonic, bitcoinAddress);
    // Convert base64 strings to byte arrays
    const { messageBytes } = generateMessage({
      bitcoinAddress: bitcoinAddress,
      mldsa44Address: signedMessages.ML_DSA_44.address
    });
    const publicKeyBytes = base64.decode(signedMessages.ML_DSA_44.publicKey);
    const signedMessageBytes = base64.decode(
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
        root: HDKey.fromExtendedKey(TEST_XPRV),
        derIndex: 0,
        entropyLength: 64
      });
      const hex = toHex(entropy);
      expect(hex).toBe(
        'efecfbccffea313214232d29e71563d941229afb4338c21f9517c41aaa0d16f00b83d2a09ef747e7a64e8e2bd5a14869e693da66ce94ac2da570ab7ee48618f7'
      );
    });

    test('index 1, length 64', () => {
      const entropy = deriveBip85Entropy({
        root: HDKey.fromExtendedKey(TEST_XPRV),
        derIndex: 1,
        entropyLength: 64
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
      const address = '1M36YGRbipdjJ8tjpwnhUS5Njo2ThBVpKm' as BitcoinAddress;
      const signedMessage =
        'IE1Eu4G/OO+hPFd//epm6mNy6EXoYmzY2k9Dw4mdDRkjL9wYE7GPFcFN6U38tpsBUXZlNVBZRSeLrbjrgZnkJ1I=' as SignedMessage;
      const message = 'hello world' as Message;
      const res = isValidBitcoinSignature(message, signedMessage, address);
      expect(res).toBe(true);
    });

    test('passes for P2WPKH signed message', () => {
      const address =
        'bc1qqylnmgkvfa7t68e7a7m3ms2cs9xu6kxtzemdre' as BitcoinAddress;
      const signedMessage =
        'H079G3RGX1L4T7+4XN5lB+vMmrP1Pfxf2ExVFDWB042JXS0E9gu+te+1sYDsthUlc6yv0V8O3ctr9i19tCfkjjk=' as SignedMessage;
      const message = 'hello world' as Message;
      const res = isValidBitcoinSignature(message, signedMessage, address);
      expect(res).toBe(true);
    });

    test('fails for incorrect P2PKH signed message', () => {
      const address = '1M36YGRbipdjJ8tjpwnhUS5Njo2ThBVpKm' as BitcoinAddress;
      const signedMessage =
        'IE1Eu4G/OO+hPFd//epm6mNy6EXoYmzY2k9Dw4mdDRkjL9wYE7GPFcFN6U38tpsBUXZlNVBZRSeLrbjrgZnkJ1I=' as SignedMessage;
      const message = 'hello world!' as Message;
      const res = isValidBitcoinSignature(message, signedMessage, address);
      expect(res).toBe(false);
    });

    test('fails for incorrect P2WPKH signed message', () => {
      const address =
        'bc1qqylnmgkvfa7t68e7a7m3ms2cs9xu6kxtzemdre' as BitcoinAddress;
      const signedMessage =
        'H079G3RGX1L4T7+4XN5lB+vMmrP1Pfxf2ExVFDWB042JXS0E9gu+te+1sYDsthUlc6yv0V8O3ctr9i19tCfkjjk=' as SignedMessage;
      const message = 'hello world!' as Message;
      const res = isValidBitcoinSignature(message, signedMessage, address);
      expect(res).toBe(false);
    });
  });
});

describe('ML-KEM-768 operations', () => {
  test('generateMlKem768Keypair generates valid keypair', () => {
    const keypair = generateMlKem768Keypair();
    
    // Check that keypair has expected properties
    expect(keypair).toHaveProperty('encapsulationKey');
    expect(keypair).toHaveProperty('decapsulationKey');
    
    // Check key sizes
    expect(keypair.decapsulationKey.length).toBe(ML_KEM_768_DECAPSULATION_KEY_SIZE);
    expect(keypair.encapsulationKey.length).toBeGreaterThan(0);
    
    // Check that keys contain data (not all zeros)
    expect(keypair.encapsulationKey.some(byte => byte !== 0)).toBe(true);
    expect(keypair.decapsulationKey.some(byte => byte !== 0)).toBe(true);
  });

  test('destroyMlKem768Keypair zeroes out key material', () => {
    const keypair = generateMlKem768Keypair();
    
    // Verify keys have data before destruction
    expect(keypair.encapsulationKey.some(byte => byte !== 0)).toBe(true);
    expect(keypair.decapsulationKey.some(byte => byte !== 0)).toBe(true);
    
    // Destroy the keypair
    destroyMlKem768Keypair(keypair);
    
    // Verify all bytes are now zero
    expect(keypair.encapsulationKey.every(byte => byte === 0)).toBe(true);
    expect(keypair.decapsulationKey.every(byte => byte === 0)).toBe(true);
  });

  test('end-to-end ML-KEM-768 key exchange', () => {
    // Create a keypair for the test
    const aliceKeypair = generateMlKem768Keypair();
    
    // Clone the keypair to test against (since the original will be destroyed)
    const aliceKeypairClone = {
      encapsulationKey: new Uint8Array(aliceKeypair.encapsulationKey),
      decapsulationKey: new Uint8Array(aliceKeypair.decapsulationKey)
    };
    
    // Bob uses Alice's encapsulation key to create a ciphertext and shared secret
    const bobResult = ml_kem768.encapsulate(aliceKeypairClone.encapsulationKey);
    
    // Convert to branded type for the function
    const ciphertextBytes = bobResult.cipherText as MlKem768CiphertextBytes;
    
    // Verify ciphertext has correct length
    expect(ciphertextBytes.length).toBe(ML_KEM_768_CIPHERTEXT_SIZE);
    
    // Mock a try-catch to test if deriveMlKem768SharedSecret completes without error
    let error: Error | null = null;
    try {
      deriveMlKem768SharedSecret(ciphertextBytes, aliceKeypair);
    } catch (e) {
      error = e as Error;
    }
    
    // Verify no error was thrown
    expect(error).toBeNull();
    
    // Verify keypair was destroyed by deriveMlKem768SharedSecret
    expect(aliceKeypair.encapsulationKey.every(byte => byte === 0)).toBe(true);
    expect(aliceKeypair.decapsulationKey.every(byte => byte === 0)).toBe(true);
    
    // We don't test the actual shared secret value, as it's destroyed inside the function
  });

  test('base64 encoding and decoding round trip works', () => {
    // Generate random test data using randomBytes
    const original = randomBytes(32);
    
    // Convert to base64 and back
    const base64Str = base64.encode(original);
    const roundTrip = base64.decode(base64Str);
    
    // Verify the round trip produces the same bytes
    expect(Array.from(roundTrip)).toEqual(Array.from(original));
  });

  test('deriveMlKem768SharedSecret throws on invalid ciphertext size', () => {
    const keypair = generateMlKem768Keypair();
    const invalidCiphertext = new Uint8Array(ML_KEM_768_CIPHERTEXT_SIZE - 1) as MlKem768CiphertextBytes;
    
    expect(() => {
      deriveMlKem768SharedSecret(invalidCiphertext, keypair);
    }).toThrow(/Invalid ML-KEM-768 ciphertext byte length/);
    
    // Keypair should still be destroyed even though an error was thrown
    expect(keypair.encapsulationKey.every(byte => byte === 0)).toBe(true);
    expect(keypair.decapsulationKey.every(byte => byte === 0)).toBe(true);
  });
});
