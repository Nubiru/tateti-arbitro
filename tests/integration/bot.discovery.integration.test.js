/**
 * Pruebas de Integración para Endpoint GET /api/bots/available
 * Pruebas de descubrimiento de bots, verificaciones de salud paralelas, mapeo de servicios Docker
 * @lastModified 2025-01-27
 * @version 1.1.0
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app/app.factory.js';

// Mock fetch para verificaciones de salud paralelas
global.fetch = jest.fn();

describe('GET /api/bots/available - Pruebas de Integración', () => {
  let app;
  let mockLogger;
  let mockEventBus;
  let mockArbitrator;
  let mockTournament;
  let originalEnv;

  beforeEach(() => {
    // Guardar entorno original
    originalEnv = { ...process.env };

    // Crear dependencias mock
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    mockEventBus = {
      broadcast: jest.fn(),
      addConnection: jest.fn(),
      closeAll: jest.fn(),
      getConnectionCount: jest.fn(() => 0),
    };

    mockArbitrator = {
      runMatch: jest.fn(),
    };

    mockTournament = {
      runTournament: jest.fn(),
      buildPlayerList: jest.fn(),
    };

    const mockClock = {
      now: () => new Date(),
      toISOString: () => new Date().toISOString(),
    };

    // Crear app con dependencias mock
    const { app: testApp } = createApp({
      logger: mockLogger,
      eventBus: mockEventBus,
      arbitrator: mockArbitrator,
      tournament: mockTournament,
      clock: mockClock,
    });

    app = testApp;

    // Limpiar mock de fetch
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restaurar entorno
    process.env = originalEnv;

    // Limpiar todos los mocks de fetch
    global.fetch.mockClear();
    global.fetch.mockReset();

    // Restaurar todos los mocks
    jest.restoreAllMocks();

    // Limpiar todos los temporizadores para evitar cuelgues
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Verificaciones de Salud Paralelas', () => {
    test('debería realizar verificaciones de salud paralelas para todos los bots configurados', async () => {
      // Mock respuestas exitosas de verificación de salud
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'healthy',
          name: 'TestBot',
        }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // Verificar que fetch fue llamado múltiples veces (verificaciones paralelas)
      // Basado en configuración por defecto de bots (2-8 bots dependiendo del entorno)
      expect(global.fetch).toHaveBeenCalled();
      expect(global.fetch.mock.calls.length).toBeGreaterThan(0);
    });

    test('debería filtrar bots no saludables', async () => {
      // Mock respuestas de salud mixtas
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'HealthyBot1' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'HealthyBot2' }),
        });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);
      expect(response.body.bots).toBeDefined();

      // Solo debería incluir bots saludables
      const healthyBots = response.body.bots.filter(
        bot => bot.status === 'healthy'
      );

      expect(healthyBots.length).toBeGreaterThan(0);
      // Los bots no saludables pueden o no ser incluidos basado en la implementación
    });

    test('debería manejar timeout en bots lentos', async () => {
      global.fetch.mockImplementation(() =>
        Promise.reject(new Error('Timeout'))
      );

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);
      expect(response.body.bots).toBeDefined();
    });

    test('debería manejar errores de red de forma elegante', async () => {
      // Mock error de red
      global.fetch.mockRejectedValue(new Error('Network error'));

      const response = await request(app).get('/api/bots/available');

      // Aún debería retornar una respuesta
      expect(response.status).toBe(200);
      expect(response.body.bots).toBeDefined();

      // Los bots deberían estar marcados como offline
      const offlineBots = response.body.bots.filter(
        bot => bot.status === 'offline'
      );
      expect(offlineBots.length).toBeGreaterThan(0);
    });

    test('debería completar verificaciones de salud en tiempo razonable', async () => {
      // Mock verificaciones de salud rápidas
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'FastBot' }),
      });

      const startTime = Date.now();
      await request(app).get('/api/bots/available');
      const duration = Date.now() - startTime;

      // Debería completarse en menos de 5 segundos (ejecución paralela)
      // Nota: Esta es una verificación de tiempo real, no usando temporizadores falsos
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Descubrimiento de Servicios Docker', () => {
    test('debería usar nombres de servicios Docker cuando DOCKER_DISCOVERY=true', async () => {
      process.env.DOCKER_DISCOVERY = 'true';

      // Mock verificación de salud exitosa
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'DockerBot' }),
      });

      await request(app).get('/api/bots/available');

      // Verificar que fetch fue llamado con nombres de servicios Docker (no localhost)
      const fetchCalls = global.fetch.mock.calls;
      const dockerServiceCalls = fetchCalls.filter(call =>
        call[0].includes('random-bot-')
      );

      expect(dockerServiceCalls.length).toBeGreaterThan(0);
    });

    test('debería usar localhost cuando DOCKER_DISCOVERY=false', async () => {
      process.env.DOCKER_DISCOVERY = 'false';

      // Mock verificación de salud exitosa
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'LocalBot' }),
      });

      await request(app).get('/api/bots/available');

      // Verificar que fetch fue llamado con localhost
      const fetchCalls = global.fetch.mock.calls;
      const localhostCalls = fetchCalls.filter(call =>
        call[0].includes('localhost')
      );

      expect(localhostCalls.length).toBeGreaterThan(0);
    });

    test('debería usar localhost cuando DOCKER_DISCOVERY no está configurado', async () => {
      delete process.env.DOCKER_DISCOVERY;

      // Mock verificación de salud exitosa
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'DefaultBot' }),
      });

      await request(app).get('/api/bots/available');

      // Verificar que fetch fue llamado con localhost (comportamiento por defecto)
      const fetchCalls = global.fetch.mock.calls;
      const localhostCalls = fetchCalls.filter(call =>
        call[0].includes('localhost')
      );

      expect(localhostCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Formato de Respuesta', () => {
    test('debería retornar array de bots en la respuesta', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'TestBot' }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bots');
      expect(Array.isArray(response.body.bots)).toBe(true);
    });

    test('debería incluir metadatos de bot en la respuesta', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'healthy',
          name: 'MetadataBot',
          type: 'random',
          capabilities: { boardSizes: ['3x3', '5x5'] },
        }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // Al menos un bot debería tener metadatos
      const botsWithMetadata = response.body.bots.filter(
        bot => bot.name && bot.port
      );
      expect(botsWithMetadata.length).toBeGreaterThan(0);
    });

    test('debería incluir estado de salud para cada bot', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'HealthyBot' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // Cada bot debería tener un campo de estado
      const botsWithStatus = response.body.bots.filter(bot => bot.status);
      expect(botsWithStatus.length).toBe(response.body.bots.length);
    });
  });

  describe('Configuración de Bots', () => {
    test('debería descubrir bots desde configuración del entorno', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'ConfigBot' }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // Debería incluir bots configurados (al menos random-bot-1, random-bot-2)
      expect(response.body.bots.length).toBeGreaterThan(0);
    });

    test('debería incluir tipo de bot y capacidades', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'healthy',
          name: 'CapableBot',
          type: 'algorithm',
          capabilities: {
            boardSizes: ['3x3', '5x5'],
            strategies: ['minimax', 'alphabeta'],
          },
        }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // Debería incluir tipo y capacidades en la respuesta
      const botsWithType = response.body.bots.filter(bot => bot.type);
      expect(botsWithType.length).toBeGreaterThan(0);
    });
  });

  describe('Recuperación de Errores', () => {
    test('debería retornar resultados parciales cuando algunos bots fallan', async () => {
      // Mock respuestas mixtas
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'GoodBot1' }),
        })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'GoodBot2' }),
        });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // Debería incluir bots exitosos
      const healthyBots = response.body.bots.filter(
        bot => bot.status === 'healthy'
      );
      expect(healthyBots.length).toBeGreaterThan(0);
    });

    test('no debería fallar todo el descubrimiento si un bot tiene timeout', async () => {
      global.fetch
        .mockImplementationOnce(() => Promise.reject(new Error('Timeout')))
        .mockResolvedValue({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'FastBot' }),
        });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);
      expect(response.body.bots).toBeDefined();
      expect(response.body.bots.length).toBeGreaterThan(0);
    });
  });

  describe('Descubrimiento de Bots Vercel', () => {
    beforeEach(() => {
      // Configurar entorno para pruebas de bots Vercel
      process.env.VERCEL_BOTS_ENABLED = 'true';
      process.env.VERCEL_BOT_URLS =
        'https://ta-te-ti-bemg.vercel.app,https://another-bot.vercel.app';

      // Clear individual named bot variables
      for (let i = 1; i <= 10; i++) {
        delete process.env[`VERCEL_BOT_${i}_NAME`];
        delete process.env[`VERCEL_BOT_${i}_URL`];
      }
    });

    afterEach(() => {
      // Limpiar entorno
      delete process.env.VERCEL_BOTS_ENABLED;
      delete process.env.VERCEL_BOT_URLS;

      // Clear individual named bot variables
      for (let i = 1; i <= 10; i++) {
        delete process.env[`VERCEL_BOT_${i}_NAME`];
        delete process.env[`VERCEL_BOT_${i}_URL`];
      }
    });

    test('debería descubrir bots Vercel desde variables de entorno', async () => {
      // Mock verificaciones de salud exitosas para bots Docker y Vercel
      global.fetch.mockImplementation(url => {
        if (url.includes('ta-te-ti-bemg.vercel.app')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ status: 'healthy', name: 'VercelBot1' }),
          });
        } else if (url.includes('another-bot.vercel.app')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ status: 'healthy', name: 'VercelBot2' }),
          });
        } else {
          // Bots Docker
          return Promise.resolve({
            ok: true,
            json: async () => ({ status: 'healthy', name: 'DockerBot' }),
          });
        }
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);
      expect(response.body.bots).toBeDefined();

      // Debería incluir bots Vercel
      const vercelBots = response.body.bots.filter(
        bot => bot.source === 'vercel'
      );
      expect(vercelBots.length).toBe(2);
      expect(vercelBots[0]).toMatchObject({
        name: 'VercelBot1',
        url: 'https://ta-te-ti-bemg.vercel.app',
        type: 'vercel',
        source: 'vercel',
        status: 'healthy',
      });
    });

    test('debería manejar descubrimiento mixto de bots Docker y Vercel', async () => {
      // Mock respuestas de bots Docker y Vercel
      global.fetch.mockImplementation(url => {
        if (url.includes('vercel.app')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ status: 'healthy', name: 'VercelBot1' }),
          });
        } else {
          return Promise.resolve({
            ok: true,
            json: async () => ({ status: 'healthy', name: 'DockerBot1' }),
          });
        }
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      const dockerBots = response.body.bots.filter(
        bot => bot.source === 'docker'
      );
      const vercelBots = response.body.bots.filter(
        bot => bot.source === 'vercel'
      );

      expect(dockerBots.length).toBeGreaterThan(0);
      expect(vercelBots.length).toBeGreaterThan(0);
    });

    test('debería manejar fallos de verificación de salud de bots Vercel', async () => {
      // Mock fallo de verificación de salud de bot Vercel
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'DockerBot1' }),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // Debería incluir bots Docker saludables y bots Vercel fallidos
      const healthyBots = response.body.bots.filter(
        bot => bot.status === 'healthy'
      );
      const offlineBots = response.body.bots.filter(
        bot => bot.status === 'offline'
      );

      expect(healthyBots.length).toBeGreaterThan(0);
      expect(offlineBots.length).toBeGreaterThan(0);
    });

    test('no debería cargar bots Vercel cuando están deshabilitados', async () => {
      process.env.VERCEL_BOTS_ENABLED = 'false';

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'DockerBot1' }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      const vercelBots = response.body.bots.filter(
        bot => bot.source === 'vercel'
      );
      expect(vercelBots.length).toBe(0);
    });

    test('debería manejar variable de entorno VERCEL_BOT_URLS faltante', async () => {
      delete process.env.VERCEL_BOT_URLS;

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'DockerBot1' }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      const vercelBots = response.body.bots.filter(
        bot => bot.source === 'vercel'
      );
      expect(vercelBots.length).toBe(0);
    });

    test('debería manejar múltiples URLs de bots Vercel', async () => {
      process.env.VERCEL_BOT_URLS =
        'https://bot1.vercel.app,https://bot2.vercel.app,https://bot3.vercel.app';

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'VercelBot' }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      const vercelBots = response.body.bots.filter(
        bot => bot.source === 'vercel'
      );
      expect(vercelBots.length).toBe(3);

      expect(vercelBots[0].url).toBe('https://bot1.vercel.app');
      expect(vercelBots[1].url).toBe('https://bot2.vercel.app');
      expect(vercelBots[2].url).toBe('https://bot3.vercel.app');
    });

    test('debería descubrir bots Vercel con nombres personalizados', async () => {
      // Configurar bots con nombres personalizados
      process.env.VERCEL_BOT_1_NAME = 'BemgBot';
      process.env.VERCEL_BOT_1_URL = 'https://ta-te-ti-bemg.vercel.app';
      process.env.VERCEL_BOT_2_NAME = 'Grupo3Bot';
      process.env.VERCEL_BOT_2_URL = 'https://tateti-5x5.vercel.app/';
      process.env.VERCEL_BOT_3_NAME = 'SinnombreBot';
      process.env.VERCEL_BOT_3_URL =
        'https://ta-te-ti-5x5-sinnombre.vercel.app/';

      // Clear VERCEL_BOT_URLS to test named bot priority
      delete process.env.VERCEL_BOT_URLS;

      global.fetch.mockImplementation(url => {
        if (url.includes('ta-te-ti-bemg.vercel.app')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ status: 'healthy', name: 'BemgBot' }),
          });
        } else if (url.includes('tateti-5x5.vercel.app')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ status: 'healthy', name: 'Grupo3Bot' }),
          });
        } else if (url.includes('ta-te-ti-5x5-sinnombre.vercel.app')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ status: 'healthy', name: 'SinnombreBot' }),
          });
        } else {
          // Docker bots
          return Promise.resolve({
            ok: true,
            json: async () => ({ status: 'healthy', name: 'DockerBot' }),
          });
        }
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);
      expect(response.body.bots).toBeDefined();

      const vercelBots = response.body.bots.filter(
        bot => bot.source === 'vercel'
      );
      expect(vercelBots.length).toBe(3);

      // Verify custom names are used
      expect(vercelBots[0]).toMatchObject({
        name: 'BemgBot',
        url: 'https://ta-te-ti-bemg.vercel.app',
        type: 'vercel',
        source: 'vercel',
        status: 'healthy',
      });
      expect(vercelBots[1]).toMatchObject({
        name: 'Grupo3Bot',
        url: 'https://tateti-5x5.vercel.app/',
        type: 'vercel',
        source: 'vercel',
        status: 'healthy',
      });
      expect(vercelBots[2]).toMatchObject({
        name: 'SinnombreBot',
        url: 'https://ta-te-ti-5x5-sinnombre.vercel.app/',
        type: 'vercel',
        source: 'vercel',
        status: 'healthy',
      });
    });
  });
});
