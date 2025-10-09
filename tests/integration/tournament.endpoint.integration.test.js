/**
 * Integration Tests for POST /api/tournament Endpoint
 * Tests full HTTP request flow: validation → execution → SSE
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app/app.factory.js';

describe('POST /api/tournament - Integration Tests', () => {
  let app;
  let mockTournament;
  let mockEventBus;
  let mockLogger;
  let mockArbitrator;
  let originalEnv;

  // Mock tournament result
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
    // Save original environment
    originalEnv = { ...process.env };

    // Create mock dependencies
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

    // Create app with mocked dependencies
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
    // Restore environment
    process.env = originalEnv;

    // Clear all mocks
    jest.clearAllMocks();

    // Clear all timers to prevent hanging
    jest.clearAllTimers();
  });

  afterAll(() => {
    // Restore all mocks
    jest.restoreAllMocks();
  });

  describe('Validation', () => {
    test('should return 400 for missing players', async () => {
      const response = await request(app).post('/api/tournament').send({
        boardSize: '3x3',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('jugadores');
    });

    test('should return 400 for non-array players', async () => {
      const response = await request(app).post('/api/tournament').send({
        players: 'not-an-array',
        boardSize: '3x3',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('jugadores');
    });

    test('should return 400 for single player', async () => {
      const response = await request(app)
        .post('/api/tournament')
        .send({
          players: [{ name: 'Player1', port: 3001 }],
          boardSize: '3x3',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('jugadores');
    });

    test('should return 400 for empty players array', async () => {
      const response = await request(app).post('/api/tournament').send({
        players: [],
        boardSize: '3x3',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('jugadores');
    });

    test('should accept 2+ players', async () => {
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

  describe('Tournament Execution', () => {
    test('should call tournament.runTournament with players and options', async () => {
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

      // Verify tournament.runTournament was called with correct arguments
      expect(mockTournament.runTournament).toHaveBeenCalledWith(
        players,
        expect.objectContaining({
          boardSize: 5, // Converted from '5x5'
          timeoutMs: 5000,
          noTie: true,
        })
      );
    });

    test('should convert boardSize string to number (3x3)', async () => {
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

    test('should convert boardSize string to number (5x5)', async () => {
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

    test('should use default boardSize when not provided', async () => {
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
          boardSize: 3, // Default
        })
      );
    });

    test('should use default timeoutMs when not provided', async () => {
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
          timeoutMs: 3000, // Default
        })
      );
    });

    test('should use default noTie when not provided', async () => {
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
          noTie: false, // Default
        })
      );
    });

    test('should return tournament result in response', async () => {
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

  describe('Error Handling', () => {
    test('should return 500 on tournament execution error', async () => {
      // Mock tournament error
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

    test('should log error details on failure', async () => {
      const testError = new Error('Test tournament error');
      mockTournament.runTournament.mockRejectedValueOnce(testError);

      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      await request(app).post('/api/tournament').send({
        players,
        boardSize: '3x3',
      });

      // Verify error was logged
      expect(mockLogger.error).toHaveBeenCalledWith(
        'TOURNAMENT',
        'ROUTE',
        'ERROR',
        'Error en ruta de torneo',
        expect.objectContaining({
          error: testError.message,
        })
      );
    });
  });

  describe('Multiple Players Support', () => {
    test('should handle 4-player tournament', async () => {
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

    test('should handle 8-player tournament', async () => {
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
