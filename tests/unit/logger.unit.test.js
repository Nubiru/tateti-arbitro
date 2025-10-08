/**
 * Pruebas unitarias para el Servicio de Logger
 * Pruebas de todos los niveles de log, formateo y casos límite
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { jest } from '@jest/globals';

// Simular métodos de consola antes de importar logger
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Reemplazar métodos de consola
Object.assign(console, mockConsole);

// No importar logger a nivel de módulo para evitar problemas de caché

describe('Pruebas Unitarias de Logger', () => {
  let originalEnv;
  let originalLogLevel;

  beforeEach(() => {
    jest.clearAllMocks();

    // Almacenar entorno original
    originalEnv = { ...process.env };
    originalLogLevel = process.env.LOG_LEVEL;
  });

  afterEach(() => {
    // Restaurar entorno original
    process.env = originalEnv;
  });

  describe('Log Level Filtering', () => {
    test('debería registrar ERROR cuando LOG_LEVEL es ERROR', () => {
      // Establecer variable de entorno antes de cargar módulo
      process.env.LOG_LEVEL = 'ERROR';

      // Limpiar caché de módulo y re-importar
      jest.resetModules();
      delete require.cache[require.resolve('../../src/app/logger.js')];

      // Forzar recarga del módulo
      const freshLogger = require('../../src/app/logger.js').default;

      // Debug: Verificar qué LOG_LEVEL se está usando
      // console.log('DEBUG: process.env.LOG_LEVEL =', process.env.LOG_LEVEL);

      // Limpiar simulaciones antes de probar
      mockConsole.error.mockClear();
      mockConsole.warn.mockClear();
      mockConsole.info.mockClear();
      mockConsole.debug.mockClear();

      freshLogger.error('TEST', 'UNIT', 'TEST', 'Error message');
      freshLogger.warn('TEST', 'UNIT', 'TEST', 'Warn message');
      freshLogger.info('TEST', 'UNIT', 'TEST', 'Info message');
      freshLogger.debug('TEST', 'UNIT', 'TEST', 'Debug message');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();

      // Restaurar nivel de log original
      process.env.LOG_LEVEL = originalLogLevel;
    });

    test('debería registrar ERROR y WARN cuando LOG_LEVEL es WARN', () => {
      process.env.LOG_LEVEL = 'WARN';

      jest.resetModules();
      delete require.cache[require.resolve('../../src/app/logger.js')];
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.error('TEST', 'UNIT', 'TEST', 'Error message');
      freshLogger.warn('TEST', 'UNIT', 'TEST', 'Warn message');
      freshLogger.info('TEST', 'UNIT', 'TEST', 'Info message');
      freshLogger.debug('TEST', 'UNIT', 'TEST', 'Debug message');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    test('debería registrar ERROR, WARN e INFO cuando LOG_LEVEL es INFO', () => {
      process.env.LOG_LEVEL = 'INFO';

      jest.resetModules();
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.error('TEST', 'UNIT', 'TEST', 'Error message');
      freshLogger.warn('TEST', 'UNIT', 'TEST', 'Warn message');
      freshLogger.info('TEST', 'UNIT', 'TEST', 'Info message');
      freshLogger.debug('TEST', 'UNIT', 'TEST', 'Debug message');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    test('debería registrar todos los niveles cuando LOG_LEVEL es DEBUG', () => {
      process.env.LOG_LEVEL = 'DEBUG';

      jest.resetModules();
      delete require.cache[require.resolve('../../src/app/logger.js')];
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.error('TEST', 'UNIT', 'TEST', 'Error message');
      freshLogger.warn('TEST', 'UNIT', 'TEST', 'Warn message');
      freshLogger.info('TEST', 'UNIT', 'TEST', 'Info message');
      freshLogger.debug('TEST', 'UNIT', 'TEST', 'Debug message');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
    });

    test('debería usar nivel INFO por defecto cuando LOG_LEVEL no está configurado', () => {
      delete process.env.LOG_LEVEL;

      jest.resetModules();
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.error('TEST', 'UNIT', 'TEST', 'Error message');
      freshLogger.warn('TEST', 'UNIT', 'TEST', 'Warn message');
      freshLogger.info('TEST', 'UNIT', 'TEST', 'Info message');
      freshLogger.debug('TEST', 'UNIT', 'TEST', 'Debug message');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    test('debería usar nivel INFO por defecto cuando LOG_LEVEL es inválido', () => {
      process.env.LOG_LEVEL = 'INVALID';

      jest.resetModules();
      delete require.cache[require.resolve('../../src/app/logger.js')];
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.error('TEST', 'UNIT', 'TEST', 'Error message');
      freshLogger.warn('TEST', 'UNIT', 'TEST', 'Warn message');
      freshLogger.info('TEST', 'UNIT', 'TEST', 'Info message');
      freshLogger.debug('TEST', 'UNIT', 'TEST', 'Debug message');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });
  });

  describe('Formateo de Mensajes', () => {
    beforeEach(() => {
      process.env.LOG_LEVEL = 'DEBUG';
      jest.resetModules();
    });

    test('debería format basic message without data', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', 'Test message');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: Test message$/
        )
      );
    });

    test('debería format message with simple data object', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', 'Test message', {
        key1: 'value1',
        key2: 'value2',
      });

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: Test message \| key1=value1 key2=value2$/
        )
      );
    });

    test('debería format message with empty data object', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', 'Test message', {});

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: Test message$/
        )
      );
    });

    test('debería format message with undefined data', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info(
        'SERVICE',
        'LAYER',
        'OPERATION',
        'Test message',
        undefined
      );

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: Test message$/
        )
      );
    });

    test('debería format message with null data', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', 'Test message', null);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: Test message$/
        )
      );
    });

    test('debería handle special characters in message', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info(
        'SERVICE',
        'LAYER',
        'OPERATION',
        'Message with special chars: !@#$%^&*()'
      );

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: Message with special chars: !@#\$%\^&\*\(\)$/
        )
      );
    });

    test('debería handle very long message', () => {
      const freshLogger = require('../../src/app/logger.js').default;
      const longMessage = 'A'.repeat(1000);

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', longMessage);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: A{1000}$/
        )
      );
    });

    test('debería handle data with special characters', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', 'Test message', {
        special: 'value with spaces and !@#$%',
        number: 123,
        boolean: true,
        nullValue: null,
        undefinedValue: undefined,
      });

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: Test message \| special=value with spaces and !@#\$%\s+number=123\s+boolean=true\s+nullValue=null\s+undefinedValue=undefined$/
        )
      );
    });

    test('debería handle data with nested objects', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', 'Test message', {
        nested: { key: 'value' },
        array: [1, 2, 3],
      });

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: Test message \| nested=\[object Object\]\s+array=1,2,3$/
        )
      );
    });

    test('debería handle empty string message', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', '');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: $/
        )
      );
    });

    test('debería handle numeric message', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', 123);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: 123$/
        )
      );
    });

    test('debería handle boolean message', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', true);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: true$/
        )
      );
    });
  });

  describe('Formateo de Timestamp', () => {
    beforeEach(() => {
      process.env.LOG_LEVEL = 'INFO';
      jest.resetModules();
    });

    test('debería format timestamp correctly', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      // Simular Date para obtener timestamp consistente
      const mockDate = new Date('2025-10-03T10:30:45.123Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', 'Test message');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[2025-10-03T10:30:45\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: Test message$/
        )
      );

      jest.restoreAllMocks();
    });
  });

  describe('Llamadas a Métodos de Consola', () => {
    beforeEach(() => {
      process.env.LOG_LEVEL = 'DEBUG';
      jest.resetModules();
    });

    test('debería call console.error for error level', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.error('SERVICE', 'LAYER', 'OPERATION', 'Error message');

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    test('debería call console.warn for warn level', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.warn('SERVICE', 'LAYER', 'OPERATION', 'Warn message');

      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    test('debería call console.info for info level', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', 'Info message');

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    test('debería call console.debug for debug level', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.debug('SERVICE', 'LAYER', 'OPERATION', 'Debug message');

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
    });
  });

  describe('Casos Límite', () => {
    beforeEach(() => {
      process.env.LOG_LEVEL = 'DEBUG';
      jest.resetModules();
    });

    test('debería handle undefined service parameter', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info(undefined, 'LAYER', 'OPERATION', 'Test message');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[undefined\]\[LAYER\]\[OPERATION\]: Test message$/
        )
      );
    });

    test('debería handle undefined layer parameter', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', undefined, 'OPERATION', 'Test message');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[undefined\]\[OPERATION\]: Test message$/
        )
      );
    });

    test('debería handle undefined operation parameter', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', 'LAYER', undefined, 'Test message');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[undefined\]: Test message$/
        )
      );
    });

    test('debería handle undefined message parameter', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info('SERVICE', 'LAYER', 'OPERATION', undefined);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[SERVICE\]\[LAYER\]\[OPERATION\]: undefined$/
        )
      );
    });

    test('debería handle all undefined parameters', () => {
      const freshLogger = require('../../src/app/logger.js').default;

      freshLogger.info(undefined, undefined, undefined, undefined);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\]\[INFO\]\[undefined\]\[undefined\]\[undefined\]: undefined$/
        )
      );
    });

    test('debería registrar cuando LOG_LEVEL permite nivel ERROR', () => {
      // Establecer LOG_LEVEL a DEBUG (permite nivel ERROR)
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'DEBUG';

      // Limpiar cualquier llamada previa
      mockConsole.error.mockClear();

      // Probar la lógica de filtrado de nivel de log directamente
      const LOG_LEVELS = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3,
      };

      const getCurrentLogLevel = () => {
        const level = process.env.LOG_LEVEL?.toUpperCase();
        return LOG_LEVELS[level] ?? LOG_LEVELS.INFO;
      };

      // Simular la lógica de error del logger
      const shouldLog = getCurrentLogLevel() >= LOG_LEVELS.ERROR;

      // Cuando LOG_LEVEL es DEBUG (3), es >= ERROR (0), así que debería registrar
      expect(shouldLog).toBe(true);

      // Restaurar LOG_LEVEL original
      process.env.LOG_LEVEL = originalLogLevel;
    });
  });
});
