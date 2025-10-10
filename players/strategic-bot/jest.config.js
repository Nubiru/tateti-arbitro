export default {
  testEnvironment: 'node',
  transform: {},
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'index.js',
    'algorithm.js',
    '!tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};

