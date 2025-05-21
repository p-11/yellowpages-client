import { ml_dsa44 } from '@noble/post-quantum/ml-dsa';
import { slh_dsa_sha2_128s } from '@noble/post-quantum/slh-dsa';
import { base64 } from '@scure/base';
import {
  generateKeypair,
  generateMessage,
  Mnemonic24,
  PQ_SIGNATURE_ALGORITHM,
  PQPublicKeyString,
  SignedMessage
} from '../cryptography';

/**
 * Sign a UTF-8 string with every supported PQ_SIGNATURE_ALGORITHM,
 * returning an object keyed by algorithm name.
 *
 * @param mnemonic24 24-word BIP-39 phrase
 * @param message the UTF-8 string to sign
 * @returns Record where each key is the enum name (e.g. "ML_DSA_44")
 * @throws if any step fails for any algorithm
 */
const generateSignedMessagesInWorker = (
  mnemonic24: Mnemonic24,
  bitcoinAddress: string
) => {
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

addEventListener(
  'message',
  async (
    event: MessageEvent<{ mnemonic24: Mnemonic24; bitcoinAddress: string }>
  ) => {
    const input = event.data;
    const result = generateSignedMessagesInWorker(
      input.mnemonic24,
      input.bitcoinAddress
    );
    postMessage(result);
  }
);
