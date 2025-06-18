export const releases: Array<{
  version: string;
  releaseDate: string;
  changes: Array<string>;
}> = [
  {
    version: '1.0.0',
    releaseDate: '2025-05-23',
    changes: [
      'Initial release of yellowpages.xyz 🚢',
      'Supports ML-DSA-44 and SLH-DSA SHA2-128s PQ algorithms',
      'Supports P2PKH and P2WPKH Bitcoin addresses',
      'Post-Quantum end-to-end encryption with ML-KEM-768'
    ]
  }
];
