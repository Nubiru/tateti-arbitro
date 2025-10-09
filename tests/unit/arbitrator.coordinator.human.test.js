/**
 * Unit Tests for ArbitratorCoordinator - Human Player Methods
 * Tests for waitForHumanMove and submitHumanMove methods
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import { ArbitratorCoordinator } from '../../src/domain/game/arbitrator.coordinator.js';
import { isValidMove } from '../../src/domain/game/arbitrator.core.js';
import {
  createMockArbitratorDependencies,
  createMockPlayers,
} from '../helpers/test-factories.js';

// Mock isValidMove from arbitrator.core
jest.mock('../../src/domain/game/arbitrator.core.js', () => ({
  ...jest.requireActual('../../src/domain/game/arbitrator.core.js'),
  isValidMove: jest.fn(),
}));

describe('ArbitratorCoordinator - Human Player Methods', () => {
  let coordinator;
  let mockDependencies;
  let mockPlayers;
  let originalDateNow;
  const FIXED_TIMESTAMP = 1696320000000; // Fixed timestamp for deterministic matchId

  beforeEach(() => {
    // Setup test factories
    mockDependencies = createMockArbitratorDependencies();
    mockPlayers = createMockPlayers(2);

    // Mock Date.now() for deterministic matchId
    originalDateNow = Date.now;
    Date.now = jest.fn(() => FIXED_TIMESTAMP);

    // Use fake timers for timeout simulation
    jest.useFakeTimers();

    // Create coordinator instance
    coordinator = new ArbitratorCoordinator(mockDependencies);
  });

  afterEach(() => {
    // Restore Date.now
    Date.now = originalDateNow;

    // Restore timers
    jest.runOnlyPendingTimers();
    jest.useRealTimers();

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('waitForHumanMove', () => {
    test('should create pending move entry with correct data', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;

      // Start waiting for move (don't await, we just want to check the Map)
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Verify pending move was created
      expect(coordinator.pendingHumanMoves).toBeDefined();
      expect(coordinator.pendingHumanMoves.size).toBe(1);

      // Get the first (and only) pending move entry
      const [matchId, pending] = Array.from(
        coordinator.pendingHumanMoves.entries()
      )[0];

      expect(matchId).toMatch(/^match-\d+$/);
      expect(pending).toBeDefined();
      expect(pending.player).toBe(player);
      expect(pending.board).toBe(board);
      expect(pending.resolve).toBeInstanceOf(Function);
      expect(pending.timeout).toBeDefined();
    });

    test('should resolve with error when timeout expires', async () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;

      // Start waiting for move
      const promise = coordinator.waitForHumanMove(player, board, timeoutMs);

      // Fast-forward time past timeout
      jest.advanceTimersByTime(timeoutMs + 1000);

      // Wait for Promise to resolve
      const result = await promise;

      // Verify timeout error
      expect(result.move).toBeNull();
      expect(result.error).toBe('Timeout waiting for human move');

      // Verify pending move was deleted
      const matchId = `match-${FIXED_TIMESTAMP}`;
      expect(coordinator.pendingHumanMoves.has(matchId)).toBe(false);
    });

    test('should initialize pendingHumanMoves Map if not exists', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;

      // Ensure pendingHumanMoves doesn't exist
      expect(coordinator.pendingHumanMoves).toBeUndefined();

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Verify Map was initialized
      expect(coordinator.pendingHumanMoves).toBeInstanceOf(Map);
    });

    test('should store currentMatchId for submission', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Verify currentMatchId was set (should match format match-<timestamp>)
      expect(coordinator.currentMatchId).toMatch(/^match-\d+$/);

      // Verify it matches the matchId in pendingHumanMoves
      const [matchId] = Array.from(coordinator.pendingHumanMoves.keys());
      expect(coordinator.currentMatchId).toBe(matchId);
    });

    test('should call logger.debug with correct params', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Verify logger was called with correct structure
      expect(mockDependencies.logger.debug).toHaveBeenCalledWith(
        'ARBITRATOR',
        'MATCH',
        'WAIT_HUMAN',
        'Esperando movimiento humano',
        expect.objectContaining({
          player: player.name,
          matchId: expect.stringMatching(/^match-\d+$/),
          timeoutMs: timeoutMs,
        })
      );
    });
  });

  describe('submitHumanMove', () => {
    test('should throw error if pendingHumanMoves is undefined', () => {
      const matchId = 'match-123';
      const player = 'Player1';
      const position = 4;

      // Ensure pendingHumanMoves doesn't exist
      coordinator.pendingHumanMoves = undefined;

      // Attempt to submit move
      expect(() => {
        coordinator.submitHumanMove(matchId, player, position);
      }).toThrow('No pending move for this match');
    });

    test('should throw error if matchId not found', () => {
      const matchId = 'match-nonexistent';
      const player = 'Player1';
      const position = 4;

      // Initialize Map but don't add the matchId
      coordinator.pendingHumanMoves = new Map();

      // Attempt to submit move
      expect(() => {
        coordinator.submitHumanMove(matchId, player, position);
      }).toThrow('No pending move for this match');
    });

    test('should throw error if move is invalid', () => {
      const player = mockPlayers[0];
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const invalidPosition = 0; // Position already occupied

      // Mock isValidMove to return false
      isValidMove.mockReturnValue(false);

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Get the actual matchId that was generated
      const [matchId] = Array.from(coordinator.pendingHumanMoves.keys());

      // Attempt to submit invalid move
      expect(() => {
        coordinator.submitHumanMove(matchId, player.name, invalidPosition);
      }).toThrow('Invalid move position');
    });

    test('should resolve Promise with valid move', async () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const validPosition = 4;

      // Mock isValidMove to return true
      isValidMove.mockReturnValue(true);

      // Start waiting for move
      const promise = coordinator.waitForHumanMove(player, board, timeoutMs);

      // Get the actual matchId that was generated
      const [matchId] = Array.from(coordinator.pendingHumanMoves.keys());

      // Submit move
      coordinator.submitHumanMove(matchId, player.name, validPosition);

      // Wait for Promise to resolve
      const result = await promise;

      // Verify result
      expect(result.move).toBe(validPosition);
      expect(result.error).toBeNull();
    });

    test('should clear timeout when move submitted', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const validPosition = 4;

      // Mock isValidMove to return true
      isValidMove.mockReturnValue(true);

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Get the actual matchId and pending move
      const [matchId, pending] = Array.from(
        coordinator.pendingHumanMoves.entries()
      )[0];

      // Spy on clearTimeout
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Submit move
      coordinator.submitHumanMove(matchId, player.name, validPosition);

      // Verify clearTimeout was called with the timeout ID
      expect(clearTimeoutSpy).toHaveBeenCalledWith(pending.timeout);

      clearTimeoutSpy.mockRestore();
    });

    test('should delete pending move entry', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const validPosition = 4;

      // Mock isValidMove to return true
      isValidMove.mockReturnValue(true);

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Get the actual matchId that was generated
      const [matchId] = Array.from(coordinator.pendingHumanMoves.keys());

      // Verify entry exists
      expect(coordinator.pendingHumanMoves.has(matchId)).toBe(true);

      // Submit move
      coordinator.submitHumanMove(matchId, player.name, validPosition);

      // Verify entry was deleted
      expect(coordinator.pendingHumanMoves.has(matchId)).toBe(false);
    });

    test('should return success object with move', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const validPosition = 4;

      // Mock isValidMove to return true
      isValidMove.mockReturnValue(true);

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Get the actual matchId that was generated
      const [matchId] = Array.from(coordinator.pendingHumanMoves.keys());

      // Submit move
      const result = coordinator.submitHumanMove(
        matchId,
        player.name,
        validPosition
      );

      // Verify return value
      expect(result).toEqual({
        success: true,
        move: validPosition,
      });
    });

    test('should call logger.info with correct params', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const validPosition = 4;

      // Mock isValidMove to return true
      isValidMove.mockReturnValue(true);

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Get the actual matchId that was generated
      const [matchId] = Array.from(coordinator.pendingHumanMoves.keys());

      // Submit move
      coordinator.submitHumanMove(matchId, player.name, validPosition);

      // Verify logger was called
      expect(mockDependencies.logger.info).toHaveBeenCalledWith(
        'ARBITRATOR',
        'MATCH',
        'HUMAN_MOVE',
        'Movimiento humano recibido',
        expect.objectContaining({
          player: player.name,
          position: validPosition,
          matchId: expect.stringMatching(/^match-\d+$/),
        })
      );
    });
  });

  describe('Integration: waitForHumanMove + submitHumanMove', () => {
    test('should resolve Promise when move submitted before timeout', async () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const validPosition = 4;

      // Mock isValidMove to return true
      isValidMove.mockReturnValue(true);

      // Start waiting for move
      const promise = coordinator.waitForHumanMove(player, board, timeoutMs);

      // Get the actual matchId that was generated
      const [matchId] = Array.from(coordinator.pendingHumanMoves.keys());

      // Simulate user submitting move after 1 second
      jest.advanceTimersByTime(1000);
      coordinator.submitHumanMove(matchId, player.name, validPosition);

      // Wait for Promise to resolve
      const result = await promise;

      // Verify success result
      expect(result.move).toBe(validPosition);
      expect(result.error).toBeNull();

      // Verify pending move was cleaned up
      expect(coordinator.pendingHumanMoves.has(matchId)).toBe(false);
    });

    test('should handle timeout if no move submitted', async () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;

      // Start waiting for move
      const promise = coordinator.waitForHumanMove(player, board, timeoutMs);

      // Get the actual matchId that was generated
      const [matchId] = Array.from(coordinator.pendingHumanMoves.keys());

      // Verify pending move exists
      expect(coordinator.pendingHumanMoves.has(matchId)).toBe(true);

      // Fast-forward time past timeout (no move submitted)
      jest.advanceTimersByTime(timeoutMs + 1000);

      // Wait for Promise to resolve
      const result = await promise;

      // Verify timeout error
      expect(result.move).toBeNull();
      expect(result.error).toBe('Timeout waiting for human move');

      // Verify pending move was cleaned up
      expect(coordinator.pendingHumanMoves.has(matchId)).toBe(false);
    });
  });
});
