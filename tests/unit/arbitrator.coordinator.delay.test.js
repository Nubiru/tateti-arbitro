/**
 * Unit Tests for ArbitratorCoordinator Delay Injection
 * Tests configurable delays in game loop based on speed setting
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../src/domain/game/arbitrator.core.js');
jest.mock('../../src/domain/game/events.adapter.js');
jest.mock('../../src/domain/game/http.adapter.js');

describe('ArbitratorCoordinator Delay Injection', () => {
  let ArbitratorCoordinator;
  let mockDelay;
  let mockEventsAdapter;
  let mockHttpAdapter;
  let mockArbitratorCore;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock delay function
    mockDelay = jest.fn().mockResolvedValue();

    // Create mock adapters
    mockEventsAdapter = {
      broadcastMatchStart: jest.fn(),
      broadcastMatchMove: jest.fn(),
      broadcastMatchWin: jest.fn(),
      broadcastMatchDraw: jest.fn(),
      broadcastMatchError: jest.fn(),
    };

    mockHttpAdapter = {
      makeMove: jest.fn(),
    };

    mockArbitratorCore = {
      checkWin: jest.fn(),
      checkDraw: jest.fn(),
      makeMove: jest.fn(),
    };

    // Import the coordinator
    ArbitratorCoordinator =
      require('../../src/domain/game/arbitrator.coordinator.js').default;
  });

  describe('Delay Configuration', () => {
    test('should accept delay function in constructor', () => {
      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
        delay: mockDelay,
      });

      expect(coordinator).toBeDefined();
    });

    test('should use default delay function when none provided', () => {
      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
      });

      expect(coordinator).toBeDefined();
    });
  });

  describe('Speed to Delay Mapping', () => {
    test('should map slow speed to 2000ms delay', () => {
      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
        delay: mockDelay,
      });

      const delayMs = coordinator.getSpeedDelay('slow');
      expect(delayMs).toBe(2000);
    });

    test('should map normal speed to 1000ms delay', () => {
      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
        delay: mockDelay,
      });

      const delayMs = coordinator.getSpeedDelay('normal');
      expect(delayMs).toBe(1000);
    });

    test('should map fast speed to 200ms delay', () => {
      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
        delay: mockDelay,
      });

      const delayMs = coordinator.getSpeedDelay('fast');
      expect(delayMs).toBe(200);
    });

    test('should default to normal speed for unknown speed', () => {
      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
        delay: mockDelay,
      });

      const delayMs = coordinator.getSpeedDelay('unknown');
      expect(delayMs).toBe(1000);
    });
  });

  describe('Game Loop Delay Execution', () => {
    test('should call delay function after each move broadcast', async () => {
      // Mock game state
      const board = Array(9).fill(null);
      const players = [
        { name: 'Bot1', type: 'algorithm', url: 'http://bot1' },
        { name: 'Bot2', type: 'random', url: 'http://bot2' },
      ];
      const options = {
        boardSize: 3,
        noTie: false,
        timeoutMs: 3000,
        matchId: 'test-match',
        speed: 'normal',
      };

      // Mock arbitrator core responses
      mockArbitratorCore.checkWin.mockReturnValue(null);
      mockArbitratorCore.checkDraw.mockReturnValue(false);
      mockArbitratorCore.makeMove.mockReturnValue({ row: 0, col: 0 });

      // Mock HTTP adapter responses
      mockHttpAdapter.makeMove
        .mockResolvedValueOnce({ row: 0, col: 0 })
        .mockResolvedValueOnce({ row: 0, col: 1 })
        .mockResolvedValueOnce({ row: 0, col: 2 });

      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
        delay: mockDelay,
      });

      // Mock the game loop to return early after a few moves
      jest
        .spyOn(coordinator, 'executeGameLoopAsync')
        .mockImplementation(async () => {
          // Simulate 3 moves with delays
          for (let i = 0; i < 3; i++) {
            // Broadcast move
            mockEventsAdapter.broadcastMatchMove({
              matchId: 'test-match',
              board: board,
              history: [],
              turn: i + 1,
              player: players[i % 2],
              move: { row: 0, col: i },
              timestamp: new Date().toISOString(),
            });

            // Call delay
            await coordinator.delay(coordinator.getSpeedDelay('normal'));
          }

          return {
            winner: players[0],
            winningLine: null,
            finalBoard: board,
            message: 'Game completed',
          };
        });

      await coordinator.runMatch(players, options);

      // Verify delay was called for each move
      expect(mockDelay).toHaveBeenCalledTimes(3);
      expect(mockDelay).toHaveBeenCalledWith(1000); // normal speed = 1000ms
    });

    test('should not delay on final move (win/draw)', async () => {
      const board = Array(9).fill(null);
      const players = [
        { name: 'Bot1', type: 'algorithm', url: 'http://bot1' },
        { name: 'Bot2', type: 'random', url: 'http://bot2' },
      ];
      const options = {
        boardSize: 3,
        noTie: false,
        timeoutMs: 3000,
        matchId: 'test-match',
        speed: 'slow',
      };

      // Mock win condition
      mockArbitratorCore.checkWin.mockReturnValue({
        winner: players[0],
        line: [0, 1, 2],
      });
      mockArbitratorCore.checkDraw.mockReturnValue(false);
      mockArbitratorCore.makeMove.mockReturnValue({ row: 0, col: 0 });

      mockHttpAdapter.makeMove.mockResolvedValue({ row: 0, col: 0 });

      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
        delay: mockDelay,
      });

      // Mock the game loop to win immediately
      jest
        .spyOn(coordinator, 'executeGameLoopAsync')
        .mockImplementation(async () => {
          // Broadcast final move
          mockEventsAdapter.broadcastMatchMove({
            matchId: 'test-match',
            board: board,
            history: [],
            turn: 1,
            player: players[0],
            move: { row: 0, col: 0 },
            timestamp: new Date().toISOString(),
          });

          // No delay on final move
          // (delay should not be called)

          return {
            winner: players[0],
            winningLine: [0, 1, 2],
            finalBoard: board,
            message: 'Bot1 won!',
          };
        });

      await coordinator.runMatch(players, options);

      // Verify delay was not called (final move)
      expect(mockDelay).not.toHaveBeenCalled();
    });

    test('should use different delays for different speeds', async () => {
      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
        delay: mockDelay,
      });

      // Test different speeds
      expect(coordinator.getSpeedDelay('slow')).toBe(2000);
      expect(coordinator.getSpeedDelay('normal')).toBe(1000);
      expect(coordinator.getSpeedDelay('fast')).toBe(200);
    });
  });

  describe('Delay Function Integration', () => {
    test('should use injected delay function in tests', async () => {
      const customDelay = jest.fn().mockResolvedValue();

      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
        delay: customDelay,
      });

      // Call delay method
      await coordinator.delay(1000);

      expect(customDelay).toHaveBeenCalledWith(1000);
    });

    test('should use setTimeout as default delay function', async () => {
      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
        // No delay function provided - should use default
      });

      const start = Date.now();
      await coordinator.delay(100);
      const end = Date.now();

      // Should have waited approximately 100ms
      expect(end - start).toBeGreaterThanOrEqual(90);
      expect(end - start).toBeLessThan(200);
    });
  });

  describe('Error Handling', () => {
    test('should handle delay function errors gracefully', async () => {
      const errorDelay = jest.fn().mockRejectedValue(new Error('Delay failed'));

      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
        delay: errorDelay,
      });

      // Should not throw error
      await expect(coordinator.delay(1000)).rejects.toThrow('Delay failed');
    });

    test('should handle invalid speed gracefully', () => {
      const coordinator = new ArbitratorCoordinator({
        arbitratorCore: mockArbitratorCore,
        eventsAdapter: mockEventsAdapter,
        httpAdapter: mockHttpAdapter,
        delay: mockDelay,
      });

      // Should default to normal speed
      expect(coordinator.getSpeedDelay(null)).toBe(1000);
      expect(coordinator.getSpeedDelay(undefined)).toBe(1000);
      expect(coordinator.getSpeedDelay('')).toBe(1000);
      expect(coordinator.getSpeedDelay(123)).toBe(1000);
    });
  });
});
