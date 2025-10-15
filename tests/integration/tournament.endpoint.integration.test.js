/**
 * Pruebas de Integración para el Endpoint POST /api/tournament
 * Pruebas del flujo completo de solicitud HTTP: validación → ejecución → SSE
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app/app.factory.js';

describe('POST /api/tournament - Pruebas de Integración', () => {
  let app;
  let mockTournament;
  let mockEventBus;
  let mockLogger;
  let mockArbitrator;
  let originalEnv;

  // Resultado mock del torneo
  const mockTournamentResult = {
    players: [
      { name: 'Player1', port: 3001 },
      { name: 'Player2', port: 3002 },
      { name: 'Player3', port: 3003 },
      { name: 'Player4', port: 3004 },
    ],
    rounds: [
      {
        roundNumber: 1,
        matches: [
          {
            player1: { name: 'Player1', port: 3001 },
            player2: { name: 'Player2', port: 3002 },
            winner: { name: 'Player1', port: 3001 },
          },
          {
            player1: { name: 'Player3', port: 3003 },
            player2: { name: 'Player4', port: 3004 },
            winner: { name: 'Player3', port: 3003 },
          },
        ],
      },
      {
        roundNumber: 2,
        matches: [
          {
            player1: { name: 'Player1', port: 3001 },
            player2: { name: 'Player3', port: 3003 },
            winner: { name: 'Player1', port: 3001 },
          },
        ],
      },
    ],
    winner: { name: 'Player1', port: 3001 },
    runnerUp: { name: 'Player3', port: 3003 },
    status: 'completed',
  };

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

    mockTournament = {
      runTournament: jest.fn().mockResolvedValue(mockTournamentResult),
      buildPlayerList: jest.fn(),
    };

    mockArbitrator = {
      runMatch: jest.fn(),
    };

    const mockClock = {
      now: () => new Date(),
      toISOString: () => new Date().toISOString(),
    };

    // Crear app con dependencias mock
    const { app: testApp } = createApp({
      logger: mockLogger,
      eventBus: mockEventBus,
      tournament: mockTournament,
      arbitrator: mockArbitrator,
      clock: mockClock,
    });

    app = testApp;
  });

  afterEach(() => {
    // Restaurar entorno
    process.env = originalEnv;

    // Limpiar todos los mocks
    jest.clearAllMocks();

    // Limpiar todos los temporizadores para evitar cuelgues
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  afterAll(() => {
    // Restaurar todos los mocks
    jest.restoreAllMocks();
  });

  describe('Validación', () => {
    test('debería retornar 400 para jugadores faltantes', async () => {
      const response = await request(app).post('/api/tournament').send({
        boardSize: '3x3',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('debería retornar 400 para jugadores que no son array', async () => {
      const response = await request(app).post('/api/tournament').send({
        players: 'not-an-array',
        boardSize: '3x3',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('debería retornar 400 para un solo jugador', async () => {
      const response = await request(app)
        .post('/api/tournament')
        .send({
          players: [{ name: 'Player1', port: 3001 }],
          boardSize: '3x3',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('debería retornar 400 para array de jugadores vacío', async () => {
      const response = await request(app).post('/api/tournament').send({
        players: [],
        boardSize: '3x3',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('debería aceptar 2+ jugadores', async () => {
      const response = await request(app)
        .post('/api/tournament')
        .send({
          players: [
            { name: 'Player1', port: 3001 },
            { name: 'Player2', port: 3002 },
          ],
          boardSize: '3x3',
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Ejecución del Torneo', () => {
    test('debería llamar tournament.runTournament con jugadores y opciones', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
        { name: 'Player3', port: 3003 },
        { name: 'Player4', port: 3004 },
      ];

      const response = await request(app).post('/api/tournament').send({
        players,
        boardSize: '5x5',
        timeoutMs: 5000,
        noTie: true,
      });

      expect(response.status).toBe(200);

      // Verificar que tournament.runTournament fue llamado con argumentos correctos
      expect(mockTournament.runTournament).toHaveBeenCalledWith(
        players,
        expect.objectContaining({
          boardSize: 5, // Convertido de '5x5'
          timeoutMs: 5000,
          noTie: true,
        })
      );
    });

    test('debería convertir boardSize string a número (3x3)', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      await request(app).post('/api/tournament').send({
        players,
        boardSize: '3x3',
      });

      expect(mockTournament.runTournament).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          boardSize: 3,
        })
      );
    });

    test('debería convertir boardSize string a número (5x5)', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      await request(app).post('/api/tournament').send({
        players,
        boardSize: '5x5',
      });

      expect(mockTournament.runTournament).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          boardSize: 5,
        })
      );
    });

    test('debería usar boardSize por defecto cuando no se proporciona', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      await request(app).post('/api/tournament').send({
        players,
      });

      expect(mockTournament.runTournament).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          boardSize: 3, // Por defecto
        })
      );
    });

    test('debería usar timeoutMs por defecto cuando no se proporciona', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      await request(app).post('/api/tournament').send({
        players,
      });

      expect(mockTournament.runTournament).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          timeoutMs: 3000, // Por defecto
        })
      );
    });

    test('debería usar noTie por defecto cuando no se proporciona', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      await request(app).post('/api/tournament').send({
        players,
      });

      expect(mockTournament.runTournament).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          noTie: false, // Por defecto
        })
      );
    });

    test('debería retornar resultado del torneo en la respuesta', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
        { name: 'Player3', port: 3003 },
        { name: 'Player4', port: 3004 },
      ];

      const response = await request(app).post('/api/tournament').send({
        players,
        boardSize: '3x3',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTournamentResult);
    });
  });

  describe('Manejo de Errores', () => {
    test('debería retornar 500 en error de ejecución del torneo', async () => {
      // Mock error del torneo
      mockTournament.runTournament.mockRejectedValueOnce(
        new Error('Tournament execution failed')
      );

      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const response = await request(app).post('/api/tournament').send({
        players,
        boardSize: '3x3',
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });
  });

  describe('Soporte para Múltiples Jugadores', () => {
    test('debería manejar torneo de 4 jugadores', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
        { name: 'Player3', port: 3003 },
        { name: 'Player4', port: 3004 },
      ];

      const response = await request(app).post('/api/tournament').send({
        players,
        boardSize: '3x3',
      });

      expect(response.status).toBe(200);
      expect(mockTournament.runTournament).toHaveBeenCalledWith(
        expect.arrayContaining(players),
        expect.any(Object)
      );
    });

    test('debería manejar torneo de 8 jugadores', async () => {
      const players = Array.from({ length: 8 }, (_, i) => ({
        name: `Player${i + 1}`,
        port: 3001 + i,
      }));

      const response = await request(app).post('/api/tournament').send({
        players,
        boardSize: '3x3',
      });

      expect(response.status).toBe(200);
      expect(mockTournament.runTournament).toHaveBeenCalledWith(
        expect.arrayContaining(players),
        expect.any(Object)
      );
    });
  });
});
