/**
 * Configuración de Babel para el cliente React
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: 'commonjs',
      },
    ],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
