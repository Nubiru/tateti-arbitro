/**
 * Pruebas de integración para método runMatch de Arbitrator DI
 * Pruebas de flujo completo de juego con dependencias externas simuladas
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import { ArbitratorCoordinator } from '../../src/domain/game/arbitrator.coordinator.js';

// No se necesita simulación de módulo - simularemos los métodos de instancia directamente

describe('Pruebas de Integración de Arbitrator DI - runMatch', () => {
  let coordinator;
  let mockHttpAdapter;
  let mockEventsAdapter;
  let mockLogger;
  let mockClock;

  beforeEach(async () => {
    // Crear simulaciones primero
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    mockEventsAdapter = {
      broadcastMatchStart: jest.fn(),
      broadcastMatchMove: jest.fn(),
      broadcastMatchWin: jest.fn(),
      broadcastMatchDraw: jest.fn(),
      broadcastMatchError: jest.fn(),
    };

    // Crear adaptador HTTP simulado con implementación por defecto
    mockHttpAdapter = {
      requestMove: jest.fn().mockResolvedValue({ move: 0, error: null }),
    };

    mockClock = {
      now: jest.fn(() => 1234567890),
      toISOString: jest.fn(() => '2025-10-03T10:00:00.000Z'),
    };

    coordinator = new ArbitratorCoordinator({
      httpAdapter: mockHttpAdapter,
      eventsAdapter: mockEventsAdapter,
      logger: mockLogger,
      clock: mockClock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Game Scenarios', () => {
    test('debería complete a winning game in 3x3 board', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Limpiar implementación simulada anterior y configurar movimientos exitosos
      mockHttpAdapter.requestMove.mockReset();
      mockHttpAdapter.requestMove
        .mockResolvedValueOnce({ move: 0, error: null }) // Player1: arriba-izquierda
        .mockResolvedValueOnce({ move: 3, error: null }) // Player2: medio-izquierda
        .mockResolvedValueOnce({ move: 1, error: null }) // Player1: arriba-medio
        .mockResolvedValueOnce({ move: 4, error: null }) // Player2: centro
        .mockResolvedValueOnce({ move: 2, error: null }) // Player1: arriba-derecha (gana)
        .mockResolvedValue({ move: 0, error: null }); // Default fallback

      const result = await coordinator.runMatch(players, {
        timeoutMs: 3000,
        boardSize: 3,
        noTie: false,
      });

      // Verificar estructura del resultado
      expect(result).toHaveProperty('players');
      expect(result).toHaveProperty('history');
      expect(result).toHaveProperty('winner');
      expect(result).toHaveProperty('winningLine');
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('finalBoard');

      // Verify game outcome
      expect(result.result).toBe('win');
      expect(result.winner).toBeDefined();
      expect(result.winner.name).toBe('Player1');
      expect(result.winningLine).toBeDefined();
      expect(result.message).toContain('Player1 ganó');

      // Verify final board state
      expect(result.finalBoard).toEqual(['X', 'X', 'X', 'O', 'O', 0, 0, 0, 0]);

      // Verify history
      expect(result.history).toHaveLength(5);
      expect(result.history[0].playerName).toBe('Player1');
      expect(result.history[1].playerName).toBe('Player2');
      expect(result.history[4].playerName).toBe('Player1');

      // Verify event broadcasting
      expect(mockEventsAdapter.broadcastMatchStart).toHaveBeenCalledTimes(1);
      expect(mockEventsAdapter.broadcastMatchMove).toHaveBeenCalledTimes(5);
      expect(mockEventsAdapter.broadcastMatchWin).toHaveBeenCalledTimes(1);
      expect(mockEventsAdapter.broadcastMatchDraw).not.toHaveBeenCalled();
      expect(mockEventsAdapter.broadcastMatchError).not.toHaveBeenCalled();

      // Verify logging
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ARBITRATOR',
        'MATCH',
        'START',
        expect.any(String),
        expect.any(Object)
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ARBITRATOR',
        'MATCH',
        'WIN',
        expect.any(String),
        expect.any(Object)
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'ARBITRATOR',
        'MATCH',
        'COMPLETE',
        expect.any(String),
        expect.any(Object)
      );
    });

    test('debería complete a draw game in 3x3 board', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Clear previous mock implementation and set up draw moves
      mockHttpAdapter.requestMove.mockReset();
      // Create a draw scenario: X O X, O X O, O X O (no winner)
      const drawMoves = [0, 1, 2, 4, 3, 5, 7, 6, 8]; // Fills the board without a winner
      drawMoves.forEach(move => {
        mockHttpAdapter.requestMove.mockResolvedValueOnce({
          move,
          error: null,
        });
      });

      const result = await coordinator.runMatch(players, {
        timeoutMs: 3000,
        boardSize: 3,
        noTie: false,
      });

      expect(result.result).toBe('draw');
      expect(result.winner).toBeNull();
      expect(result.winningLine).toBeNull();
      expect(result.message).toBe('Empate.');

      // Verify final board is full
      expect(result.finalBoard.every(cell => cell !== '')).toBe(true);

      // Verify event broadcasting
      expect(mockEventsAdapter.broadcastMatchDraw).toHaveBeenCalledTimes(1);
      expect(mockEventsAdapter.broadcastMatchWin).not.toHaveBeenCalled();
    });

    test('debería complete a game in 5x5 board', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Clear previous mock implementation and set up 5x5 board moves
      mockHttpAdapter.requestMove.mockReset();
      // Create a 5x5 winning scenario: Player1 gets 5 in a row horizontally
      mockHttpAdapter.requestMove
        .mockResolvedValueOnce({ move: 0, error: null }) // Player1: X at (0,0)
        .mockResolvedValueOnce({ move: 5, error: null }) // Player2: O at (1,0)
        .mockResolvedValueOnce({ move: 1, error: null }) // Player1: X at (0,1)
        .mockResolvedValueOnce({ move: 6, error: null }) // Player2: O at (1,1)
        .mockResolvedValueOnce({ move: 2, error: null }) // Player1: X at (0,2)
        .mockResolvedValueOnce({ move: 7, error: null }) // Player2: O at (1,2)
        .mockResolvedValueOnce({ move: 3, error: null }) // Player1: X at (0,3)
        .mockResolvedValueOnce({ move: 8, error: null }) // Player2: O at (1,3)
        .mockResolvedValueOnce({ move: 4, error: null }) // Player1: X at (0,4) - wins!
        .mockResolvedValue({ move: 0, error: null }); // Default fallback

      const result = await coordinator.runMatch(players, {
        timeoutMs: 3000,
        boardSize: 5,
        noTie: false,
      });

      expect(result.result).toBe('win');
      expect(result.winner.name).toBe('Player1');
      expect(result.finalBoard).toHaveLength(25);
    });

    test.skip('should handle no-tie mode with rolling window', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Clear previous mock implementation and set up moves to fill board
      mockHttpAdapter.requestMove.mockReset();
      // Set up 9 moves to fill the 3x3 board
      const moves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      moves.forEach(move => {
        mockHttpAdapter.requestMove.mockResolvedValueOnce({
          move,
          error: null,
        });
      });

      const result = await coordinator.runMatch(players, {
        timeoutMs: 3000,
        boardSize: 3,
        noTie: true,
      });

      expect(result.result).toBe('incomplete');
      expect(result.message).toBe('La partida no finalizó correctamente.');
      expect(result.history.length).toBe(9); // Exactly board size
    });
  });

  describe('Error Scenarios', () => {
    test('debería handle HTTP adapter error', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      mockHttpAdapter.requestMove.mockResolvedValueOnce({
        move: null,
        error: 'Connection timeout',
      });

      const result = await coordinator.runMatch(players, {
        timeoutMs: 3000,
        boardSize: 3,
        noTie: false,
      });

      expect(result.result).toBe('error');
      expect(result.winner).toBeDefined();
      expect(result.winner.name).toBe('Player2');
      expect(result.message).toContain(
        'Player1 no pudo realizar un movimiento'
      );

      // Verify error event broadcasting
      expect(mockEventsAdapter.broadcastMatchError).toHaveBeenCalledTimes(1);
      expect(mockEventsAdapter.broadcastMatchError).toHaveBeenCalledWith({
        error: 'Connection timeout',
        player: expect.objectContaining({ name: 'Player1' }),
        message: expect.any(String),
        timestamp: '2025-10-03T10:00:00.000Z',
      });

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'ARBITRATOR',
        'MATCH',
        'MOVE_ERROR',
        'Error en movimiento',
        expect.objectContaining({
          player: 'Player1',
          error: 'Connection timeout',
        })
      );
    });

    test('debería handle invalid move', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Mock invalid move (out of bounds)
      mockHttpAdapter.requestMove.mockResolvedValueOnce({
        move: 10, // Invalid for 3x3 board
        error: null,
      });

      const result = await coordinator.runMatch(players, {
        timeoutMs: 3000,
        boardSize: 3,
        noTie: false,
      });

      expect(result.result).toBe('error');
      expect(result.winner.name).toBe('Player2');
      expect(result.message).toContain(
        'Player1 devolvió un movimiento inválido'
      );

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'ARBITRATOR',
        'MATCH',
        'INVALID_MOVE',
        'Movimiento inválido',
        expect.objectContaining({
          player: 'Player1',
          move: 10,
        })
      );
    });

    test('debería handle occupied cell move', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Clear previous mock implementation and set up occupied cell scenario
      mockHttpAdapter.requestMove.mockReset();
      mockHttpAdapter.requestMove
        .mockResolvedValueOnce({ move: 0, error: null }) // Player1: valid move
        .mockResolvedValueOnce({ move: 0, error: null }) // Player2: tries to occupy same cell
        .mockResolvedValue({ move: 0, error: null }); // Default fallback

      const result = await coordinator.runMatch(players, {
        timeoutMs: 3000,
        boardSize: 3,
        noTie: false,
      });

      expect(result.result).toBe('error');
      expect(result.winner.name).toBe('Player1');
      expect(result.message).toContain(
        'Player2 devolvió un movimiento inválido'
      );

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'ARBITRATOR',
        'MATCH',
        'INVALID_MOVE',
        'Movimiento inválido',
        expect.objectContaining({
          player: 'Player2',
          move: 0,
        })
      );
    });
  });

  describe('Player Validation', () => {
    test('debería lanzar error para array de jugadores inválido', async () => {
      const invalidPlayers = [{ name: 'Player1', port: 3001 }]; // Only one player

      await expect(coordinator.runMatch(invalidPlayers, {})).rejects.toThrow(
        'Se necesitan exactamente 2 jugadores para la partida'
      );
    });

    test('debería lanzar error para jugadores que no son array', async () => {
      const invalidPlayers = 'not an array';

      await expect(coordinator.runMatch(invalidPlayers, {})).rejects.toThrow(
        'Los jugadores deben ser un array'
      );
    });

    test('debería lanzar error para jugadores sin nombre', async () => {
      const invalidPlayers = [{ port: 3001 }, { name: 'Player2', port: 3002 }];

      await expect(coordinator.runMatch(invalidPlayers, {})).rejects.toThrow(
        'Jugador 1 debe tener un nombre válido'
      );
    });

    test('debería lanzar error para jugadores sin puerto', async () => {
      const invalidPlayers = [
        { name: 'Player1' },
        { name: 'Player2', port: 3002 },
      ];

      await expect(coordinator.runMatch(invalidPlayers, {})).rejects.toThrow(
        'Jugador 1 debe tener un puerto válido'
      );
    });
  });

  describe('Options Handling', () => {
    test('debería use default options when none provided', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      mockHttpAdapter.requestMove.mockResolvedValueOnce({
        move: 0,
        error: null,
      });

      const result = await coordinator.runMatch(players);

      expect(result).toBeDefined();
      expect(result.players).toHaveLength(2);
    });

    test('debería handle custom timeout', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      mockHttpAdapter.requestMove.mockResolvedValueOnce({
        move: 0,
        error: null,
      });

      const result = await coordinator.runMatch(players, {
        timeoutMs: 5000,
      });

      expect(result).toBeDefined();
      // Verify timeout was passed to HTTP adapter
      expect(mockHttpAdapter.requestMove).toHaveBeenCalledWith(
        expect.any(Object),
        '/move',
        expect.objectContaining({
          timeoutMs: 5000,
        })
      );
    });

    test('debería handle 5x5 board size', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      mockHttpAdapter.requestMove.mockResolvedValueOnce({
        move: 0,
        error: null,
      });

      const result = await coordinator.runMatch(players, {
        boardSize: 5,
      });

      expect(result).toBeDefined();
      expect(result.finalBoard).toHaveLength(25);
    });

    test.skip('should handle no-tie mode', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Clear previous mock implementation and set up moves to fill board
      mockHttpAdapter.requestMove.mockReset();
      // Set up 9 moves to fill the 3x3 board
      const moves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      moves.forEach(move => {
        mockHttpAdapter.requestMove.mockResolvedValueOnce({
          move,
          error: null,
        });
      });

      const result = await coordinator.runMatch(players, {
        noTie: true,
      });

      expect(result).toBeDefined();
      expect(result.result).toBe('incomplete');
      expect(result.history.length).toBe(9);
    });
  });

  describe('Event Broadcasting', () => {
    test('debería broadcast match start event with correct data', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      mockHttpAdapter.requestMove.mockResolvedValueOnce({
        move: 0,
        error: null,
      });

      await coordinator.runMatch(players, { boardSize: 3 });

      expect(mockEventsAdapter.broadcastMatchStart).toHaveBeenCalledWith({
        players: expect.arrayContaining([
          expect.objectContaining({ name: 'Player1', id: 'player1' }),
          expect.objectContaining({ name: 'Player2', id: 'player2' }),
        ]),
        boardSize: 3,
        timestamp: '2025-10-03T10:00:00.000Z',
      });
    });

    test('debería broadcast move events with correct data', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Clear previous mock implementation and set up move events
      mockHttpAdapter.requestMove.mockReset();
      mockHttpAdapter.requestMove
        .mockResolvedValueOnce({ move: 0, error: null })
        .mockResolvedValueOnce({ move: 1, error: null })
        .mockResolvedValue({ move: 0, error: null }); // Default fallback

      await coordinator.runMatch(players, { boardSize: 3 });

      expect(mockEventsAdapter.broadcastMatchMove).toHaveBeenCalledTimes(2);
      expect(mockEventsAdapter.broadcastMatchMove).toHaveBeenNthCalledWith(1, {
        player: expect.objectContaining({ name: 'Player1', id: 'player1' }),
        move: 0,
        board: expect.any(Array),
        turn: 1,
        timestamp: '2025-10-03T10:00:00.000Z',
      });
      expect(mockEventsAdapter.broadcastMatchMove).toHaveBeenNthCalledWith(2, {
        player: expect.objectContaining({ name: 'Player2', id: 'player2' }),
        move: 1,
        board: expect.any(Array),
        turn: 2,
        timestamp: '2025-10-03T10:00:00.000Z',
      });
    });

    test('debería broadcast win event with correct data', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Clear previous mock implementation and set up winning moves
      mockHttpAdapter.requestMove.mockReset();
      mockHttpAdapter.requestMove
        .mockResolvedValueOnce({ move: 0, error: null })
        .mockResolvedValueOnce({ move: 3, error: null })
        .mockResolvedValueOnce({ move: 1, error: null })
        .mockResolvedValueOnce({ move: 4, error: null })
        .mockResolvedValueOnce({ move: 2, error: null })
        .mockResolvedValue({ move: 0, error: null }); // Default fallback

      await coordinator.runMatch(players, { boardSize: 3 });

      expect(mockEventsAdapter.broadcastMatchWin).toHaveBeenCalledWith({
        winner: expect.objectContaining({ name: 'Player1', id: 'player1' }),
        winningLine: expect.any(Array),
        finalBoard: expect.any(Array),
        message: expect.any(String),
        timestamp: '2025-10-03T10:00:00.000Z',
      });
    });
  });

  describe('Logging Verification', () => {
    test('debería log match start with correct parameters', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      mockHttpAdapter.requestMove.mockResolvedValueOnce({
        move: 0,
        error: null,
      });

      await coordinator.runMatch(players, {
        timeoutMs: 5000,
        boardSize: 3,
        noTie: true,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'ARBITRATOR',
        'MATCH',
        'START',
        'Iniciando partida',
        {
          players: ['Player1', 'Player2'],
          boardSize: '3x3',
          noTie: true,
          timeoutMs: 5000,
        }
      );
    });

    test('debería log match completion with correct parameters', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      mockHttpAdapter.requestMove.mockResolvedValueOnce({
        move: 0,
        error: null,
      });

      const result = await coordinator.runMatch(players);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'ARBITRATOR',
        'MATCH',
        'COMPLETE',
        'Partida completada',
        {
          result: result.result,
          winner: result.winner?.name || 'N/A',
          turns: result.history.length,
        }
      );
    });
  });
});
