/**
 * Babel Configuration - Monorepo Setup
 * @lastModified 2025-10-05
 * @version 2.0.0
 */

export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: 'commonjs'
      }
    ],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: { node: 'current' },
            modules: 'commonjs'
          }
        ],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ]
    }
  }
};
