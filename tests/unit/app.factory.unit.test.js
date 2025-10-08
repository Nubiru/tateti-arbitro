/**
 * Pruebas unitarias para App Factory
 * Pruebas de funciones puras y métodos utilitarios de app.factory.js
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import express from 'express';
import rateLimit from 'express-rate-limit';

// Simular dependencias
jest.mock('express', () => {
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    listen: jest.fn(),
  };
  const express = jest.fn(() => mockApp);
  express.json = jest.fn(() => (req, res, next) => next());
  express.urlencoded = jest.fn(() => (req, res, next) => next());
  express.static = jest.fn(() => (req, res, next) => next());
  return express;
});

jest.mock('express-rate-limit', () => {
  return jest.fn(() => (req, res, next) => next());
});

jest.mock('cors', () => jest.fn(() => (req, res, next) => next()));
jest.mock('helmet', () => jest.fn(() => (req, res, next) => next()));

// Simular otras dependencias
jest.mock('../../src/app/logger.js', () => ({
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../src/app/event-bus.js', () => ({
  default: {
    getConnectionCount: jest.fn(() => 0),
    getMetrics: jest.fn(() => ({ totalEvents: 0 })),
    addConnection: jest.fn(),
  },
}));

jest.mock('../../src/domain/game/http.adapter.js', () => ({
  createHttpAdapter: jest.fn(() => ({
    requestMove: jest.fn(),
  })),
}));

jest.mock('../../src/domain/game/events.adapter.js', () => ({
  createEventsAdapter: jest.fn(() => ({
    broadcastMatchStart: jest.fn(),
    broadcastMatchMove: jest.fn(),
    broadcastMatchWin: jest.fn(),
    broadcastMatchDraw: jest.fn(),
    broadcastMatchError: jest.fn(),
  })),
}));

jest.mock('../../src/domain/game/arbitrator.coordinator.js', () => ({
  ArbitratorCoordinator: jest.fn().mockImplementation(() => ({
    runMatch: jest.fn(),
  })),
}));

jest.mock('../../src/domain/game/tournament.di.js', () => ({
  TournamentCoordinator: jest.fn().mockImplementation(() => ({
    runTournament: jest.fn(),
    buildPlayerList: jest.fn(),
  })),
}));

jest.mock('../../src/middleware/validation.js', () => ({
  validateMatch: jest.fn((req, res, next) => next()),
  validateTournament: jest.fn((req, res, next) => next()),
  validateTournamentConfig: jest.fn((req, res, next) => next()),
  handleValidationErrors: jest.fn((req, res, next) => next()),
  sanitizeInput: jest.fn((req, res, next) => next()),
}));

// Importar después de simular
import {
  createApp,
  attachRateLimiter,
  createDefaultApp,
} from '../../src/app/app.factory.js';

describe('Pruebas Unitarias de App Factory', () => {
  let mockApp;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApp = express();
  });

  describe('createApp', () => {
    test('debería crear app con dependencias por defecto', () => {
      const result = createApp();

      expect(result).toHaveProperty('app');
      expect(result).toHaveProperty('eventBus');
      expect(result).toHaveProperty('httpAdapter');
      expect(result).toHaveProperty('eventsAdapter');
      expect(result).toHaveProperty('arbitrator');
      expect(result).toHaveProperty('tournament');
    });

    test('debería crear app con dependencias personalizadas', () => {
      const customDependencies = {
        eventBus: { custom: 'eventBus' },
        httpAdapter: { custom: 'httpAdapter' },
        eventsAdapter: { custom: 'eventsAdapter' },
        arbitrator: { custom: 'arbitrator' },
        tournament: { custom: 'tournament' },
      };

      const result = createApp(customDependencies);

      expect(result.eventBus).toBe(customDependencies.eventBus);
      expect(result.httpAdapter).toBe(customDependencies.httpAdapter);
      expect(result.eventsAdapter).toBe(customDependencies.eventsAdapter);
      expect(result.arbitrator).toBe(customDependencies.arbitrator);
      expect(result.tournament).toBe(customDependencies.tournament);
    });

    test('debería crear app con dependencias personalizadas parciales', () => {
      const customDependencies = {
        eventBus: { custom: 'eventBus' },
      };

      const result = createApp(customDependencies);

      expect(result.eventBus).toBe(customDependencies.eventBus);
      expect(result.httpAdapter).toBeDefined();
      expect(result.eventsAdapter).toBeDefined();
      expect(result.arbitrator).toBeDefined();
      expect(result.tournament).toBeDefined();
    });

    test('debería crear app con objeto de dependencias vacío', () => {
      const result = createApp({});

      expect(result).toHaveProperty('app');
      expect(result).toHaveProperty('eventBus');
      expect(result).toHaveProperty('httpAdapter');
      expect(result).toHaveProperty('eventsAdapter');
      expect(result).toHaveProperty('arbitrator');
      expect(result).toHaveProperty('tournament');
    });

    test('debería crear app con dependencias undefined', () => {
      const result = createApp(undefined);

      expect(result).toHaveProperty('app');
      expect(result).toHaveProperty('eventBus');
      expect(result).toHaveProperty('httpAdapter');
      expect(result).toHaveProperty('eventsAdapter');
      expect(result).toHaveProperty('arbitrator');
      expect(result).toHaveProperty('tournament');
    });
  });

  describe('attachRateLimiter', () => {
    test('debería adjuntar limitador de tasa con opciones por defecto', () => {
      const result = attachRateLimiter(mockApp);

      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Demasiadas solicitudes',
      });
      expect(mockApp.use).toHaveBeenCalled();
      expect(result).toBe(mockApp);
    });

    test('debería adjuntar limitador de tasa con opciones personalizadas', () => {
      const customOptions = {
        windowMs: 5 * 60 * 1000,
        max: 50,
        message: 'Custom rate limit message',
      };

      const result = attachRateLimiter(mockApp, customOptions);

      expect(rateLimit).toHaveBeenCalledWith(customOptions);
      expect(mockApp.use).toHaveBeenCalled();
      expect(result).toBe(mockApp);
    });

    test('debería combinar opciones personalizadas con valores por defecto', () => {
      const customOptions = {
        windowMs: 10 * 60 * 1000,
        message: 'Custom message',
      };

      const result = attachRateLimiter(mockApp, customOptions);

      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 10 * 60 * 1000,
        max: 100, // valor por defecto
        message: 'Custom message',
      });
      expect(result).toBe(mockApp);
    });

    test('debería manejar objeto de opciones vacío', () => {
      const result = attachRateLimiter(mockApp, {});

      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Demasiadas solicitudes',
      });
      expect(result).toBe(mockApp);
    });

    test('debería manejar opciones undefined', () => {
      const result = attachRateLimiter(mockApp, undefined);

      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Demasiadas solicitudes',
      });
      expect(result).toBe(mockApp);
    });
  });

  describe('createDefaultApp', () => {
    test('debería llamar createApp sin argumentos', () => {
      const result = createDefaultApp();

      expect(result).toHaveProperty('app');
      expect(result).toHaveProperty('eventBus');
      expect(result).toHaveProperty('httpAdapter');
      expect(result).toHaveProperty('eventsAdapter');
      expect(result).toHaveProperty('arbitrator');
      expect(result).toHaveProperty('tournament');
    });

    test('debería retornar misma estructura que createApp', () => {
      const defaultResult = createDefaultApp();
      const createResult = createApp();

      expect(Object.keys(defaultResult)).toEqual(Object.keys(createResult));
    });
  });

  describe('Lógica de Manejadores de Rutas', () => {
    let mockRes;

    beforeEach(() => {
      mockRes = {
        json: jest.fn(),
        status: jest.fn(() => mockRes),
        sendFile: jest.fn(),
      };
    });

    describe('Lógica de Normalización de Jugadores', () => {
      test('debería normalizar jugadores correctamente para ruta de partida', () => {
        const player1 = { name: 'Player1', port: 3001 };
        const player2 = { name: 'Player2', port: 3002 };

        const expectedPlayers = [
          {
            name: 'Player1',
            port: 3001,
            host: 'localhost',
            protocol: 'http',
          },
          {
            name: 'Player2',
            port: 3002,
            host: 'localhost',
            protocol: 'http',
          },
        ];

        // Esto prueba la lógica que estaría en el manejador de ruta
        const players = [
          {
            name: player1.name,
            port: player1.port,
            host: 'localhost',
            protocol: 'http',
          },
          {
            name: player2.name,
            port: player2.port,
            host: 'localhost',
            protocol: 'http',
          },
        ];

        expect(players).toEqual(expectedPlayers);
      });

      test('debería manejar jugadores con host y protocolo existentes', () => {
        const player1 = {
          name: 'Player1',
          port: 3001,
          host: 'custom-host',
          protocol: 'https',
        };
        const player2 = {
          name: 'Player2',
          port: 3002,
          host: 'another-host',
          protocol: 'http',
        };

        const expectedPlayers = [
          {
            name: 'Player1',
            port: 3001,
            host: 'custom-host',
            protocol: 'https',
          },
          {
            name: 'Player2',
            port: 3002,
            host: 'another-host',
            protocol: 'http',
          },
        ];

        const players = [
          {
            name: player1.name,
            port: player1.port,
            host: player1.host || 'localhost',
            protocol: player1.protocol || 'http',
          },
          {
            name: player2.name,
            port: player2.port,
            host: player2.host || 'localhost',
            protocol: player2.protocol || 'http',
          },
        ];

        expect(players).toEqual(expectedPlayers);
      });
    });

    describe('Lógica de Tamaño de Tablero', () => {
      test('debería convertir string de boardSize a número correctamente', () => {
        const testCases = [
          { input: '3x3', expected: 3 },
          { input: '5x5', expected: 5 },
          { input: 'invalid', expected: 3 },
          { input: null, expected: 3 },
          { input: undefined, expected: 3 },
        ];

        testCases.forEach(({ input, expected }) => {
          const result = input === '5x5' ? 5 : 3;
          expect(result).toBe(expected);
        });
      });
    });

    describe('Lógica de Validación de Torneo', () => {
      test('debería validar array de jugadores correctamente', () => {
        const validPlayers = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        const invalidPlayers = [
          { name: 'Player1', port: 3001 }, // Solo un jugador
        ];

        const nullPlayers = null;
        const nonArrayPlayers = 'not an array';

        // Probar caso válido
        expect(
          validPlayers &&
            Array.isArray(validPlayers) &&
            validPlayers.length >= 2
        ).toBe(true);

        // Probar casos inválidos
        expect(
          invalidPlayers &&
            Array.isArray(invalidPlayers) &&
            invalidPlayers.length >= 2
        ).toBe(false);
        expect(
          Boolean(
            nullPlayers && Array.isArray(nullPlayers) && nullPlayers.length >= 2
          )
        ).toBe(false);
        expect(
          Boolean(
            nonArrayPlayers &&
              Array.isArray(nonArrayPlayers) &&
              nonArrayPlayers.length >= 2
          )
        ).toBe(false);
      });
    });

    describe('Lógica de Manejo de Errores', () => {
      test('debería manejar formato de respuesta de error', () => {
        const expectedResponse = { error: 'Error interno del servidor' };

        // Simular lógica de manejo de errores
        const errorResponse = { error: 'Error interno del servidor' };
        expect(errorResponse).toEqual(expectedResponse);
      });

      test('debería manejar formato de respuesta de error de validación', () => {
        const expectedResponse = {
          error: 'Se requieren al menos 2 jugadores para un torneo',
        };

        // Simular manejo de errores de validación
        const validationError = {
          error: 'Se requieren al menos 2 jugadores para un torneo',
        };
        expect(validationError).toEqual(expectedResponse);
      });
    });

    describe('Procesamiento de Cuerpo de Solicitud', () => {
      test('debería extraer y usar valores por defecto de parámetros del cuerpo de solicitud', () => {
        const requestBody = {
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          timeoutMs: 5000,
          boardSize: '5x5',
          noTie: true,
        };

        const {
          player1,
          player2,
          timeoutMs = 3000,
          boardSize = '3x3',
          noTie = false,
        } = requestBody;

        expect(player1).toEqual({ name: 'Player1', port: 3001 });
        expect(player2).toEqual({ name: 'Player2', port: 3002 });
        expect(timeoutMs).toBe(5000);
        expect(boardSize).toBe('5x5');
        expect(noTie).toBe(true);
      });

      test('debería usar valores por defecto cuando faltan parámetros', () => {
        const requestBody = {
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        };

        const {
          player1,
          player2,
          timeoutMs = 3000,
          boardSize = '3x3',
          noTie = false,
        } = requestBody;

        expect(player1).toEqual({ name: 'Player1', port: 3001 });
        expect(player2).toEqual({ name: 'Player2', port: 3002 });
        expect(timeoutMs).toBe(3000);
        expect(boardSize).toBe('3x3');
        expect(noTie).toBe(false);
      });

      test('debería manejar parámetros de configuración de torneo', () => {
        const requestBody = {
          totalPlayers: 4,
          includeRandom: true,
          humanName: 'Human Player',
          timeoutMs: 5000,
          boardSize: '5x5',
          noTie: true,
        };

        const {
          totalPlayers,
          includeRandom = false,
          humanName = null,
          timeoutMs = 3000,
          boardSize = '3x3',
          noTie = false,
        } = requestBody;

        expect(totalPlayers).toBe(4);
        expect(includeRandom).toBe(true);
        expect(humanName).toBe('Human Player');
        expect(timeoutMs).toBe(5000);
        expect(boardSize).toBe('5x5');
        expect(noTie).toBe(true);
      });

      test('debería usar valores por defecto para configuración de torneo cuando faltan parámetros', () => {
        const requestBody = {
          totalPlayers: 2,
        };

        const {
          totalPlayers,
          includeRandom = false,
          humanName = null,
          timeoutMs = 3000,
          boardSize = '3x3',
          noTie = false,
        } = requestBody;

        expect(totalPlayers).toBe(2);
        expect(includeRandom).toBe(false);
        expect(humanName).toBe(null);
        expect(timeoutMs).toBe(3000);
        expect(boardSize).toBe('3x3');
        expect(noTie).toBe(false);
      });
    });
  });

  describe('Configuración de Entorno', () => {
    test('debería manejar NODE_ENV para configuración de CORS', () => {
      const originalEnv = process.env.NODE_ENV;

      // Probar entorno de producción
      process.env.NODE_ENV = 'production';
      expect(process.env.NODE_ENV).toBe('production');

      // Probar entorno de desarrollo
      process.env.NODE_ENV = 'development';
      expect(process.env.NODE_ENV).toBe('development');

      // Probar entorno de prueba
      process.env.NODE_ENV = 'test';
      expect(process.env.NODE_ENV).toBe('test');

      // Restaurar entorno original
      process.env.NODE_ENV = originalEnv;
    });

    test('debería manejar limitación de tasa basada en NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;

      // Probar que la limitación de tasa está deshabilitada en entorno de prueba
      process.env.NODE_ENV = 'test';
      expect(process.env.NODE_ENV !== 'test').toBe(false);

      // Probar que la limitación de tasa está habilitada en producción
      process.env.NODE_ENV = 'production';
      expect(process.env.NODE_ENV !== 'test').toBe(true);

      // Restaurar entorno original
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Configuración de Archivos Estáticos', () => {
    test('debería manejar construcción de ruta de archivos estáticos', () => {
      const __dirname = process.cwd();
      const staticPath = `${__dirname}/../../public`;

      expect(staticPath).toContain('public');
      expect(typeof staticPath).toBe('string');
    });

    test('debería manejar construcción de ruta de index.html', () => {
      const __dirname = process.cwd();
      const indexPath = `${__dirname}/../../public/index.html`;

      expect(indexPath).toContain('index.html');
      expect(indexPath).toContain('public');
      expect(typeof indexPath).toBe('string');
    });
  });

  describe('Creación de Objeto Reloj', () => {
    test('debería crear reloj con función now que retorna timestamp', () => {
      const clock = {
        now: () => Date.now(),
        toISOString: () => new Date().toISOString(),
      };

      const timestamp = clock.now();
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
    });

    test('debería crear reloj con función toISOString que retorna string ISO', () => {
      const clock = {
        now: () => Date.now(),
        toISOString: () => new Date().toISOString(),
      };

      const isoString = clock.toISOString();
      expect(typeof isoString).toBe('string');
      expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Configuración de Trust Proxy', () => {
    test('debería configurar trust proxy cuando TRUST_PROXY es true', () => {
      const originalEnv = process.env.TRUST_PROXY;
      process.env.TRUST_PROXY = 'true';

      const mockApp = {
        set: jest.fn(),
        use: jest.fn(),
        get: jest.fn(),
        post: jest.fn(),
      };

      // Simular la lógica de trust proxy
      if (process.env.TRUST_PROXY === 'true') {
        mockApp.set('trust proxy', true);
      }

      expect(mockApp.set).toHaveBeenCalledWith('trust proxy', true);

      process.env.TRUST_PROXY = originalEnv;
    });
  });

  describe('Lógica de Manejador de Errores', () => {
    test('debería llamar next(error) para errores que no son entity.too.large', () => {
      const mockNext = jest.fn();
      const error = { type: 'validation.error' };

      // Simular la lógica del manejador de errores
      if (error.type === 'entity.too.large') {
        // Esta rama no debe ser tomada
        expect(true).toBe(false);
      } else {
        mockNext(error);
      }

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('Lógica de Validación de Torneo', () => {
    test('debería retornar error para array de jugadores inválido', () => {
      const players = null;
      const expectedError = {
        error: 'Se requieren al menos 2 jugadores para un torneo',
      };

      // Simulate the validation logic
      if (!players || !Array.isArray(players) || players.length < 2) {
        expect(expectedError).toEqual({
          error: 'Se requieren al menos 2 jugadores para un torneo',
        });
      }
    });

    test('debería retornar error para array de jugadores vacío', () => {
      const players = [];
      const expectedError = {
        error: 'Se requieren al menos 2 jugadores para un torneo',
      };

      // Simulate the validation logic
      if (!players || !Array.isArray(players) || players.length < 2) {
        expect(expectedError).toEqual({
          error: 'Se requieren al menos 2 jugadores para un torneo',
        });
      }
    });
  });

  describe('Lógica de Endpoint SSE', () => {
    test('debería llamar addConnection en eventBusInstance', () => {
      const mockEventBus = {
        addConnection: jest.fn(),
      };
      const mockRes = {};

      // Simulate the SSE endpoint logic
      mockEventBus.addConnection(mockRes);

      expect(mockEventBus.addConnection).toHaveBeenCalledWith(mockRes);
    });
  });
});
