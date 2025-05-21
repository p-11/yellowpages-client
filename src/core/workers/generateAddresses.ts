import {
  generateKeypair,
  Mnemonic24,
  PQ_SIGNATURE_ALGORITHM
} from '../cryptography';

/**
 * @param mnemonic24 24-word BIP-39 phrase
 */
const generateAddressesInWorker = (mnemonic24: Mnemonic24) => {
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

addEventListener(
  'message',
  async (event: MessageEvent<{ mnemonic24: Mnemonic24 }>) => {
    const input = event.data;
    const result = generateAddressesInWorker(input.mnemonic24);
    postMessage(result);
  }
);
