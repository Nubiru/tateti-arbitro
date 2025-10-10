/**
 * Unit Tests for CelebrationService
 * Tests celebration logic, countdown timers, and statistics formatting
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import CelebrationService from '../../../src/services/CelebrationService';

describe('CelebrationService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('calculateGameStatistics', () => {
    test('should calculate statistics for individual match with real game data', () => {
      const matchResult = {
        winner: { name: 'Player1', symbol: 'X' },
        history: [
          { playerId: 'player1', position: 0 },
          { playerId: 'player2', position: 1 },
          { playerId: 'player1', position: 2 },
        ],
        gameTime: 45000,
        winningLine: [0, 1, 2],
        players: [
          { name: 'Player1', symbol: 'X' },
          { name: 'Player2', symbol: 'O' },
        ],
      };

      const stats = CelebrationService.calculateGameStatistics(
        matchResult,
        null
      );

      expect(stats.winner).toEqual({ name: 'Player1', symbol: 'X' });
      expect(stats.movesCount).toBe(3);
      expect(stats.gameTime).toBe(45000);
      expect(stats.player1Moves).toBe(2);
      expect(stats.player2Moves).toBe(1);
    });

    test('should calculate statistics for tournament with real tournament data', () => {
      const tournamentResult = {
        winner: { name: 'Player1' },
        totalRounds: 2,
        totalMatches: 3,
        averageTime: 30000,
      };

      const stats = CelebrationService.calculateGameStatistics(
        null,
        tournamentResult
      );

      expect(stats.winner).toEqual({ name: 'Player1' });
      expect(stats.totalRounds).toBe(2);
      expect(stats.totalMatches).toBe(3);
      expect(stats.averageTime).toBe(30000);
    });

    test('should handle match with no history', () => {
      const matchResult = {
        winner: { name: 'Player1' },
        players: [{ name: 'Player1' }, { name: 'Player2' }],
      };

      const stats = CelebrationService.calculateGameStatistics(
        matchResult,
        null
      );

      expect(stats.movesCount).toBe(0);
      expect(stats.player1Moves).toBe(0);
      expect(stats.player2Moves).toBe(0);
    });

    test('should handle null/undefined inputs by returning empty statistics', () => {
      const stats = CelebrationService.calculateGameStatistics(null, null);

      expect(stats.winner).toBeNull();
      expect(stats.movesCount).toBe(0);
      expect(stats.gameTime).toBe('N/A'); // Service returns 'N/A' string, not 0
    });
  });

  describe('getGameMetadata', () => {
    test('should extract metadata from match result', () => {
      const result = {
        gameMode: 'individual',
        boardSize: '3x3',
        speed: 'fast',
        noTie: true,
        winningLine: [0, 1, 2],
      };

      const metadata = CelebrationService.getGameMetadata(result);

      expect(metadata.gameMode).toBe('individual');
      expect(metadata.boardSize).toBe('3x3');
      expect(metadata.speed).toBe('fast');
      expect(metadata.noTie).toBe(true);
      expect(metadata.winningLine).toEqual([0, 1, 2]);
    });

    test('should provide default values for missing properties', () => {
      const result = {};

      const metadata = CelebrationService.getGameMetadata(result);

      expect(metadata.gameMode).toBe('Individual'); // Service returns capitalized
      expect(metadata.boardSize).toBe('3x3');
      expect(metadata.speed).toBe('normal');
      expect(metadata.noTie).toBe(false);
      expect(metadata.winningLine).toBeNull();
    });

    test('should handle null input', () => {
      const metadata = CelebrationService.getGameMetadata(null);

      expect(metadata.gameMode).toBe('Individual'); // Service returns capitalized
      expect(metadata.boardSize).toBe('3x3');
      expect(metadata.speed).toBe('normal');
      expect(metadata.noTie).toBe(false);
      expect(metadata.winningLine).toBeNull();
    });
  });

  describe('createCountdownTimer', () => {
    test('should call onTick every second with remaining time', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      CelebrationService.createCountdownTimer(5, onTick, onComplete);

      // Advance 1 second
      jest.advanceTimersByTime(1000);
      expect(onTick).toHaveBeenCalledWith(4);

      // Advance 1 more second
      jest.advanceTimersByTime(1000);
      expect(onTick).toHaveBeenCalledWith(3);

      expect(onComplete).not.toHaveBeenCalled();
    });

    test('should call onTick with 0 before calling onComplete', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      CelebrationService.createCountdownTimer(2, onTick, onComplete);

      // Advance to 1 second remaining
      jest.advanceTimersByTime(1000);
      expect(onTick).toHaveBeenCalledWith(1);
      expect(onComplete).not.toHaveBeenCalled();

      // Advance to 0 seconds remaining
      jest.advanceTimersByTime(1000);
      expect(onTick).toHaveBeenCalledWith(0); // ✅ CRITICAL: Must call onTick(0)
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('should call onComplete when countdown reaches 0', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      CelebrationService.createCountdownTimer(3, onTick, onComplete);

      jest.advanceTimersByTime(3000);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('should stop calling onTick after countdown completes', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      CelebrationService.createCountdownTimer(2, onTick, onComplete);

      jest.advanceTimersByTime(2000);
      expect(onTick).toHaveBeenCalledTimes(2); // Called at 1 and 0

      // Advance more time - should not call onTick again
      jest.advanceTimersByTime(5000);
      expect(onTick).toHaveBeenCalledTimes(2); // Still only 2 calls
    });

    test('should handle null onTick callback', () => {
      const onComplete = jest.fn();

      expect(() => {
        CelebrationService.createCountdownTimer(2, null, onComplete);
        jest.advanceTimersByTime(2000);
      }).not.toThrow();

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('should handle null onComplete callback', () => {
      const onTick = jest.fn();

      expect(() => {
        CelebrationService.createCountdownTimer(2, onTick, null);
        jest.advanceTimersByTime(2000);
      }).not.toThrow();

      expect(onTick).toHaveBeenCalledWith(0);
    });

    test('should return cleanup function that clears interval', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      const cleanup = CelebrationService.createCountdownTimer(
        10,
        onTick,
        onComplete
      );

      // Advance 2 seconds
      jest.advanceTimersByTime(2000);
      expect(onTick).toHaveBeenCalledTimes(2);

      // Call cleanup
      cleanup();

      // Advance more time - should not call onTick anymore
      jest.advanceTimersByTime(10000);
      expect(onTick).toHaveBeenCalledTimes(2); // Still only 2 calls
      expect(onComplete).not.toHaveBeenCalled();
    });

    test('should handle duration of 1 second', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      CelebrationService.createCountdownTimer(1, onTick, onComplete);

      jest.advanceTimersByTime(1000);

      expect(onTick).toHaveBeenCalledWith(0);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('should handle duration of 0 seconds', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      CelebrationService.createCountdownTimer(0, onTick, onComplete);

      jest.advanceTimersByTime(1000);

      expect(onTick).toHaveBeenCalledWith(-1);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEmptyStatistics', () => {
    test('should return empty statistics object', () => {
      const stats = CelebrationService.getEmptyStatistics();

      expect(stats).toEqual({
        winner: null,
        movesCount: 0,
        gameTime: 'N/A',
        player1Moves: 0,
        player2Moves: 0,
        totalRounds: 1,
        totalMatches: 1,
        averageTime: 'N/A',
      });
    });

    test('should return new object each time', () => {
      const stats1 = CelebrationService.getEmptyStatistics();
      const stats2 = CelebrationService.getEmptyStatistics();

      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });
  });
});
