/**
 * Jest Setup - Global test configuration
 * @lastModified 2025-10-05
 * @version 1.0.0
 */

// Suppress punycode deprecation warnings completely
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('punycode')) {
    return;
  }
  originalWarn.call(console, ...args);
};

console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('punycode')) {
    return;
  }
  originalError.call(console, ...args);
};

// Suppress process warnings
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (
    warning.name === 'DeprecationWarning' &&
    warning.message.includes('punycode')
  ) {
    return;
  }
  originalWarn.call(console, warning);
});
