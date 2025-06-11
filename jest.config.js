/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use ts-jest to transform both .ts/.tsx and .js/.jsx
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',

  // Transform everything under src with ts-jest, and the WASM package with Babel
  transform: {
    // Transform the WASM package with Babel to handle import.meta (must come first)
    '.*/node_modules/@evervault/wasm-attestation-bindings/.*\\.js$': 'babel-jest',
    '^.+\\.[jt]sx?$': 'ts-jest'
  },
  transformIgnorePatterns: [
    // Ignore all node_modules except specific ESM packages
    '/node_modules/(?!(bitcoin-address-validation|base58-js|@evervault\\/wasm-attestation-bindings)/)'
  ],

  // If you use path-aliases (e.g. @/…), map them:
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // ignore e2e test files
  testPathIgnorePatterns: ['\\.e2e\\.']
};
