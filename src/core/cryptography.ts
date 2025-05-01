import { mnemonicToSeedSync, generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha2';
import { ml_dsa44 } from '@noble/post-quantum/ml-dsa';
import {
  validate,
  getAddressInfo,
  Network,
  AddressType
} from 'bitcoin-address-validation';
import { verify as verifyBitcoinSignedMessage } from 'bitcoinjs-message';

/*
 * Supported Bitcoin Address Types
 */
const SUPPORTED_BITCOIN_ADDRESS_TYPES = [AddressType.p2pkh, AddressType.p2wpkh];

/*
 * Checks if a Bitcoin address is valid and supported
 *
 * @param address The Bitcoin address to validate
 * @returns {boolean} True if the address is valid and supported, false otherwise
 */
const isValidBitcoinAddress = (address: string): boolean => {
  const isValid = validate(address, Network.mainnet);
  const info = getAddressInfo(address);
  const isSupported = SUPPORTED_BITCOIN_ADDRESS_TYPES.includes(info.type);
  return isValid && isSupported;
};

/*
 * Verifies if a Bitcoin signed message is valid
 *
 * @param message The message to sign
 * @param signature The signature to verify
 * @param address The Bitcoin address to verify the signature with
 *
 * @returns {boolean} True if the signature is valid, false otherwise
 */
const isValidBitcoinSignature = (
  message: string,
  signedMessage: string,
  address: string
): boolean => {
  // bitcoin-js-message has a note on electrum support
  // https://www.npmjs.com/package/bitcoinjs-message#about-electrum-segwit-signature-support
  // as a result we must attempt to verify the signature with both methods
  // First try the “classic” verify (SegWit-aware flag = false) and short circuit if it succeeds
  try {
    if (verifyBitcoinSignedMessage(message, address, signedMessage)) {
      return true;
    }
  } catch {
    // swallow and fall through to next attempt
  }

  // If that failed (or threw because it was a segwit signature),
  // try with checkSegwitAlways = true
  try {
    return verifyBitcoinSignedMessage(
      message,
      address,
      signedMessage,
      '',
      true
    );
  } catch {
    return false;
  }
};

/*
 * Supported Algorithms
 */
enum PQ_SIGNATURE_ALGORITHM {
  /** ML-DSA-44 */
  // eslint-disable-next-line no-unused-vars
  ML_DSA_44 = 0
}

const PQ_ALGORITHM_BYTE_LENGTH = (algorithm: PQ_SIGNATURE_ALGORITHM) => {
  switch (algorithm) {
    case PQ_SIGNATURE_ALGORITHM.ML_DSA_44:
      return 32;
    default:
      throw new Error('Unsupported algorithm');
  }
};

/*
 * BIP-85 Constants
 */
const BIP85_PURPOSE = 83696968; // "BIPS" on phone keypad
const BIP85_HMAC_KEY = 'bip-entropy-from-k'; // from standard
// Set as an env var to pass BIP-85 test vectors
const DEFAULT_APP_NO = parseInt(process.env.BIP85_APP_NO ?? '703131', 10); // 703131 = P11 -> UTF-8

/*
 * Helper Function to convert bytes to base64
 */
function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Generate a seed phrase using the BIP-39 algorithm.
 * @returns {string} The generated seed phrase.
 */
const generateSeedPhrase = (): string => {
  return generateMnemonic(wordlist, 256);
};

/**
 * Ensure that the provided root is an HDKey instance.
 *
 * @param root HDKey or extended private key (xprv)
 * @returns HDKey instance
 */
const ensureXPrv = (root: HDKey | string) => {
  if (typeof root === 'string') {
    if (!root.startsWith('xprv')) {
      throw new Error('Expected an xprv extended key');
    }
    return HDKey.fromExtendedKey(root);
  }
  return root;
};

/**
 * Ensure that the provided mnemonic is a 24-word string.
 *
 * @param mnemonic The mnemonic to validate
 * @returns The validated mnemonic
 */
function ensure24WordMnemonic(mnemonic: string): string {
  const words = mnemonic.trim().split(/\s+/);
  if (words.length !== 24) {
    throw new Error(`Expected 24 words, got ${words.length}`);
  }
  return mnemonic;
}

/**
 * Derive raw entropy via BIP-85 from an HDKey master node (or its xprv).
 *
 * @param root     HDKey or extended private key (xprv)
 * @param derIndex We use the algorithm id here
 * @param length   # of bytes needed (e.g. 32 or 48)
 * @returns sliced HMAC-SHA512 output as Uint8Array
 */
const deriveBip85Entropy = ({
  root,
  derIndex,
  length
}: {
  root: HDKey | string;
  derIndex: number;
  length: number;
}): Uint8Array => {
  // Convert string xprv to HDKey if needed
  const master = ensureXPrv(root);
  // Derivation path for BIP-85
  const path = `m/${BIP85_PURPOSE}'/${DEFAULT_APP_NO}'/${derIndex}'`;
  const node = master.derive(path);
  const privKey = node.privateKey;
  if (!privKey) throw new Error('No private key at this path');
  // Apply BIP-85 HMAC-SHA512
  const full = hmac(sha512, BIP85_HMAC_KEY, privKey);
  // Return specified number of bytes
  return full.slice(0, length);
};

/**
 * From a 24-word mnemonic → BIP-39 seed → BIP-85 entropy for PQ algorithm.
 *
 * @param mnemonic24 24-word BIP-39 phrase
 * @param algorithm  which PQ_SIGNATURE_ALGORITHM enum to use
 * @returns Uint8Array of entropy ready for ml_dsa65.keygen or slh_dsa_sha2_128s.keygen
 */
const deriveEntropyFromMnemonic = ({
  mnemonic24,
  algorithm
}: {
  mnemonic24: string;
  algorithm: PQ_SIGNATURE_ALGORITHM;
}): Uint8Array => {
  // BIP-39 seed (64 bytes)
  const m = ensure24WordMnemonic(mnemonic24);
  const seed = mnemonicToSeedSync(m);
  // Master HDKey from that seed
  const masterNode = HDKey.fromMasterSeed(seed);
  // Get bytes length for PQ_SIGNATURE_ALGORITHM
  const length = PQ_ALGORITHM_BYTE_LENGTH(algorithm);
  // Use the algorithm’s numeric value as the derive-index
  return deriveBip85Entropy({
    root: masterNode,
    derIndex: algorithm,
    length: length
  });
};

/**
 * Generate a PQ keypair from a mnemonic.
 *
 * Wraps the switch in try/catch so any error in deriving entropy
 * or in keygen is caught and re-thrown with context.
 *
 * @param mnemonic24 24-word BIP-39 phrase
 * @param algorithm  which PQ_SIGNATURE_ALGORITHM enum to use
 */
const generateKeypair = (
  mnemonic24: string,
  algorithm: PQ_SIGNATURE_ALGORITHM
) => {
  try {
    switch (algorithm) {
      case PQ_SIGNATURE_ALGORITHM.ML_DSA_44: {
        const entropy = deriveEntropyFromMnemonic({ mnemonic24, algorithm });
        const keypair = ml_dsa44.keygen(entropy);
        return {
          publicKey: keypair.publicKey,
          privateKey: keypair.secretKey,
          address: 'temp_address_as_no_encoding'
        };
      }
      default:
        // unsupported algorithm enum
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (err: any) {
    const name = PQ_SIGNATURE_ALGORITHM[algorithm] ?? algorithm;
    throw new Error(`Error generating ${name} keypair: ${err.message || err}`);
  }
};

/**
 * Signed Message types
 */
interface SignedMessage {
  publicKey: string;
  signedMessage: string;
  address: string;
}

type SignedMessages = {
  [_key in keyof typeof PQ_SIGNATURE_ALGORITHM]: SignedMessage;
};

/**
 * Sign a UTF-8 string with every supported PQ_SIGNATURE_ALGORITHM,
 * returning an object keyed by algorithm name.
 *
 * @param mnemonic24 24-word BIP-39 phrase
 * @param message the UTF-8 string to sign
 * @returns Record where each key is the enum name (e.g. "ML_DSA_44")
 * @throws if any step fails for any algorithm
 */
const generateSignedMessages = (
  mnemonic24: string,
  message: string
): SignedMessages => {
  try {
    const messageBytes = new TextEncoder().encode(message);

    // ML-DSA-44
    const mldsa44KeyPair = generateKeypair(
      mnemonic24,
      PQ_SIGNATURE_ALGORITHM.ML_DSA_44
    );
    const mldsa44SignedMessage = ml_dsa44.sign(
      mldsa44KeyPair.privateKey,
      messageBytes
    );
    // Best effort to zero out private key
    mldsa44KeyPair.privateKey.fill(0);

    // Response
    return {
      ML_DSA_44: {
        publicKey: bytesToBase64(mldsa44KeyPair.publicKey),
        signedMessage: bytesToBase64(mldsa44SignedMessage),
        address: mldsa44KeyPair.address
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new Error(`Error signing: ${err.message || err}`);
  }
};

export {
  generateSeedPhrase,
  generateSignedMessages,
  deriveBip85Entropy,
  isValidBitcoinAddress,
  isValidBitcoinSignature
};
