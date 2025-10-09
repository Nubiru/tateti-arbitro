/**
 * Configuración del servidor Express
 * @lastModified 2025-10-08
 * @version 1.0.0
 */

// Immediate console output BEFORE any imports
console.log('🚀 Starting Ta-Te-Ti Arbitrator...');
console.log(`📍 Node version: ${process.version}`);
console.log(`📂 Working directory: ${process.cwd()}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔍 Log Level: ${process.env.LOG_LEVEL || 'info'}`);

// Import with error handling
import { createDefaultApp } from './app.factory.js';
import logger from './logger.js';

const PORT = process.env.PORT || 4000;

// Variables for export
let app, dependencies;

try {
  console.log('✅ Modules loaded successfully');

  // Crear aplicación con dependencias por defecto
  const result = createDefaultApp();
  app = result.app;
  dependencies = result.dependencies;

  console.log('✅ App created successfully');

  // Iniciar servidor (skip only for unit tests, not Docker integration tests)
  const isUnitTest = process.env.NODE_ENV === 'test' && !process.env.DOCKER_ENV;
  if (!isUnitTest) {
    const server = app.listen(PORT, '0.0.0.0', () => {
      const env = process.env.NODE_ENV || 'development';

      // Console output for Docker logs (visible in docker logs)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎮 Ta-Te-Ti Arbitrator Server');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${env}`);
      console.log(`🔍 Log Level: ${process.env.LOG_LEVEL || 'info'}`);
      console.log(`✅ Server ready - http://0.0.0.0:${PORT}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Structured logging
      logger.info('APP', 'SERVER', 'START', 'Servidor iniciado', {
        port: PORT,
        environment: env,
        logLevel: process.env.LOG_LEVEL || 'info',
      });
    });

    // Handle server errors
    server.on('error', error => {
      console.error('❌ Server error:', error);
      logger.error('APP', 'SERVER', 'ERROR', 'Error del servidor', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('⚠️  SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  } else {
    console.log('⚠️  Unit test environment detected, skipping server start');
  }
} catch (error) {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ FATAL ERROR DURING SERVER INITIALIZATION');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Stack trace:');
  console.error(error.stack);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(1);
}

// Export at top level (outside try-catch)
export { app, dependencies, PORT };
