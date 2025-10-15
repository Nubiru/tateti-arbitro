/**
 * Fábrica de Aplicación para Inyección de Dependencias
 * Crea aplicación Express con dependencias inyectadas para pruebas y producción
 * @lastModified 2025-01-27
 * @version 1.1.0
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { join } from 'path';

import logger from './logger.js';
import eventBus from './event-bus.js';
import { createHttpAdapter } from '../domain/game/http.adapter.js';
import { createEventsAdapter } from '../domain/game/events.adapter.js';
import { ArbitratorCoordinator } from '../domain/game/arbitrator.coordinator.js';
import { TournamentCoordinator } from '../domain/game/tournament.di.js';
import {
  validateMatch,
  validateTournament,
  validateTournamentConfig,
  validateMove,
  handleValidationErrors,
  sanitizeInput,
} from '../middleware/validation.js';

// Obtener directorio actual para archivos estáticos
// const publicPath = process.cwd(); // Removed unused variable

/**
 * Crear aplicación Express con dependencias
 * @param {Object} dependencies - Dependencias opcionales para pruebas
 * @returns {Object} Aplicación Express y dependencias
 */
export function createApp(dependencies = {}) {
  // Crear dependencias por defecto si no se proporcionan
  const eventBusInstance = dependencies.eventBus || eventBus;

  /**
   * Load named Vercel bots from individual environment variables
   * @returns {Array} Array of bot configurations
   */
  const loadNamedVercelBots = () => {
    const namedBots = [];

    // Support up to 10 named Vercel bots
    for (let i = 1; i <= 10; i++) {
      const nameKey = `VERCEL_BOT_${i}_NAME`;
      const urlKey = `VERCEL_BOT_${i}_URL`;

      const name = process.env[nameKey];
      const url = process.env[urlKey];

      if (name && url) {
        namedBots.push({
          name: name.trim(),
          url: url.trim(),
          type: 'vercel',
          capabilities: ['3x3', '5x5'],
          source: 'vercel',
        });
      }
    }

    return namedBots;
  };
  const httpAdapter = dependencies.httpAdapter || createHttpAdapter({ logger });
  const eventsAdapter =
    dependencies.eventsAdapter ||
    createEventsAdapter({ eventBus: eventBusInstance, logger });

  console.log('🔌 App Factory: EventsAdapter created:', !!eventsAdapter);
  console.log('🔌 App Factory: EventBus instance:', !!eventBusInstance);
  const arbitrator =
    dependencies.arbitrator ||
    new ArbitratorCoordinator({
      httpAdapter,
      eventsAdapter,
      logger,
      clock: {
        now: () => new Date(),
        toISOString: () => new Date().toISOString(),
      },
    });
  const tournament =
    dependencies.tournament ||
    new TournamentCoordinator({
      arbitrator,
      eventsAdapter: eventsAdapter,
      logger,
      clock: {
        now: () => new Date(),
        toISOString: () => new Date().toISOString(),
      },
    });

  // Crear aplicación Express
  const app = express();

  // Configuración de confianza de proxy (solo para desarrollo local)
  if (process.env.NODE_ENV === 'development') {
    app.set('trust proxy', 'loopback');
  }

  // Middleware de seguridad
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'http://localhost:*', 'ws://localhost:*'],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      xssFilter: true,
      frameguard: { action: 'deny' },
    })
  );

  // Configuración CORS
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === 'production'
          ? ['https://yourdomain.com']
          : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Origin',
        'X-Requested-With',
        'Accept',
      ],
    })
  );

  // Limitación de velocidad (deshabilitada en entorno de pruebas y desarrollo)
  if (
    process.env.NODE_ENV !== 'test' &&
    process.env.NODE_ENV !== 'development'
  ) {
    app.use(
      rateLimit({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos por defecto
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // límite de 100 solicitudes por IP por ventana por defecto
        message: 'Demasiadas solicitudes',
      })
    );
  }

  // Middleware de análisis de cuerpo de solicitud
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Middleware de sanitización de entrada
  app.use(sanitizeInput);

  // Manejar errores de límite de tamaño del cuerpo
  app.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') {
      return res
        .status(413)
        .json({ error: 'Entidad de solicitud demasiado grande' });
    }
    next(error);
  });

  // Archivos estáticos y ruta raíz se manejan más abajo

  // Rutas de verificación de salud
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  app.get('/api/health/detailed', (req, res) => {
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptime,
        formatted: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      },
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memory.external / 1024 / 1024)} MB`,
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // Estado del flujo SSE
  app.get('/api/stream/status', (req, res) => {
    const metrics = eventBusInstance.getMetrics();
    res.json({
      connections: eventBusInstance.getConnectionCount(),
      eventsSent: metrics.totalEvents,
      metrics: metrics,
    });
  });

  // Statistics endpoint
  app.get('/api/statistics', (req, res) => {
    try {
      // TODO: Implement StatisticsService integration
      res.json({
        totalGames: 0,
        wins: 0,
        draws: 0,
        totalMoves: 0,
        averageMovesPerGame: 0,
        message: 'Statistics tracking not yet implemented',
      });
    } catch (error) {
      logger.error('STATS', 'ROUTE', 'ERROR', 'Error en ruta de estadísticas', {
        error: error.message,
      });
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Rutas de partidas
  app.post(
    '/api/match',
    validateMatch,
    handleValidationErrors,
    async (req, res) => {
      try {
        if (process.env.NODE_ENV !== 'test') {
          console.log('✅ Match endpoint - Validation passed');
          console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
        }
        const {
          player1,
          player2,
          timeoutMs = 3000,
          boardSize = '3x3',
          noTie = false,
        } = req.body;

        const getHostForPort = port => {
          if (process.env.DOCKER_DISCOVERY === 'true') {
            // Map ports to Docker service names for 8-player support
            const portToService = {
              3001: 'random-bot-1',
              3002: 'random-bot-2',
              3003: 'random-bot-3',
              3004: 'random-bot-4',
              3005: 'algo-bot-1',
              3006: 'algo-bot-2',
              3007: 'algo-bot-3',
              3008: 'algo-bot-4',
            };
            return portToService[port] || 'localhost';
          }
          return 'localhost';
        };

        const players = [
          {
            name: player1.name,
            port: player1.port || null,
            url: player1.url || null,
            host: player1.url ? null : getHostForPort(player1.port),
            protocol: player1.url ? null : 'http',
            isHuman: player1.isHuman || false,
          },
          {
            name: player2.name,
            port: player2.port || null,
            url: player2.url || null,
            host: player2.url ? null : getHostForPort(player2.port),
            protocol: player2.url ? null : 'http',
            isHuman: player2.isHuman || false,
          },
        ];

        const result = await arbitrator.runMatch(players, {
          timeoutMs,
          boardSize: boardSize === '5x5' ? 5 : 3,
          noTie,
        });

        if (process.env.NODE_ENV !== 'test') {
          console.log('Match result:', result);
        }
        res.json(result);
      } catch (error) {
        logger.error('MATCH', 'ROUTE', 'ERROR', 'Error en ruta de partida', {
          error: error.message,
        });
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  );

  // Ruta para movimientos de jugadores humanos
  app.post(
    '/api/match/:matchId/move',
    validateMove,
    handleValidationErrors,
    async (req, res) => {
      try {
        const { matchId } = req.params;
        const { player, position } = req.body;

        const result = await arbitrator.submitHumanMove(
          matchId,
          player,
          position
        );
        res.json(result);
      } catch (error) {
        logger.error('MOVE', 'ROUTE', 'ERROR', 'Error en ruta de movimiento', {
          error: error.message,
        });
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Rutas de torneos
  app.post(
    '/api/tournament',
    validateTournament,
    handleValidationErrors,
    async (req, res) => {
      try {
        if (process.env.NODE_ENV !== 'test') {
          console.log(
            '🏆 Tournament endpoint called with body:',
            JSON.stringify(req.body, null, 2)
          );
          console.log('🏆 Tournament validation errors:', req.validationErrors);
        }

        const {
          players,
          timeoutMs = 3000,
          boardSize = '3x3',
          noTie = false,
        } = req.body;

        if (process.env.NODE_ENV !== 'test') {
          console.log('🏆 Tournament parsed players:', players);
          console.log('🏆 Tournament players type:', typeof players);
          console.log('🏆 Tournament players isArray:', Array.isArray(players));
        }

        if (!players || !Array.isArray(players) || players.length < 2) {
          if (process.env.NODE_ENV !== 'test') {
            console.log(
              '🏆 Tournament validation failed - invalid players array'
            );
          }
          return res.status(400).json({
            error: 'Se requieren al menos 2 jugadores para un torneo',
          });
        }

        const result = await tournament.runTournament(players, {
          timeoutMs,
          boardSize: boardSize === '5x5' ? 5 : 3,
          noTie,
        });

        res.json(result);
      } catch (error) {
        logger.error(
          'TOURNAMENT',
          'ROUTE',
          'ERROR',
          'Error en ruta de torneo',
          { error: error.message }
        );
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  );

  // Ruta de configuración de torneo (nuevo formato)
  app.post(
    '/api/tournament/config',
    validateTournamentConfig,
    handleValidationErrors,
    async (req, res) => {
      try {
        const {
          totalPlayers,
          includeRandom = false,
          humanName = null,
          timeoutMs = 3000,
          boardSize = '3x3',
          noTie = false,
        } = req.body;

        // Construir lista de jugadores desde la configuración
        const players = tournament.buildPlayerList({
          totalPlayers,
          includeRandom,
          humanName,
        });

        const result = await tournament.runTournament(players, {
          timeoutMs,
          boardSize: boardSize === '5x5' ? 5 : 3,
          noTie,
        });

        res.json(result);
      } catch (error) {
        logger.error(
          'TOURNAMENT',
          'CONFIG',
          'ERROR',
          'Error en ruta de configuración de torneo',
          { error: error.message }
        );
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  );

  // Bot discovery endpoint
  app.get('/api/bots/available', async (req, res) => {
    try {
      const availableBots = [];

      // Define bot configurations - match docker-compose.4player.yml ports
      const botConfigs = [
        {
          name: 'RandomBot1',
          port: 3001,
          type: 'random',
          capabilities: ['3x3', '5x5'],
        },
        {
          name: 'RandomBot2',
          port: 3002,
          type: 'random',
          capabilities: ['3x3', '5x5'],
        },
        {
          name: 'RandomBot3',
          port: 3005, // Fixed: was 3003, now matches docker-compose.4player.yml
          type: 'random',
          capabilities: ['3x3', '5x5'],
        },
        {
          name: 'SmartBot2',
          port: 3006, // Fixed: was RandomBot4/3004, now matches docker-compose.4player.yml
          type: 'algorithm',
          capabilities: ['3x3', '5x5'],
        },
        {
          name: 'AlgoBot1',
          port: 3007, // Shifted down to avoid conflicts
          type: 'algorithm',
          capabilities: ['3x3', '5x5'],
        },
        {
          name: 'AlgoBot2',
          port: 3008, // Shifted down to avoid conflicts
          type: 'algorithm',
          capabilities: ['3x3', '5x5'],
        },
        {
          name: 'AlgoBot3',
          port: 3009, // Shifted down to avoid conflicts
          type: 'algorithm',
          capabilities: ['3x3', '5x5'],
        },
        {
          name: 'AlgoBot4',
          port: 3010, // Shifted down to avoid conflicts
          type: 'algorithm',
          capabilities: ['3x3', '5x5'],
        },
      ];

      // Load Vercel bots from environment
      const vercelBotConfigs = [];
      if (process.env.VERCEL_BOTS_ENABLED === 'true') {
        // Method 1: Individual named bots (preferred)
        const namedBots = loadNamedVercelBots();
        if (namedBots.length > 0) {
          vercelBotConfigs.push(...namedBots);
        } else if (process.env.VERCEL_BOT_URLS) {
          // Method 2: Comma-separated URLs (fallback)
          const urls = process.env.VERCEL_BOT_URLS.split(',').map(u =>
            u.trim()
          );
          urls.forEach((url, index) => {
            vercelBotConfigs.push({
              name: `VercelBot${index + 1}`,
              url: url,
              type: 'vercel',
              capabilities: ['3x3', '5x5'],
              source: 'vercel',
            });
          });
        }
      }

      // Combine all bot configs
      const allBotConfigs = [...botConfigs, ...vercelBotConfigs];

      const getHostForPort = port => {
        if (process.env.DOCKER_DISCOVERY === 'true') {
          // Map ports to Docker service names - match docker-compose.4player.yml
          const portToService = {
            3001: 'random-bot-1',
            3002: 'random-bot-2',
            3005: 'random-bot-3', // Fixed: was 3003, now matches docker-compose.4player.yml
            3006: 'smart-bot-2', // Fixed: was 3004/algo-bot-1, now matches docker-compose.4player.yml
            3007: 'algo-bot-1', // Shifted down to avoid conflicts
            3008: 'algo-bot-2', // Shifted down to avoid conflicts
            3009: 'algo-bot-3', // Shifted down to avoid conflicts
            3010: 'algo-bot-4', // Shifted down to avoid conflicts
          };
          return portToService[port] || 'localhost';
        }
        return 'localhost';
      };

      // Check health of each bot (PARALLEL for speed)
      const healthCheckPromises = allBotConfigs.map(async bot => {
        try {
          let healthUrl;

          if (bot.url) {
            // Vercel bot - use full URL
            healthUrl = `${bot.url}/health`;
          } else {
            // Docker bot - use host:port
            const host = getHostForPort(bot.port);
            healthUrl = `http://${host}:${bot.port}/health`;
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 500); // 500ms timeout

          const response = await fetch(healthUrl, {
            method: 'GET',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            await response.json(); // Consume response but don't use data
            return {
              name: bot.name,
              port: bot.port || null,
              url: bot.url || null,
              type: bot.type,
              capabilities: bot.capabilities,
              status: 'healthy',
              source: bot.source || 'docker',
              lastSeen: new Date().toISOString(),
              isHuman: false,
            };
          } else {
            return {
              name: bot.name,
              port: bot.port || null,
              url: bot.url || null,
              type: bot.type,
              capabilities: bot.capabilities,
              status: 'unhealthy',
              source: bot.source || 'docker',
              lastSeen: null,
              isHuman: false,
            };
          }
        } catch (error) {
          return {
            name: bot.name,
            port: bot.port || null,
            url: bot.url || null,
            type: bot.type,
            capabilities: bot.capabilities,
            status: 'offline',
            source: bot.source || 'docker',
            lastSeen: null,
            isHuman: false,
          };
        }
      });

      // Wait for all health checks to complete in parallel
      const results = await Promise.all(healthCheckPromises);
      availableBots.push(...results);

      res.json({
        bots: availableBots,
        total: availableBots.length,
        healthy: availableBots.filter(b => b.status === 'healthy').length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(
        'BOTS',
        'DISCOVERY',
        'ERROR',
        'Error en descubrimiento de bots',
        { error: error.message }
      );
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Flujo de eventos del servidor (SSE)
  app.get('/api/stream', (req, res) => {
    eventBusInstance.addConnection(res);
  });

  // Archivos estáticos (debe ir ANTES del 404 handler)
  app.use(express.static(join(process.cwd(), 'public')));

  // Servir index.html para la ruta raíz
  app.get('/', (req, res) => {
    res.sendFile(join(process.cwd(), 'public', 'index.html'));
  });

  // Manejador 404 (debe ir DESPUÉS de static files)
  app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
  });

  // Manejador de errores
  app.use((error, req, res) => {
    logger.error(
      'EXPRESS',
      'ERROR',
      'HANDLER',
      'Error en manejador de Express',
      { error: error.message }
    );
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return {
    app,
    eventBus: eventBusInstance,
    httpAdapter,
    eventsAdapter,
    arbitrator,
    tournament,
  };
}

/**
 * Adjuntar limitador de velocidad a una aplicación Express existente
 * @param {Object} app - Instancia de aplicación Express
 * @param {Object} options - Opciones del limitador de velocidad
 * @returns {Object} Aplicación Express con limitador de velocidad adjunto
 */
export function attachRateLimiter(app, options = {}) {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por IP por ventana
    message: 'Demasiadas solicitudes',
  };

  const rateLimitOptions = { ...defaultOptions, ...options };
  app.use(rateLimit(rateLimitOptions));
  return app;
}

/**
 * Crear aplicación por defecto con dependencias de producción
 * @returns {Object} Aplicación Express y dependencias
 */
export function createDefaultApp() {
  return createApp();
}
