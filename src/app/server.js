import { createDefaultApp } from './app.factory.js';
import logger from './logger.js';

const PORT = process.env.PORT || 4000;

/**
 * Configuración del servidor Express
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

// Crear aplicación con dependencias por defecto
const { app, dependencies } = createDefaultApp();

// Iniciar servidor solo si no está en entorno de pruebas
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info('APP', 'SERVER', 'START', 'Servidor iniciado', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
    });
  });
}

export { app, dependencies, PORT };
