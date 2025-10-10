/**
 * Unit Tests for ScreensaverService
 * Tests simulated game data generation and cycling logic for idle screen entertainment
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import ScreensaverService from '../../../src/services/ScreensaverService';

describe('ScreensaverService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('getSimulatedGames', () => {
    test('should return array of simulated game results', () => {
      const games = ScreensaverService.getSimulatedGames();

      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBeGreaterThan(0);
    });

    test('should return games with required properties', () => {
      const games = ScreensaverService.getSimulatedGames();

      games.forEach(game => {
        expect(game).toHaveProperty('player1');
        expect(game).toHaveProperty('player2');
        expect(game).toHaveProperty('moves');
        expect(game).toHaveProperty('winner');
        expect(typeof game.player1).toBe('string');
        expect(typeof game.player2).toBe('string');
        expect(typeof game.moves).toBe('number');
        expect(typeof game.winner).toBe('string');
      });
    });

    test('should return consistent data on multiple calls', () => {
      const games1 = ScreensaverService.getSimulatedGames();
      const games2 = ScreensaverService.getSimulatedGames();

      expect(games1).toEqual(games2);
    });

    test('should include Bot Alpha vs Bot Beta game', () => {
      const games = ScreensaverService.getSimulatedGames();
      const botAlphaGame = games.find(
        game =>
          (game.player1 === 'Bot Alpha' && game.player2 === 'Bot Beta') ||
          (game.player1 === 'Bot Beta' && game.player2 === 'Bot Alpha')
      );

      expect(botAlphaGame).toBeDefined();
      expect(botAlphaGame.moves).toBeGreaterThan(0);
      expect(botAlphaGame.winner).toBeTruthy();
    });

    test('should include AI Master vs Code Warrior game', () => {
      const games = ScreensaverService.getSimulatedGames();
      const aiMasterGame = games.find(
        game =>
          game.player1 === 'AI Master' ||
          game.player2 === 'AI Master' ||
          game.player1 === 'Code Warrior' ||
          game.player2 === 'Code Warrior'
      );

      expect(aiMasterGame).toBeDefined();
      expect(aiMasterGame.winner).toBeDefined();
    });

    test('should have valid move counts (5-9 moves for 3x3 game)', () => {
      const games = ScreensaverService.getSimulatedGames();

      games.forEach(game => {
        expect(game.moves).toBeGreaterThanOrEqual(5);
        expect(game.moves).toBeLessThanOrEqual(9);
      });
    });

    test('should have winner from one of the two players', () => {
      const games = ScreensaverService.getSimulatedGames();

      games.forEach(game => {
        expect([game.player1, game.player2]).toContain(game.winner);
      });
    });

    test('should return at least 5 simulated games', () => {
      const games = ScreensaverService.getSimulatedGames();

      expect(games.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('createGameCycler', () => {
    test('should call onGameChange with next index after interval', () => {
      const games = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const onGameChange = jest.fn();

      ScreensaverService.createGameCycler(games, 1000, onGameChange);

      // Initial state - no call yet
      expect(onGameChange).not.toHaveBeenCalled();

      // After 1 second - should cycle to index 1
      jest.advanceTimersByTime(1000);
      expect(onGameChange).toHaveBeenCalledWith(1);

      // After 2 seconds - should cycle to index 2
      jest.advanceTimersByTime(1000);
      expect(onGameChange).toHaveBeenCalledWith(2);

      // After 3 seconds - should wrap to index 0
      jest.advanceTimersByTime(1000);
      expect(onGameChange).toHaveBeenCalledWith(0);
    });

    test('should cycle through all games continuously', () => {
      const games = [{ id: 1 }, { id: 2 }];
      const onGameChange = jest.fn();

      ScreensaverService.createGameCycler(games, 500, onGameChange);

      // Cycle through 5 times
      jest.advanceTimersByTime(2500);

      expect(onGameChange).toHaveBeenCalledTimes(5);
      expect(onGameChange).toHaveBeenNthCalledWith(1, 1);
      expect(onGameChange).toHaveBeenNthCalledWith(2, 0);
      expect(onGameChange).toHaveBeenNthCalledWith(3, 1);
      expect(onGameChange).toHaveBeenNthCalledWith(4, 0);
      expect(onGameChange).toHaveBeenNthCalledWith(5, 1);
    });

    test('should return cleanup function that stops cycling', () => {
      const games = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const onGameChange = jest.fn();

      const cleanup = ScreensaverService.createGameCycler(
        games,
        1000,
        onGameChange
      );

      // Advance 2 seconds
      jest.advanceTimersByTime(2000);
      expect(onGameChange).toHaveBeenCalledTimes(2);

      // Call cleanup
      cleanup();

      // Advance more time - should not call onGameChange anymore
      jest.advanceTimersByTime(5000);
      expect(onGameChange).toHaveBeenCalledTimes(2); // Still only 2 calls
    });

    test('should handle single game array', () => {
      const games = [{ id: 1 }];
      const onGameChange = jest.fn();

      ScreensaverService.createGameCycler(games, 1000, onGameChange);

      // Should always return to index 0
      jest.advanceTimersByTime(1000);
      expect(onGameChange).toHaveBeenCalledWith(0);

      jest.advanceTimersByTime(1000);
      expect(onGameChange).toHaveBeenCalledWith(0);
    });

    test('should handle custom interval', () => {
      const games = [{ id: 1 }, { id: 2 }];
      const onGameChange = jest.fn();

      ScreensaverService.createGameCycler(games, 3000, onGameChange);

      // Should not call before interval
      jest.advanceTimersByTime(2999);
      expect(onGameChange).not.toHaveBeenCalled();

      // Should call after interval
      jest.advanceTimersByTime(1);
      expect(onGameChange).toHaveBeenCalledTimes(1);
    });

    test('should handle empty games array gracefully', () => {
      const games = [];
      const onGameChange = jest.fn();

      expect(() => {
        const cleanup = ScreensaverService.createGameCycler(
          games,
          1000,
          onGameChange
        );
        jest.advanceTimersByTime(1000);
        cleanup();
      }).not.toThrow();

      expect(onGameChange).not.toHaveBeenCalled();
    });

    test('should handle null callback gracefully', () => {
      const games = [{ id: 1 }, { id: 2 }];

      expect(() => {
        const cleanup = ScreensaverService.createGameCycler(games, 1000, null);
        jest.advanceTimersByTime(1000);
        cleanup();
      }).not.toThrow();
    });
  });

  describe('getNextGame', () => {
    test('should return next index in sequence', () => {
      expect(ScreensaverService.getNextGame(0, 3)).toBe(1);
      expect(ScreensaverService.getNextGame(1, 3)).toBe(2);
    });

    test('should wrap to 0 at end of sequence', () => {
      expect(ScreensaverService.getNextGame(2, 3)).toBe(0);
      expect(ScreensaverService.getNextGame(4, 5)).toBe(0);
    });

    test('should handle single game', () => {
      expect(ScreensaverService.getNextGame(0, 1)).toBe(0);
    });

    test('should handle edge cases', () => {
      // Last index wraps to 0
      expect(ScreensaverService.getNextGame(9, 10)).toBe(0);

      // First index goes to 1
      expect(ScreensaverService.getNextGame(0, 10)).toBe(1);
    });

    test('should handle zero total games', () => {
      // With 0 games, service returns 0 (not NaN)
      const result = ScreensaverService.getNextGame(0, 0);
      expect(result).toBe(0);
    });

    test('should be deterministic', () => {
      // Same inputs should always produce same output
      const result1 = ScreensaverService.getNextGame(5, 10);
      const result2 = ScreensaverService.getNextGame(5, 10);
      expect(result1).toBe(result2);
      expect(result1).toBe(6);
    });
  });

  describe('Integration: Full Cycle with Real Simulated Games', () => {
    test('should cycle through simulated games using getNextGame logic', () => {
      const games = ScreensaverService.getSimulatedGames();
      const onGameChange = jest.fn();

      ScreensaverService.createGameCycler(games, 1000, onGameChange);

      // Cycle through all games
      const totalGames = games.length;
      jest.advanceTimersByTime(totalGames * 1000);

      // Should have called onGameChange for each game
      expect(onGameChange).toHaveBeenCalledTimes(totalGames);

      // Last call should wrap back to index 0
      expect(onGameChange).toHaveBeenLastCalledWith(0);
    });

    test('should maintain correct cycling order', () => {
      const games = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
      const onGameChange = jest.fn();

      ScreensaverService.createGameCycler(games, 100, onGameChange);

      jest.advanceTimersByTime(600);

      // Verify exact order: 1, 2, 0, 1, 2, 0
      expect(onGameChange).toHaveBeenNthCalledWith(1, 1);
      expect(onGameChange).toHaveBeenNthCalledWith(2, 2);
      expect(onGameChange).toHaveBeenNthCalledWith(3, 0);
      expect(onGameChange).toHaveBeenNthCalledWith(4, 1);
      expect(onGameChange).toHaveBeenNthCalledWith(5, 2);
      expect(onGameChange).toHaveBeenNthCalledWith(6, 0);
    });
  });
});
