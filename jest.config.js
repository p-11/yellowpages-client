/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        babelConfig: './src/__tests__/babel.config.js'
      }
    ],
    '^.+\\.js$': [
      'babel-jest',
      {
        configFile: './src/__tests__/babel.config.js'
      }
    ]
  },
  transformIgnorePatterns: [
    // Transform ESM modules that we need
    '/node_modules/(?!(bitcoin-address-validation|base58-js|@evervault)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // Exclude e2e tests and config files
  testPathIgnorePatterns: ['\\.e2e\\.test\\.[jt]sx?$', 'babel\\.config\\.js$']
};
