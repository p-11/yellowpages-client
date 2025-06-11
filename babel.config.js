module.exports = {
  presets: [],
  plugins: [],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            }
          }
        ]
      ],
      plugins: ['babel-plugin-transform-import-meta']
    }
  }
}; 