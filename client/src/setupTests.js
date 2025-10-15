/**
 * Archivo de configuración de Jest para pruebas de React
 * @lastModified 2025-10-10
 * @version 3.0.0
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Comprehensive console suppression for clean test output
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

// Suppress console.error unless LOG_LEVEL=debug (only in test environment)
console.error = (...args) => {
  // Only suppress in test environment (when NODE_ENV is test)
  if (process.env.NODE_ENV === 'test') {
    if (process.env.LOG_LEVEL === 'debug') {
      originalError.call(console, ...args);
      return;
    }
  } else {
    // In browser/production, always show errors
    originalError.call(console, ...args);
    return;
  }

  const message = args[0]?.toString() || '';

  // Always suppress these noisy warnings
  const suppressPatterns = [
    'ReactDOMTestUtils.act',
    'Warning: ReactDOM.render',
    'Warning: useLayoutEffect',
    'Not implemented: HTMLFormElement.prototype.submit',
    'Error: Not implemented: HTMLFormElement.prototype.submit',
    'An update to',
    'Warning: An update inside a test was not wrapped in act',
  ];

  if (suppressPatterns.some(pattern => message.includes(pattern))) {
    return;
  }

  // Log unexpected errors for debugging
  originalError.call(console, ...args);
};

// Suppress console.warn unless LOG_LEVEL=debug (only in test environment)
console.warn = (...args) => {
  // Only suppress in test environment (when NODE_ENV is test)
  if (process.env.NODE_ENV === 'test') {
    if (process.env.LOG_LEVEL === 'debug') {
      originalWarn.call(console, ...args);
    }
    // Suppress all warnings in tests
  } else {
    // In browser/production, always show warnings
    originalWarn.call(console, ...args);
  }
};

// Suppress console.log unless LOG_LEVEL=debug (only in test environment)
console.log = (...args) => {
  // Only suppress in test environment (when NODE_ENV is test)
  if (process.env.NODE_ENV === 'test') {
    if (process.env.LOG_LEVEL === 'debug') {
      originalLog.call(console, ...args);
    }
    // Suppress all logs in tests
  } else {
    // In browser/production, always show logs
    originalLog.call(console, ...args);
  }
};

// Configurar Testing Library
configure({
  testIdAttribute: 'data-testid',
  getElementError: (message, container) => {
    const error = new Error(message);
    error.stack = null;
    if (container && container.innerHTML) {
      const domSnapshot = container.innerHTML.substring(0, 200);
      error.message += `\n\nDOM snapshot (first 200 chars):\n${domSnapshot}`;
    }
    return error;
  },
});

// Simular EventSource para pruebas SSE
class MockEventSource {
  static instances = [];

  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSED = 2;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    this.listeners = {};

    // Track instances for testing
    MockEventSource.instances.push(this);

    // Simular conexión inmediata para pruebas unitarias
    this.readyState = this.OPEN;

    // Simulate async connection with setTimeout
    setTimeout(() => {
      if (this.onopen) {
        this.onopen();
      }
    }, 0);
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        cb => cb !== callback
      );
    }
  }

  close() {
    this.readyState = this.CLOSED;
    if (this.onclose) this.onclose();
  }

  // Método auxiliar para pruebas para simular eventos
  simulateEvent(eventType, data) {
    if (this[`on${eventType}`]) {
      this[`on${eventType}`]({ data: JSON.stringify(data) });
    }
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(callback => {
        callback({ data: JSON.stringify(data) });
      });
    }
  }

  // Alias for simulateEvent for test compatibility
  trigger(eventType, data) {
    this.simulateEvent(eventType, data);
  }

  // Static method to clear instances for test isolation
  static clearInstances() {
    MockEventSource.instances = [];
  }
}

// Configurar simulaciones globales
global.EventSource = MockEventSource;
// Don't set a default fetch mock - let individual tests set their own

// Asegurar que EventSource esté disponible en el objeto window
if (typeof window !== 'undefined') {
  window.EventSource = MockEventSource;
}

// Manejar rechazos de promesas no manejados para prevenir fallos de workers
process.on('unhandledRejection', reason => {
  console.error('Unhandled Promise Rejection:', reason);
});

// Manejar excepciones no capturadas
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});
