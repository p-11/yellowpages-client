/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Use ts-jest to transform both .ts/.tsx and .js/.jsx
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',

  // Transform everything under src, and also these two ESM deps in node_modules
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest'
  },
  transformIgnorePatterns: [
    // Ignore all node_modules except bitcoin-address-validation AND base58-js
    '/node_modules/(?!(bitcoin-address-validation|base58-js)/)'
  ],

  // If you use path-aliases (e.g. @/…), map them:
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // ignore e2e test files
  testPathIgnorePatterns: ['\\.e2e\\.']
};
