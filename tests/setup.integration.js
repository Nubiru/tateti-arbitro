/**
 * Archivo de Configuración de Pruebas de Integración
 * Entorno limpio para pruebas de integración con dependencias reales
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

// Establecer nivel de log a ERROR para reducir ruido
process.env.LOG_LEVEL = 'ERROR';

// Silenciar console.error y console.warn para evitar bloques de error rojos enormes
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = jest.fn();
console.warn = jest.fn();

// Restaurar métodos de consola originales después de las pruebas
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Proper cleanup for integration tests
afterAll(async () => {
  // Close EventBus to clear setInterval
  try {
    const eventBus = (await import('../src/app/event-bus.js')).default;
    if (eventBus && eventBus.closeAll) {
      eventBus.closeAll();
    }
  } catch (error) {
    // EventBus might not be loaded in all tests
  }

  // Close any open servers or connections
  if (global.server) {
    await new Promise(resolve => {
      global.server.close(() => {
        resolve();
      });
    });
  }

  // Clear any remaining timers
  if (global.gc) {
    global.gc();
  }
});
