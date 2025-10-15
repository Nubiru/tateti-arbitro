/**
 * Pruebas de Integración para Modo Infinito (Sin Empates)
 * Pruebas de mecánica de ventana deslizante con dependencias reales
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import { ArbitratorCoordinator } from '../../src/domain/game/arbitrator.coordinator.js';
import { createMockArbitratorDependencies } from '../helpers/test-factories.js';

describe('Modo Infinito - Pruebas de Integración', () => {
  let coordinator;
  let mockDependencies;

  beforeEach(() => {
    mockDependencies = createMockArbitratorDependencies();
    // Ensure broadcastMoveRemoval is available
    mockDependencies.eventsAdapter.broadcastMoveRemoval = jest.fn();
    coordinator = new ArbitratorCoordinator(mockDependencies);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Partida Completa con Eliminaciones', () => {
    test('debería emitir eventos move:removed después del 6to movimiento', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Sequence: 9 moves to fill board (creates winning line)
      const moves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      moves.forEach(move => {
        mockDependencies.httpAdapter.requestMove.mockResolvedValueOnce({
          move,
          error: null,
        });
      });

      const result = await coordinator.runMatch(players, {
        boardSize: 3,
        noTie: true,
      });

      // Verificar que se emitieron eventos de eliminación (debería suceder desde el movimiento 6 en adelante)
      expect(
        mockDependencies.eventsAdapter.broadcastMoveRemoval
      ).toHaveBeenCalled();
      expect(result.result).toBe('win');
    });
  });

  describe('Validación de Orden de Eventos', () => {
    test('debería emitir eventos en el orden correcto', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Winning sequence
      const moves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      moves.forEach(move => {
        mockDependencies.httpAdapter.requestMove.mockResolvedValueOnce({
          move,
          error: null,
        });
      });

      await coordinator.runMatch(players, {
        boardSize: 3,
        noTie: true,
      });

      // Verify events were broadcast in order
      expect(
        mockDependencies.eventsAdapter.broadcastMatchStart
      ).toHaveBeenCalledTimes(1);
      expect(
        mockDependencies.eventsAdapter.broadcastMatchMove
      ).toHaveBeenCalled();
      expect(
        mockDependencies.eventsAdapter.broadcastMatchWin
      ).toHaveBeenCalledTimes(1);

      // Verify match:start was called first
      const startCall =
        mockDependencies.eventsAdapter.broadcastMatchStart.mock
          .invocationCallOrder[0];
      const moveCall =
        mockDependencies.eventsAdapter.broadcastMatchMove.mock
          .invocationCallOrder[0];
      expect(startCall).toBeLessThan(moveCall);
    });
  });

  describe('Consistencia del Estado del Tablero', () => {
    test('debería mantener estado válido del tablero después de eliminaciones', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const moves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      moves.forEach(move => {
        mockDependencies.httpAdapter.requestMove.mockResolvedValueOnce({
          move,
          error: null,
        });
      });

      const result = await coordinator.runMatch(players, {
        boardSize: 3,
        noTie: true,
      });

      // El resultado debería tener un tablero final válido
      expect(result.finalBoard).toBeDefined();
      expect(Array.isArray(result.finalBoard)).toBe(true);
      expect(result.finalBoard.length).toBe(9);
      expect(result.result).toBe('win');
    });

    test('debería nunca tener más de 6 marcas en el tablero durante el juego', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // 10 moves to test rolling window
      const moves = [0, 1, 2, 3, 4, 5, 6, 7, 8, 0];
      moves.forEach(move => {
        mockDependencies.httpAdapter.requestMove.mockResolvedValueOnce({
          move,
          error: null,
        });
      });

      await coordinator.runMatch(players, {
        boardSize: 3,
        noTie: true,
      });

      // Check all broadcasted moves to ensure board never exceeds 6 marks
      const moveCalls =
        mockDependencies.eventsAdapter.broadcastMatchMove.mock.calls;
      moveCalls.forEach(call => {
        const board = call[0].board;
        const marksCount = board.filter(cell => cell !== 0).length;
        expect(marksCount).toBeLessThanOrEqual(6);
      });
    });
  });

  describe('Sin Eliminación en Modo Clásico', () => {
    test('NO debería emitir move:removed cuando noTie es false', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Winning sequence
      const moves = [0, 1, 3, 4, 6]; // Player1 wins vertically
      moves.forEach(move => {
        mockDependencies.httpAdapter.requestMove.mockResolvedValueOnce({
          move,
          error: null,
        });
      });

      const result = await coordinator.runMatch(players, {
        boardSize: 3,
        noTie: false, // Classic mode
      });

      // Verify NO removal events in classic mode
      expect(
        mockDependencies.eventsAdapter.broadcastMoveRemoval
      ).not.toHaveBeenCalled();
      expect(result.result).toBe('win');
    });

    test('debería permitir empates en modo clásico', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // True draw scenario: X|X|O / O|O|X / X|O|X
      // Moves: 0(X), 3(O), 1(X), 4(O), 5(X), 2(O), 6(X), 8(O), 7(X)
      const moves = [0, 3, 1, 4, 5, 2, 6, 8, 7];
      moves.forEach(move => {
        mockDependencies.httpAdapter.requestMove.mockResolvedValueOnce({
          move,
          error: null,
        });
      });

      const result = await coordinator.runMatch(players, {
        boardSize: 3,
        noTie: false,
      });

      // El modo clásico debería permitir empates
      expect(result.result).toBe('draw');
      expect(
        mockDependencies.eventsAdapter.broadcastMoveRemoval
      ).not.toHaveBeenCalled();
    });
  });

  describe('Estructura del Evento de Eliminación', () => {
    test('debería emitir eliminación con estructura de datos completa', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const moves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      moves.forEach(move => {
        mockDependencies.httpAdapter.requestMove.mockResolvedValueOnce({
          move,
          error: null,
        });
      });

      await coordinator.runMatch(players, {
        boardSize: 3,
        noTie: true,
      });

      // Verify removal event structure
      expect(
        mockDependencies.eventsAdapter.broadcastMoveRemoval
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          matchId: expect.any(String),
          position: expect.any(Number),
          player: expect.objectContaining({
            id: expect.stringMatching(/^[XO]$/),
            name: expect.any(String),
          }),
          timestamp: expect.any(String),
        })
      );
    });
  });
});
