/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
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
    '/node_modules/(?!(bitcoin-address-validation|base58-js|@noble|@evervault|@scure)/)'
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  // Exclude e2e tests and config files
  testPathIgnorePatterns: ['\\.e2e\\.test\\.[jt]sx?$', 'babel\\.config\\.js$']
};

module.exports = config;
