/**
 * Configuración de Jest - Configuración de Monorepo
 * @lastModified 2025-10-05
 * @version 2.0.0
 */

export default {
  // Suprimir advertencias de deprecación de punycode
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Forzar Node.js a suprimir advertencias de deprecación
  testEnvironmentOptions: {
    NODE_OPTIONS: '--no-deprecation'
  },
  projects: [
    // Pruebas Unitarias del Backend
    {
      displayName: 'backend-unit',
      testEnvironment: 'node',
      testTimeout: 1000, // 1 second max for unit tests
      maxWorkers: 4, // Parallel execution for speed
      transform: {
        '^.+\\.(js|mjs)$': 'babel-jest'
      },
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.js',
        '<rootDir>/tests/unit/**/*.spec.js'
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1'
      },
      collectCoverageFrom: [
        '<rootDir>/src/**/*.js',
        '!<rootDir>/src/**/*.test.js',
        '!<rootDir>/src/**/*.spec.js'
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.unit.js'],
      // Force cleanup of handles for unit tests
      detectOpenHandles: true,
    },
    // Pruebas de Integración del Backend
    {
      displayName: 'backend-integration',
      testEnvironment: 'node',
      testTimeout: 30000, // 30 seconds for real delays
      maxWorkers: 1, // Single worker for integration tests
      transform: {
        '^.+\\.(js|mjs)$': 'babel-jest'
      },
      testMatch: [
        '<rootDir>/tests/integration/**/*.test.js',
        '<rootDir>/tests/integration/**/*.spec.js'
      ],
      collectCoverageFrom: [
        '<rootDir>/src/**/*.js',
        '!<rootDir>/src/**/*.test.js',
        '!<rootDir>/src/**/*.spec.js'
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.integration.js'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
      }
    },
    // Pruebas del Cliente
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testTimeout: 5000, // 5 seconds for React rendering
      maxWorkers: 2, // Parallel execution for client tests
      testMatch: [
        '<rootDir>/client/src/**/*.test.jsx',
        '<rootDir>/client/src/**/*.test.js'
      ],
      collectCoverageFrom: [
        '<rootDir>/client/src/**/*.{js,jsx}',
        '!<rootDir>/client/src/**/*.test.{js,jsx}',
        '!<rootDir>/client/src/**/*.spec.{js,jsx}',
        '!<rootDir>/client/src/**/__tests__/**',
        '!<rootDir>/client/src/**/__mocks__/**'
      ],
      setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.js'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
          '<rootDir>/client/src/__mocks__/fileMock.js'
      },
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
      }
    }
  ],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  detectOpenHandles: false
};
