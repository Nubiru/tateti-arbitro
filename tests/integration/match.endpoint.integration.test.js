/**
 * Integration Tests for POST /api/match Endpoint
 * Tests full HTTP request flow: validation → normalization → execution → SSE
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app/app.factory.js';

describe('POST /api/match - Integration Tests', () => {
  let app;
  let mockArbitrator;
  let mockEventBus;
  let mockLogger;
  let mockTournament;
  let originalEnv;

  // Mock match result for successful execution
  const mockMatchResult = {
    players: [
      { name: 'Player1', port: 3001, id: 'X' },
      { name: 'Player2', port: 3002, id: 'O' },
    ],
    history: [
      { player: 'Player1', position: 0, symbol: 'X' },
      { player: 'Player2', position: 1, symbol: 'O' },
      { player: 'Player1', position: 4, symbol: 'X' },
    ],
    winner: { name: 'Player1', port: 3001, id: 'X' },
    winningLine: [0, 4, 8],
    result: 'win',
    message: 'Player1 ganó.',
    finalBoard: [1, 2, 0, 0, 1, 0, 0, 0, 1],
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

    mockArbitrator = {
      runMatch: jest.fn().mockResolvedValue(mockMatchResult),
    };

    mockTournament = {
      runTournament: jest.fn(),
      buildPlayerList: jest.fn(),
    };

    const mockClock = {
      now: () => new Date(),
      toISOString: () => new Date().toISOString(),
    };

    // Create app with mocked dependencies
    const { app: testApp } = createApp({
      logger: mockLogger,
      eventBus: mockEventBus,
      arbitrator: mockArbitrator,
      tournament: mockTournament,
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
    jest.useRealTimers();
  });

  afterAll(() => {
    // Restore all mocks
    jest.restoreAllMocks();
  });

  describe('Validation Integration', () => {
    test('should return 400 for missing player1', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player2: { name: 'Player2', port: 3002 },
          boardSize: '3x3',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('jugadores');
    });

    test('should return 400 for missing player2', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          boardSize: '3x3',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('jugadores');
    });

    test('should return 400 for invalid boardSize', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '7x7', // Invalid
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should return 400 for invalid player port', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 'invalid' },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '3x3',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Player Normalization', () => {
    test('should normalize player data correctly', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: '  Player1  ', port: 3001 },
          player2: { name: '  Player2  ', port: 3002 },
          boardSize: '3x3',
        });

      expect(response.status).toBe(200);

      // Verify arbitrator was called with normalized players
      expect(mockArbitrator.runMatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Player1', // Trimmed
            port: 3001,
            protocol: 'http',
            isHuman: false,
          }),
          expect.objectContaining({
            name: 'Player2', // Trimmed
            port: 3002,
            protocol: 'http',
            isHuman: false,
          }),
        ]),
        expect.any(Object)
      );
    });

    test('should map Docker service names when DOCKER_DISCOVERY=true', async () => {
      process.env.DOCKER_DISCOVERY = 'true';

      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '3x3',
        });

      expect(response.status).toBe(200);

      // Verify Docker service names were used
      expect(mockArbitrator.runMatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Player1',
            port: 3001,
            host: 'random-bot-1', // Docker service name
          }),
          expect.objectContaining({
            name: 'Player2',
            port: 3002,
            host: 'random-bot-2', // Docker service name
          }),
        ]),
        expect.any(Object)
      );
    });

    test('should use localhost when DOCKER_DISCOVERY=false', async () => {
      process.env.DOCKER_DISCOVERY = 'false';

      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '3x3',
        });

      expect(response.status).toBe(200);

      // Verify localhost was used
      expect(mockArbitrator.runMatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Player1',
            port: 3001,
            host: 'localhost',
          }),
          expect.objectContaining({
            name: 'Player2',
            port: 3002,
            host: 'localhost',
          }),
        ]),
        expect.any(Object)
      );
    });

    test('should handle human player flag', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Human1', port: 3001, isHuman: true },
          player2: { name: 'Bot1', port: 3002, isHuman: false },
          boardSize: '3x3',
        });

      expect(response.status).toBe(200);

      // Verify human flag was preserved
      expect(mockArbitrator.runMatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Human1',
            isHuman: true,
          }),
          expect.objectContaining({
            name: 'Bot1',
            isHuman: false,
          }),
        ]),
        expect.any(Object)
      );
    });

    test('should default isHuman to false when not provided', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '3x3',
        });

      expect(response.status).toBe(200);

      // Verify isHuman defaults to false
      expect(mockArbitrator.runMatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ isHuman: false }),
          expect.objectContaining({ isHuman: false }),
        ]),
        expect.any(Object)
      );
    });
  });

  describe('Match Execution', () => {
    test('should call arbitrator.runMatch with normalized players and options', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '5x5',
          speed: 'fast',
          noTie: true,
        });

      expect(response.status).toBe(200);

      // Verify arbitrator was called with correct options
      expect(mockArbitrator.runMatch).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          boardSize: 5, // Converted to number
          noTie: true,
        })
      );
    });

    test('should use default boardSize when not provided', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        });

      expect(response.status).toBe(200);

      // Verify default boardSize (3)
      expect(mockArbitrator.runMatch).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          boardSize: 3,
        })
      );
    });

    test('should return match result in response', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '3x3',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMatchResult);
    });
  });

  describe.skip('SSE Event Broadcasting', () => {
    test('should broadcast match:start event', async () => {
      await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '3x3',
        });

      // Verify match:start was broadcast
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:start',
        expect.objectContaining({
          players: expect.arrayContaining([
            expect.objectContaining({ name: 'Player1' }),
            expect.objectContaining({ name: 'Player2' }),
          ]),
          boardSize: 3,
        })
      );
    });

    test('should broadcast match:move events from history', async () => {
      await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '3x3',
        });

      // Verify match:move was broadcast for each move in history
      const moveBroadcasts = mockEventBus.broadcast.mock.calls.filter(
        call => call[0] === 'match:move'
      );

      // Should have 3 move broadcasts (from mockMatchResult.history)
      expect(moveBroadcasts.length).toBe(3);
    });

    test('should broadcast match:win on win result', async () => {
      await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '3x3',
        });

      // Verify match:win was broadcast
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:win',
        expect.objectContaining({
          winner: expect.objectContaining({ name: 'Player1' }),
          winningLine: [0, 4, 8],
          message: 'Player1 ganó.',
        })
      );
    });

    test('should broadcast match:draw on draw result', async () => {
      // Mock draw result
      const drawResult = {
        ...mockMatchResult,
        winner: null,
        winningLine: null,
        result: 'draw',
        message: 'Empate.',
      };

      mockArbitrator.runMatch.mockResolvedValueOnce(drawResult);

      await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '3x3',
        });

      // Verify match:draw was broadcast
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:draw',
        expect.objectContaining({
          message: 'Empate.',
          finalBoard: expect.any(Array),
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('should return 500 on arbitrator execution error', async () => {
      // Mock arbitrator error
      mockArbitrator.runMatch.mockRejectedValueOnce(
        new Error('Bot timeout error')
      );

      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '3x3',
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });
});
