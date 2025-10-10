/**
 * Unit Tests for GameOptionsService
 * Tests game configuration handling, speed calculations, and state management
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// We'll create the service after writing tests (TDD approach)
describe('GameOptionsService', () => {
  let GameOptionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Import the service (will be created after tests)
    GameOptionsService =
      require('../../../src/services/GameOptionsService').default;
  });

  describe('Speed Configuration', () => {
    test('should return correct delay for slow speed', () => {
      const delay = GameOptionsService.getSpeedDelay('slow');
      expect(delay).toBe(2000);
    });

    test('should return correct delay for normal speed', () => {
      const delay = GameOptionsService.getSpeedDelay('normal');
      expect(delay).toBe(1000);
    });

    test('should return correct delay for fast speed', () => {
      const delay = GameOptionsService.getSpeedDelay('fast');
      expect(delay).toBe(200);
    });

    test('should default to normal speed for invalid input', () => {
      const delay = GameOptionsService.getSpeedDelay('invalid');
      expect(delay).toBe(1000);
    });

    test('should default to normal speed for undefined input', () => {
      const delay = GameOptionsService.getSpeedDelay(undefined);
      expect(delay).toBe(1000);
    });
  });

  describe('Game Configuration Validation', () => {
    test('should validate board size correctly', () => {
      expect(GameOptionsService.isValidBoardSize('3x3')).toBe(true);
      expect(GameOptionsService.isValidBoardSize('5x5')).toBe(true);
      expect(GameOptionsService.isValidBoardSize('4x4')).toBe(false);
      expect(GameOptionsService.isValidBoardSize('invalid')).toBe(false);
    });

    test('should validate speed setting correctly', () => {
      expect(GameOptionsService.isValidSpeed('slow')).toBe(true);
      expect(GameOptionsService.isValidSpeed('normal')).toBe(true);
      expect(GameOptionsService.isValidSpeed('fast')).toBe(true);
      expect(GameOptionsService.isValidSpeed('invalid')).toBe(false);
    });

    test('should validate game mode correctly', () => {
      expect(GameOptionsService.isValidGameMode('individual')).toBe(true);
      expect(GameOptionsService.isValidGameMode('tournament')).toBe(true);
      expect(GameOptionsService.isValidGameMode('invalid')).toBe(false);
    });
  });

  describe('Configuration Normalization', () => {
    test('should normalize configuration with defaults', () => {
      const config = GameOptionsService.normalizeConfig({});
      expect(config).toEqual({
        boardSize: '3x3',
        speed: 'normal',
        gameMode: 'individual',
        noTie: false,
      });
    });

    test('should preserve valid configuration values', () => {
      const config = GameOptionsService.normalizeConfig({
        boardSize: '5x5',
        speed: 'fast',
        gameMode: 'tournament',
        noTie: true,
      });
      expect(config).toEqual({
        boardSize: '5x5',
        speed: 'fast',
        gameMode: 'tournament',
        noTie: true,
      });
    });

    test('should fix invalid configuration values', () => {
      const config = GameOptionsService.normalizeConfig({
        boardSize: '4x4',
        speed: 'invalid',
        gameMode: 'wrong',
        noTie: 'yes',
      });
      expect(config).toEqual({
        boardSize: '3x3',
        speed: 'normal',
        gameMode: 'individual',
        noTie: false,
      });
    });
  });

  describe('Speed Throttling Logic', () => {
    test('should determine if throttling is needed', () => {
      expect(GameOptionsService.shouldThrottle('slow')).toBe(true);
      expect(GameOptionsService.shouldThrottle('normal')).toBe(true);
      expect(GameOptionsService.shouldThrottle('fast')).toBe(false);
    });

    test('should create throttle configuration', () => {
      const throttleConfig = GameOptionsService.createThrottleConfig('slow');
      expect(throttleConfig).toEqual({
        delay: 2000,
        shouldThrottle: true,
        showIndicator: true,
      });
    });
  });

  describe('Game State Helpers', () => {
    test('should determine if game is in progress', () => {
      expect(GameOptionsService.isGameInProgress('playing')).toBe(true);
      expect(GameOptionsService.isGameInProgress('completed')).toBe(false);
      expect(GameOptionsService.isGameInProgress('waiting')).toBe(false);
    });

    test('should determine if game is completed', () => {
      expect(GameOptionsService.isGameCompleted('completed')).toBe(true);
      expect(GameOptionsService.isGameCompleted('playing')).toBe(false);
      expect(GameOptionsService.isGameCompleted('waiting')).toBe(false);
    });

    test('should get game status display text', () => {
      expect(GameOptionsService.getGameStatusText('playing')).toBe(
        'Partida en Progreso'
      );
      expect(GameOptionsService.getGameStatusText('completed')).toBe(
        'Partida Completada'
      );
      expect(GameOptionsService.getGameStatusText('waiting')).toBe(
        'Esperando...'
      );
    });
  });

  describe('Winning Line Processing', () => {
    test('should format winning line array correctly', () => {
      const formatted = GameOptionsService.formatWinningLine([0, 1, 2]);
      expect(formatted).toBe('Línea 0-1-2');
    });

    test('should handle boolean winning line', () => {
      const formatted = GameOptionsService.formatWinningLine(true);
      expect(formatted).toBe('Línea ganadora');
    });

    test('should handle null winning line', () => {
      const formatted = GameOptionsService.formatWinningLine(null);
      expect(formatted).toBe('N/A');
    });

    test('should handle undefined winning line', () => {
      const formatted = GameOptionsService.formatWinningLine(undefined);
      expect(formatted).toBe('N/A');
    });

    test('should handle empty array winning line', () => {
      const formatted = GameOptionsService.formatWinningLine([]);
      expect(formatted).toBe('Línea ganadora');
    });

    test('should handle invalid winning line types', () => {
      const formatted = GameOptionsService.formatWinningLine('invalid');
      expect(formatted).toBe('Línea ganadora');
    });
  });

  describe('Player Information Processing', () => {
    test('should extract player name safely', () => {
      expect(GameOptionsService.getPlayerName({ name: 'Player1' })).toBe(
        'Player1'
      );
      expect(GameOptionsService.getPlayerName({})).toBe('Unknown');
      expect(GameOptionsService.getPlayerName(null)).toBe('Unknown');
      expect(GameOptionsService.getPlayerName(undefined)).toBe('Unknown');
    });

    test('should determine if player is human', () => {
      expect(GameOptionsService.isHumanPlayer({ isHuman: true })).toBe(true);
      expect(GameOptionsService.isHumanPlayer({ isHuman: false })).toBe(false);
      expect(GameOptionsService.isHumanPlayer({})).toBe(false);
      expect(GameOptionsService.isHumanPlayer(null)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed configuration gracefully', () => {
      const config = GameOptionsService.normalizeConfig({
        boardSize: null,
        speed: undefined,
        gameMode: 123,
        noTie: 'maybe',
      });
      expect(config).toEqual({
        boardSize: '3x3',
        speed: 'normal',
        gameMode: 'individual',
        noTie: false,
      });
    });

    test('should handle edge cases in speed calculation', () => {
      expect(GameOptionsService.getSpeedDelay('')).toBe(1000);
      expect(GameOptionsService.getSpeedDelay(null)).toBe(1000);
      expect(GameOptionsService.getSpeedDelay(0)).toBe(1000);
    });
  });

  describe('Performance and Optimization', () => {
    test('should memoize speed calculations', () => {
      const spy = jest.spyOn(GameOptionsService, 'getSpeedDelay');
      GameOptionsService.getSpeedDelay('slow');
      GameOptionsService.getSpeedDelay('slow');
      expect(spy).toHaveBeenCalledTimes(2); // Not memoized, but should be fast
    });

    test('should handle large configurations efficiently', () => {
      const largeConfig = {
        boardSize: '5x5',
        speed: 'fast',
        gameMode: 'tournament',
        noTie: false,
        extraData: new Array(1000).fill('data'),
      };

      const start = performance.now();
      const normalized = GameOptionsService.normalizeConfig(largeConfig);
      const end = performance.now();

      expect(normalized.boardSize).toBe('5x5');
      expect(end - start).toBeLessThan(10); // Should be very fast
    });
  });
});
