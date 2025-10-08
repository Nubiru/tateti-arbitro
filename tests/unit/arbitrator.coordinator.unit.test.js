/**
 * Pruebas Unitarias de ArbitratorCoordinator
 * Pruebas para el coordinador arbitrator.coordinator.js
 * @lastModified 2025-10-06
 * @version 1.0.0
 */

import { ArbitratorCoordinator } from '../../src/domain/game/arbitrator.coordinator.js';
import {
  createMockArbitratorDependencies,
  createMockPlayers,
} from '../helpers/test-factories.js';

describe('Pruebas Unitarias de ArbitratorCoordinator', () => {
  let coordinator;
  let mockDependencies;

  beforeEach(() => {
    mockDependencies = createMockArbitratorDependencies();
    coordinator = new ArbitratorCoordinator(mockDependencies);
  });

  describe('Constructor', () => {
    test('debería crear instancia con dependencias inyectadas', () => {
      expect(coordinator.httpAdapter).toBe(mockDependencies.httpAdapter);
      expect(coordinator.eventsAdapter).toBe(mockDependencies.eventsAdapter);
      expect(coordinator.clock).toBe(mockDependencies.clock);
    });

    test('debería usar Date como clock por defecto', () => {
      const coordinatorWithoutClock = new ArbitratorCoordinator({
        httpAdapter: mockDependencies.httpAdapter,
        eventsAdapter: mockDependencies.eventsAdapter,
      });
      expect(coordinatorWithoutClock.clock).toBe(Date);
    });
  });

  describe('runMatch', () => {
    const mockPlayers = createMockPlayers();

    test('debería ejecutar partida exitosa con ganador', async () => {
      // Mock HTTP adapter responses
      mockDependencies.httpAdapter.requestMove
        .mockResolvedValueOnce({ move: 0, error: null }) // Player1 move
        .mockResolvedValueOnce({ move: 1, error: null }) // Player2 move
        .mockResolvedValueOnce({ move: 3, error: null }) // Player1 move
        .mockResolvedValueOnce({ move: 4, error: null }) // Player2 move
        .mockResolvedValueOnce({ move: 6, error: null }); // Player1 move (wins)

      const result = await coordinator.runMatch(mockPlayers, {
        boardSize: 3,
        timeoutMs: 1000,
        noTie: false,
      });

      expect(result.winner.name).toBe('Bot1');
      expect(result.winner.id).toBe('X');
      expect(result.result).toBe('win');
      expect(result.finalBoard).toEqual(['X', 'O', 0, 'X', 'O', 0, 'X', 0, 0]);
      expect(
        mockDependencies.eventsAdapter.broadcastMatchStart
      ).toHaveBeenCalled();
      expect(
        mockDependencies.eventsAdapter.broadcastMatchWin
      ).toHaveBeenCalled();
    });

    test('debería ejecutar partida con empate', async () => {
      // Mock moves that result in a TRUE draw
      // Board will be: X O X
      //                X X O
      //                O X O
      mockDependencies.httpAdapter.requestMove
        .mockResolvedValueOnce({ move: 0, error: null }) // Player1 (X)
        .mockResolvedValueOnce({ move: 1, error: null }) // Player2 (O)
        .mockResolvedValueOnce({ move: 2, error: null }) // Player1 (X)
        .mockResolvedValueOnce({ move: 6, error: null }) // Player2 (O)
        .mockResolvedValueOnce({ move: 3, error: null }) // Player1 (X)
        .mockResolvedValueOnce({ move: 5, error: null }) // Player2 (O)
        .mockResolvedValueOnce({ move: 4, error: null }) // Player1 (X)
        .mockResolvedValueOnce({ move: 8, error: null }) // Player2 (O)
        .mockResolvedValueOnce({ move: 7, error: null }); // Player1 (X) - draw

      const result = await coordinator.runMatch(mockPlayers, {
        boardSize: 3,
        timeoutMs: 1000,
        noTie: false,
      });

      expect(result.winner).toBeNull();
      expect(result.result).toBe('draw');
      expect(
        mockDependencies.eventsAdapter.broadcastMatchDraw
      ).toHaveBeenCalled();
    });

    test('debería manejar error de jugador', async () => {
      mockDependencies.httpAdapter.requestMove.mockResolvedValueOnce({
        move: null,
        error: 'Player timeout',
      });

      const result = await coordinator.runMatch(mockPlayers, {
        boardSize: 3,
        timeoutMs: 1000,
        noTie: false,
      });

      // When Player1 errors, Player2 wins by default
      expect(result.winner.name).toBe('Bot2');
      expect(result.result).toBe('error');
      expect(result.message).toContain('Player timeout');
      expect(
        mockDependencies.eventsAdapter.broadcastMatchError
      ).toHaveBeenCalled();
    });

    test('debería validar jugadores correctamente', async () => {
      const invalidPlayers = [{ name: 'Player1', port: 3001 }]; // Solo un jugador

      await expect(coordinator.runMatch(invalidPlayers)).rejects.toThrow(
        'Se necesitan exactamente 2 jugadores para la partida'
      );
    });

    test('debería usar opciones por defecto', async () => {
      mockDependencies.httpAdapter.requestMove
        .mockResolvedValueOnce({ move: 0, error: null })
        .mockResolvedValueOnce({ move: 1, error: null })
        .mockResolvedValueOnce({ move: 3, error: null })
        .mockResolvedValueOnce({ move: 4, error: null })
        .mockResolvedValueOnce({ move: 6, error: null });

      const result = await coordinator.runMatch(mockPlayers);

      expect(result.finalBoard).toHaveLength(9); // 3x3 por defecto
      expect(result.winner.name).toBe('Bot1');
      expect(result.result).toBe('win');
    });

    test('debería manejar tablero 5x5', async () => {
      mockDependencies.httpAdapter.requestMove
        .mockResolvedValueOnce({ move: 0, error: null })
        .mockResolvedValueOnce({ move: 1, error: null })
        .mockResolvedValueOnce({ move: 5, error: null })
        .mockResolvedValueOnce({ move: 6, error: null })
        .mockResolvedValueOnce({ move: 10, error: null })
        .mockResolvedValueOnce({ move: 11, error: null })
        .mockResolvedValueOnce({ move: 15, error: null })
        .mockResolvedValueOnce({ move: 16, error: null })
        .mockResolvedValueOnce({ move: 20, error: null });

      const result = await coordinator.runMatch(mockPlayers, {
        boardSize: '5x5',
        timeoutMs: 1000,
      });

      expect(result.finalBoard).toHaveLength(25); // 5x5
    });
  });
});
