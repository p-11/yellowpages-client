import { mnemonicToSeedSync, generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha2';
import { ml_dsa44 } from '@noble/post-quantum/ml-dsa';
import { slh_dsa_sha2_128s } from '@noble/post-quantum/slh-dsa';
import { ml_kem768 } from '@noble/post-quantum/ml-kem';
import { gcm } from '@noble/ciphers/aes.js';
import { randomBytes } from '@noble/ciphers/webcrypto.js';
import {
  validate,
  getAddressInfo,
  Network,
  AddressType
} from 'bitcoin-address-validation';
import { verify as verifyBitcoinSignedMessage } from 'bitcoinjs-message';
import {
  encodeAddress,
  Network as PQAddressNetwork,
  Version,
  PubKeyType
} from '@project-eleven/pq-address';
import { base64 } from '@scure/base';

// Get Environment
const IS_PROD = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

/*
 * Constants for ML-KEM-768
 */
const ML_KEM_768_CIPHERTEXT_SIZE = 1088; // Size in bytes
const ML_KEM_768_DECAPSULATION_KEY_SIZE = 2400; // Size in bytes
const ML_KEM_768_SHARED_SECRET_SIZE = 32; // Size in bytes
const AES_256_GCM_KEY_SIZE = 32; // 256 bits = 32 bytes
const AES_256_GCM_NONCE_SIZE = 12; // 96 bits = 12 bytes
// Base64 encoding increases size by approximately 4/3
const MAX_BASE64_ML_KEM_768_CIPHERTEXT_SIZE = Math.ceil(
  ML_KEM_768_CIPHERTEXT_SIZE * 1.4
);

/*
 * Types
 */

/**
 * Generic branding utility
 * **/
type Brand<T, B> = T & { readonly __brand: B };

/** Strongly-typed aliases **/
export type Mnemonic24 = Brand<string, 'Mnemonic24'>;
export type BitcoinAddress = Brand<string, 'BitcoinAddress'>;
export type SignedMessage = Brand<string, 'SignedMessage'>;
export type Message = Brand<string, 'Message'>;
export type PQPublicKey = Brand<Uint8Array, 'PQPublicKey'>;
export type PQPublicKeyString = Brand<string, 'PQPublicKeyString'>;
export type PQPrivateKey = Brand<Uint8Array, 'PQPrivateKey'>;
export type PQAddress = Brand<string, 'PQAddress'>;
export type MlKem768CiphertextBytes = Brand<
  Uint8Array,
  'MlKem768CiphertextBytes'
>;
export type ProofRequestBytes = Brand<Uint8Array, 'ProofRequestBytes'>;

const SUPPORTED_BITCOIN_ADDRESS_TYPES: ReadonlyArray<AddressType> = [
  AddressType.p2pkh,
  AddressType.p2wpkh
];

export type MlKem768Keypair = {
  encapsulationKey: Uint8Array; // Public key used for encapsulation (formerly publicKey)
  decapsulationKey: Uint8Array; // Secret key used for decapsulation (formerly secretKey)
};

/*
 * Supported Algorithms
 */
enum PQ_SIGNATURE_ALGORITHM {
  /** ML-DSA-44 */
  // eslint-disable-next-line no-unused-vars
  ML_DSA_44 = 0,
  /**
   * TEST_ALGO
   * This is used as this index is needed for BIP-85 test vectors
   */
  // eslint-disable-next-line no-unused-vars
  TEST_ALGO = 1,
  /** SLH-DSA-SHA2-S-128 */
  // eslint-disable-next-line no-unused-vars
  SLH_DSA_SHA2_S_128 = 2
}

/*
 * Supported Algorithms Seed length
 */
const PQ_ALGO_CONFIG = {
  /** ML-DSA-44 */
  [PQ_SIGNATURE_ALGORITHM.ML_DSA_44]: {
    entropyLength: 32,
    pubkeyType: PubKeyType.MlDsa44
  },
  /**
   * TEST_ALGO
   * This is used as this length is needed for BIP-85 test vectors
   */
  [PQ_SIGNATURE_ALGORITHM.TEST_ALGO]: {
    entropyLength: 64,
    pubkeyType: PubKeyType.MlDsa44 // this can be anything
  },
  /** SLH-DSA-SHA2-S-128 */
  [PQ_SIGNATURE_ALGORITHM.SLH_DSA_SHA2_S_128]: {
    entropyLength: 48,
    pubkeyType: PubKeyType.SlhDsaSha2S128
  }
} as const;

/*
 * BIP-85 Constants
 */
const BIP85_PURPOSE = 83696968; // "BIPS" on phone keypad
const BIP85_HMAC_KEY = 'bip-entropy-from-k'; // from standard
// Set as an env var to pass BIP-85 test vectors
const DEFAULT_APP_NO = parseInt(process.env.BIP85_APP_NO ?? '503131', 10); // 503131 = P11 -> UTF-8

/**
 * Generate an ML-KEM-768 key pair for post-quantum key encapsulation
 * @returns {MlKem768Keypair} The key pair containing encapsulationKey and decapsulationKey
 */
function generateMlKem768Keypair(): MlKem768Keypair {
  try {
    const keyPair = ml_kem768.keygen();
    return {
      encapsulationKey: keyPair.publicKey,
      decapsulationKey: keyPair.secretKey
    };
  } catch (error) {
    throw new Error(
      `Failed to generate ML-KEM-768 keypair: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Derive a shared secret using ML-KEM-768 decapsulation
 * @param ciphertextBytes The ciphertext bytes from the server
 * @param keypair The ML-KEM-768 keypair - will be completely zeroed out after use
 */
function deriveMlKem768SharedSecret(
  ciphertextBytes: MlKem768CiphertextBytes,
  keypair: MlKem768Keypair
): Uint8Array {
  let sharedSecret: Uint8Array | undefined;

  try {
    // Validate ciphertext length
    if (ciphertextBytes.length !== ML_KEM_768_CIPHERTEXT_SIZE) {
      throw new Error(
        `Invalid ML-KEM-768 ciphertext byte length: expected ${ML_KEM_768_CIPHERTEXT_SIZE}, got ${ciphertextBytes.length}`
      );
    }

    // Validate decapsulation key length
    if (keypair.decapsulationKey.length !== ML_KEM_768_DECAPSULATION_KEY_SIZE) {
      throw new Error(
        `Invalid ML-KEM-768 decapsulation key length: expected ${ML_KEM_768_DECAPSULATION_KEY_SIZE}, got ${keypair.decapsulationKey.length}`
      );
    }

    // Derive the shared secret
    sharedSecret = ml_kem768.decapsulate(
      ciphertextBytes,
      keypair.decapsulationKey
    );

    // Verify shared secret has the correct length
    if (
      !sharedSecret ||
      sharedSecret.length !== ML_KEM_768_SHARED_SECRET_SIZE
    ) {
      throw new Error(
        `Invalid ML-KEM-768 shared secret length: expected ${ML_KEM_768_SHARED_SECRET_SIZE}, got ${sharedSecret?.length ?? 'undefined'}`
      );
    }

    return sharedSecret;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to derive ML-KEM-768 shared secret: ${errorMessage}`
    );
  } finally {
    destroyMlKem768Keypair(keypair);
  }
}

/**
 * Securely destroy an ML-KEM-768 keypair by zeroing out all key material
 * @param keypair The keypair to destroy - both keys will be zeroed out
 */
function destroyMlKem768Keypair(keypair: MlKem768Keypair): void {
  // Zero out both keys
  keypair.encapsulationKey.fill(0);
  keypair.decapsulationKey.fill(0);
}

/*
 * Checks if a Bitcoin address is valid and supported
 *
 * @param address The Bitcoin address to validate
 * @returns {boolean} True if the address is valid and supported, false otherwise
 */
const isValidBitcoinAddress = (address: string): boolean => {
  const isValid = validate(address, Network.mainnet);

  if (!isValid) {
    return false;
  }

  const info = getAddressInfo(address);
  const isSupported = SUPPORTED_BITCOIN_ADDRESS_TYPES.includes(info.type);

  return isSupported;
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
  message: Message,
  signedMessage: SignedMessage,
  address: BitcoinAddress
): boolean => {
  // bitcoin-js-message has a note on electrum support
  // https://www.npmjs.com/package/bitcoinjs-message#about-electrum-segwit-signature-support
  // as a result we must attempt to verify the signature with both methods
  // First try the "classic" verify (SegWit-aware flag = false) and short circuit if it succeeds
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
      // Note that '' corresponds to a message prefix
      // and setting to null defaults to Bitcoin messagePrefix
      '',
      true
    );
  } catch {
    return false;
  }
};

/*
 * Generate PQ address from public key bytes
 */
const generatePQAddress = ({
  publicKey,
  algorithm
}: {
  publicKey: PQPublicKey;
  algorithm: PQ_SIGNATURE_ALGORITHM;
}): PQAddress => {
  const config = PQ_ALGO_CONFIG[algorithm];
  if (config === undefined) {
    throw new Error(`Unsupported algorithm ${algorithm}`);
  }
  const params = {
    network: IS_PROD ? PQAddressNetwork.Mainnet : PQAddressNetwork.Testnet,
    version: Version.V1,
    pubkeyType: config.pubkeyType,
    pubkeyBytes: publicKey
  };
  return encodeAddress(params) as PQAddress;
};

/*
 * Get bytes of entropy needed for algorithm
 */
function derivePQEntropyLength(
  algo: PQ_SIGNATURE_ALGORITHM
): (typeof PQ_ALGO_CONFIG)[PQ_SIGNATURE_ALGORITHM]['entropyLength'] {
  const config = PQ_ALGO_CONFIG[algo];
  if (config === undefined) {
    throw new Error(`Unsupported algorithm: ${algo}`);
  }
  return config.entropyLength;
}

/**
 * Generate a seed phrase using the BIP-39 algorithm.
 * @returns {Mnemonic24} The generated seed phrase.
 */
const generateSeedPhrase = (): Mnemonic24 => {
  const mnemonic = generateMnemonic(wordlist, 256);
  return ensure24WordMnemonic(mnemonic as Mnemonic24);
};

/**
 * Ensure that the provided mnemonic is a 24-word string.
 *
 * @param mnemonic The mnemonic to validate
 * @returns The validated mnemonic
 */
function ensure24WordMnemonic(mnemonic: Mnemonic24): Mnemonic24 {
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
  entropyLength
}: {
  root: HDKey;
  derIndex: PQ_SIGNATURE_ALGORITHM;
  entropyLength: (typeof PQ_ALGO_CONFIG)[PQ_SIGNATURE_ALGORITHM]['entropyLength'];
}): Uint8Array => {
  // Length cannot be longer than 64 bytes (hmac 512 limit)
  if (entropyLength > 64)
    throw new Error('Entropy length cannot be longer than 64 bytes');
  // Derivation path for BIP-85
  const path = `m/${BIP85_PURPOSE}'/${DEFAULT_APP_NO}'/${derIndex}'`;
  const node = root.derive(path);
  const privKey = node.privateKey;
  if (!privKey) throw new Error('No private key at this path');
  // Apply BIP-85 HMAC-SHA512
  const full = hmac(sha512, BIP85_HMAC_KEY, privKey);
  // Return specified number of bytes
  return full.slice(0, entropyLength);
};

/**
 * From a 24-word mnemonic → BIP-39 seed → BIP-85 entropy for PQ algorithm.
 *
 * @param mnemonic24 24-word BIP-39 phrase
 * @param algorithm  which PQ_SIGNATURE_ALGORITHM enum to use
 * @returns Uint8Array of entropy
 */
const deriveEntropyFromMnemonic = ({
  mnemonic24,
  algorithm
}: {
  mnemonic24: Mnemonic24;
  algorithm: PQ_SIGNATURE_ALGORITHM;
}): Uint8Array => {
  // BIP-39 seed (64 bytes)
  const m = ensure24WordMnemonic(mnemonic24);
  const seed = mnemonicToSeedSync(m);
  // Master HDKey from that seed
  const masterNode = HDKey.fromMasterSeed(seed);
  // Get bytes length for PQ_SIGNATURE_ALGORITHM
  const length = derivePQEntropyLength(algorithm);
  // Use the algorithm's numeric value as the derive-index
  return deriveBip85Entropy({
    root: masterNode,
    derIndex: algorithm,
    entropyLength: length
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
  mnemonic24: Mnemonic24,
  algorithm: PQ_SIGNATURE_ALGORITHM
) => {
  try {
    switch (algorithm) {
      case PQ_SIGNATURE_ALGORITHM.ML_DSA_44: {
        const entropy = deriveEntropyFromMnemonic({ mnemonic24, algorithm });
        const keypair = ml_dsa44.keygen(entropy);
        const publicKey = keypair.publicKey as PQPublicKey;
        const privateKey = keypair.secretKey as PQPrivateKey;
        const address = generatePQAddress({
          publicKey,
          algorithm
        });
        return {
          publicKey: publicKey,
          privateKey: privateKey,
          address: address
        };
      }
      case PQ_SIGNATURE_ALGORITHM.SLH_DSA_SHA2_S_128: {
        const entropy = deriveEntropyFromMnemonic({ mnemonic24, algorithm });
        const keypair = slh_dsa_sha2_128s.keygen(entropy);
        const publicKey = keypair.publicKey as PQPublicKey;
        const privateKey = keypair.secretKey as PQPrivateKey;
        const address = generatePQAddress({
          publicKey,
          algorithm
        });
        return {
          publicKey: publicKey,
          privateKey: privateKey,
          address: address
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
type SupportedSigningAlgos = Exclude<
  keyof typeof PQ_SIGNATURE_ALGORITHM,
  'TEST_ALGO'
>;
type SignedMessages = {
  [_key in SupportedSigningAlgos]: {
    publicKey: PQPublicKeyString;
    signedMessage: SignedMessage;
    address: PQAddress;
  };
};

/**
 * Generate message to sign
 *
 * @param bitcoinAddress Bitcoin address
 * @param mldsa44Address MLDSA 44 address
 * @returns message to sign as string and bytes
 */
const generateMessage = ({
  bitcoinAddress,
  mldsa44Address,
  slhdsaSha2S128Address
}: {
  bitcoinAddress: string;
  mldsa44Address: string;
  slhdsaSha2S128Address: string;
}) => {
  const message =
    `I want to permanently link my Bitcoin address ${bitcoinAddress} with my post-quantum addresses: ML-DSA-44 – ${mldsa44Address}, SLH-DSA-SHA2-128 – ${slhdsaSha2S128Address}` as Message;
  return {
    message: message,
    messageBytes: new TextEncoder().encode(message)
  };
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
  mnemonic24: Mnemonic24,
  bitcoinAddress: string
): SignedMessages => {
  try {
    // Key pair generation
    const mldsa44KeyPair = generateKeypair(
      mnemonic24,
      PQ_SIGNATURE_ALGORITHM.ML_DSA_44
    );
    const slhdsaSha2S128KeyPair = generateKeypair(
      mnemonic24,
      PQ_SIGNATURE_ALGORITHM.SLH_DSA_SHA2_S_128
    );

    // Create message
    const { messageBytes } = generateMessage({
      bitcoinAddress,
      mldsa44Address: mldsa44KeyPair.address,
      slhdsaSha2S128Address: slhdsaSha2S128KeyPair.address
    });

    // Signing
    const mldsa44SignedMessage = ml_dsa44.sign(
      mldsa44KeyPair.privateKey,
      messageBytes
    );
    const slhdsaSha2S128SignedMessage = slh_dsa_sha2_128s.sign(
      slhdsaSha2S128KeyPair.privateKey,
      messageBytes
    );
    // Best effort to zero out private keys
    mldsa44KeyPair.privateKey.fill(0);
    slhdsaSha2S128KeyPair.privateKey.fill(0);

    // Response
    return {
      ML_DSA_44: {
        publicKey: base64.encode(mldsa44KeyPair.publicKey) as PQPublicKeyString,
        signedMessage: base64.encode(mldsa44SignedMessage) as SignedMessage,
        address: mldsa44KeyPair.address
      },
      SLH_DSA_SHA2_S_128: {
        publicKey: base64.encode(
          slhdsaSha2S128KeyPair.publicKey
        ) as PQPublicKeyString,
        signedMessage: base64.encode(
          slhdsaSha2S128SignedMessage
        ) as SignedMessage,
        address: slhdsaSha2S128KeyPair.address
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new Error(`Error signing: ${err.message || err}`);
  }
};

/**
 * @param mnemonic24 24-word BIP-39 phrase
 */
const generateAddresses = (mnemonic24: Mnemonic24) => {
  const mldsa44KeyPair = generateKeypair(
    mnemonic24,
    PQ_SIGNATURE_ALGORITHM.ML_DSA_44
  );
  const slhdsaSha2S128KeyPair = generateKeypair(
    mnemonic24,
    PQ_SIGNATURE_ALGORITHM.SLH_DSA_SHA2_S_128
  );

  return {
    mldsa44Address: mldsa44KeyPair.address,
    slhdsaSha2S128Address: slhdsaSha2S128KeyPair.address
  };
};

/**
 * Encrypts proof request data using ML-KEM-768 derived shared secret and AES-256-GCM
 * @param requestBytes The proof request data to encrypt
 * @param mlKem768Keypair The ML-KEM-768 keypair for deriving the shared secret
 * @param mlKem768CiphertextBytes The ML-KEM-768 ciphertext from the server
 * @returns Concatenated nonce and encrypted data as a single Uint8Array
 */
function encryptProofRequestData(
  requestBytes: ProofRequestBytes,
  mlKem768Keypair: MlKem768Keypair,
  mlKem768CiphertextBytes: MlKem768CiphertextBytes
): Uint8Array {
  let mlKemSharedSecret: Uint8Array | undefined;
  let aes256GcmNonce: Uint8Array | undefined;

  try {
    // Derive the shared secret
    mlKemSharedSecret = deriveMlKem768SharedSecret(
      mlKem768CiphertextBytes,
      mlKem768Keypair
    );

    // Verify the shared secret is the correct length for AES-256-GCM
    if (mlKemSharedSecret.length !== AES_256_GCM_KEY_SIZE) {
      throw new Error(
        `Invalid ML-KEM shared secret length for AES-256-GCM: expected ${AES_256_GCM_KEY_SIZE} bytes, got ${mlKemSharedSecret.length}`
      );
    }

    // Generate a random 96-bit (12-byte) nonce for AES-256-GCM
    aes256GcmNonce = randomBytes(AES_256_GCM_NONCE_SIZE);

    // Encrypt using AES-256-GCM with the ML-KEM derived shared secret as key
    const aes256Gcm = gcm(mlKemSharedSecret, aes256GcmNonce);
    const aes256GcmCiphertext = aes256Gcm.encrypt(requestBytes);

    // Combine nonce and encrypted data into a single buffer
    // Format: [12 bytes nonce][N bytes ciphertext]
    const aes256GcmEncryptedMessage = new Uint8Array(
      AES_256_GCM_NONCE_SIZE + aes256GcmCiphertext.length
    );
    aes256GcmEncryptedMessage.set(aes256GcmNonce);
    aes256GcmEncryptedMessage.set(aes256GcmCiphertext, AES_256_GCM_NONCE_SIZE);

    return aes256GcmEncryptedMessage;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to encrypt proof request: ${errorMessage}`);
  } finally {
    // Clean up all sensitive cryptographic material
    if (mlKemSharedSecret) {
      mlKemSharedSecret.fill(0);
    }
    if (aes256GcmNonce) {
      aes256GcmNonce.fill(0);
    }
    destroyMlKem768Keypair(mlKem768Keypair);
  }
}

export {
  generateMlKem768Keypair,
  deriveMlKem768SharedSecret,
  destroyMlKem768Keypair,
  encryptProofRequestData,
  generatePQAddress,
  generateSeedPhrase,
  generateSignedMessages,
  generateMessage,
  generateKeypair,
  deriveBip85Entropy,
  isValidBitcoinAddress,
  isValidBitcoinSignature,
  generateAddresses,
  ML_KEM_768_CIPHERTEXT_SIZE,
  ML_KEM_768_DECAPSULATION_KEY_SIZE,
  ML_KEM_768_SHARED_SECRET_SIZE,
  AES_256_GCM_KEY_SIZE,
  AES_256_GCM_NONCE_SIZE,
  MAX_BASE64_ML_KEM_768_CIPHERTEXT_SIZE,
  type SignedMessages
};
