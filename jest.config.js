/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use ts-jest to transform both .ts/.tsx and .js/.jsx
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',

  // Enable experimental fetch
  setupFiles: ['<rootDir>/jest.setup.js'],

  // Set NODE_ENV to test to ensure Babel plugins are applied
  setupFilesAfterEnv: [],
  globals: {
    'ts-jest': {
      babelConfig: true
    }
  },

  // Transform everything under src with ts-jest, and the WASM package with Babel
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest',
    '^.+/node_modules/@evervault/wasm-attestation-bindings/index\\.js$': 'babel-jest'
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
