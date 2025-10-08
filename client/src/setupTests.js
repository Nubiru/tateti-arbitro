/**
 * Archivo de configuración de Jest para pruebas de React
 * @lastModified 2025-10-05
 * @version 2.0.0
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Suprimir advertencias de deprecación de ReactDOMTestUtils.act
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ReactDOMTestUtils.act')
  ) {
    return;
  }
  originalError.call(console, ...args);
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

    // Simular conexión inmediata para pruebas unitarias
    this.readyState = this.OPEN;
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
