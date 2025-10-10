/**
 * Integration Tests for Infinity Mode (No-Tie)
 * Tests rolling window mechanic with real dependencies
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import { ArbitratorCoordinator } from '../../src/domain/game/arbitrator.coordinator.js';
import { createMockArbitratorDependencies } from '../helpers/test-factories.js';

describe('Infinity Mode - Integration Tests', () => {
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

  describe('Full Match with Removals', () => {
    test('should broadcast move:removed events after 6th move', async () => {
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

      // Verify removal events were broadcast (should happen from move 6 onwards)
      expect(
        mockDependencies.eventsAdapter.broadcastMoveRemoval
      ).toHaveBeenCalled();
      expect(result.result).toBe('win');
    });
  });

  describe('Event Order Validation', () => {
    test('should emit events in correct order', async () => {
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

  describe('Board State Consistency', () => {
    test('should maintain valid board state after removals', async () => {
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

      // Result should have valid final board
      expect(result.finalBoard).toBeDefined();
      expect(Array.isArray(result.finalBoard)).toBe(true);
      expect(result.finalBoard.length).toBe(9);
      expect(result.result).toBe('win');
    });

    test('should never have more than 6 marks on board during game', async () => {
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

  describe('No Removal in Classic Mode', () => {
    test('should NOT broadcast move:removed when noTie is false', async () => {
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

    test('should allow draws in classic mode', async () => {
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

      // Classic mode should allow draws
      expect(result.result).toBe('draw');
      expect(
        mockDependencies.eventsAdapter.broadcastMoveRemoval
      ).not.toHaveBeenCalled();
    });
  });

  describe('Removal Event Structure', () => {
    test('should broadcast removal with complete data structure', async () => {
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
