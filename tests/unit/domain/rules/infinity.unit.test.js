/**
 * Unit Tests for Infinity Mode Rules
 * Tests pure functions for rolling window mechanic
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import {
  INFINITY_THRESHOLD,
  shouldRemoveOldestMove,
  getRemovalPosition,
  getRemovalPlayer,
} from '../../../../src/domain/game/rules/infinity.js';

describe('Infinity Mode Rules - Unit Tests', () => {
  describe('INFINITY_THRESHOLD constant', () => {
    test('should be 6 (each player max 3 marks)', () => {
      expect(INFINITY_THRESHOLD).toBe(6);
    });
  });

  describe('shouldRemoveOldestMove()', () => {
    test('should return false for empty move history', () => {
      expect(shouldRemoveOldestMove([])).toBe(false);
    });

    test('should return false for move history length < 6', () => {
      const history1 = [{ move: 0 }];
      const history2 = [{ move: 0 }, { move: 1 }];
      const history3 = [{ move: 0 }, { move: 1 }, { move: 2 }];
      const history4 = [{ move: 0 }, { move: 1 }, { move: 2 }, { move: 3 }];
      const history5 = [
        { move: 0 },
        { move: 1 },
        { move: 2 },
        { move: 3 },
        { move: 4 },
      ];

      expect(shouldRemoveOldestMove(history1)).toBe(false);
      expect(shouldRemoveOldestMove(history2)).toBe(false);
      expect(shouldRemoveOldestMove(history3)).toBe(false);
      expect(shouldRemoveOldestMove(history4)).toBe(false);
      expect(shouldRemoveOldestMove(history5)).toBe(false);
    });

    test('should return true for move history length >= 6', () => {
      const history6 = [
        { move: 0 },
        { move: 1 },
        { move: 2 },
        { move: 3 },
        { move: 4 },
        { move: 5 },
      ];
      const history7 = [
        { move: 0 },
        { move: 1 },
        { move: 2 },
        { move: 3 },
        { move: 4 },
        { move: 5 },
        { move: 6 },
      ];
      const history10 = Array.from({ length: 10 }, (_, i) => ({ move: i }));

      expect(shouldRemoveOldestMove(history6)).toBe(true);
      expect(shouldRemoveOldestMove(history7)).toBe(true);
      expect(shouldRemoveOldestMove(history10)).toBe(true);
    });

    test('should handle null or undefined input gracefully', () => {
      expect(shouldRemoveOldestMove(null)).toBe(false);
      expect(shouldRemoveOldestMove(undefined)).toBe(false);
    });
  });

  describe('getRemovalPosition()', () => {
    test('should return null for empty move history', () => {
      expect(getRemovalPosition([])).toBeNull();
    });

    test('should return null for move history length < 6', () => {
      const history = [
        { move: 0 },
        { move: 1 },
        { move: 2 },
        { move: 3 },
        { move: 4 },
      ];
      expect(getRemovalPosition(history)).toBeNull();
    });

    test('should return oldest move position for history length >= 6', () => {
      const history = [
        { move: 4 },
        { move: 2 },
        { move: 7 },
        { move: 1 },
        { move: 8 },
        { move: 3 },
      ];
      expect(getRemovalPosition(history)).toBe(4); // First move in history
    });

    test('should return correct position even with many moves', () => {
      const history = [
        { move: 0 },
        { move: 1 },
        { move: 2 },
        { move: 3 },
        { move: 4 },
        { move: 5 },
        { move: 6 },
        { move: 7 },
        { move: 8 },
      ];
      expect(getRemovalPosition(history)).toBe(0); // Oldest move
    });

    test('should handle null or undefined input gracefully', () => {
      expect(getRemovalPosition(null)).toBeNull();
      expect(getRemovalPosition(undefined)).toBeNull();
    });

    test('should handle invalid move history format', () => {
      const invalidHistory = [
        {},
        { move: 1 },
        { move: 2 },
        { move: 3 },
        { move: 4 },
        { move: 5 },
      ];
      expect(getRemovalPosition(invalidHistory)).toBeNull();
    });
  });

  describe('getRemovalPlayer()', () => {
    const players = [
      { id: 'X', name: 'Player1' },
      { id: 'O', name: 'Player2' },
    ];

    test('should return null for empty move history', () => {
      expect(getRemovalPlayer([], players)).toBeNull();
    });

    test('should return null for move history length < 6', () => {
      const history = [
        { move: 0, playerId: 'X' },
        { move: 1, playerId: 'O' },
        { move: 2, playerId: 'X' },
        { move: 3, playerId: 'O' },
        { move: 4, playerId: 'X' },
      ];
      expect(getRemovalPlayer(history, players)).toBeNull();
    });

    test('should return correct player for Player1 (X)', () => {
      const history = [
        { move: 0, playerId: 'X' },
        { move: 1, playerId: 'O' },
        { move: 2, playerId: 'X' },
        { move: 3, playerId: 'O' },
        { move: 4, playerId: 'X' },
        { move: 5, playerId: 'O' },
      ];
      const result = getRemovalPlayer(history, players);
      expect(result).toEqual({ id: 'X', name: 'Player1' });
    });

    test('should return correct player for Player2 (O)', () => {
      const history = [
        { move: 0, playerId: 'O' },
        { move: 1, playerId: 'X' },
        { move: 2, playerId: 'O' },
        { move: 3, playerId: 'X' },
        { move: 4, playerId: 'O' },
        { move: 5, playerId: 'X' },
      ];
      const result = getRemovalPlayer(history, players);
      expect(result).toEqual({ id: 'O', name: 'Player2' });
    });

    test('should handle null or undefined history input', () => {
      expect(getRemovalPlayer(null, players)).toBeNull();
      expect(getRemovalPlayer(undefined, players)).toBeNull();
    });

    test('should handle null or undefined players input', () => {
      const history = [
        { move: 0, playerId: 'X' },
        { move: 1, playerId: 'O' },
        { move: 2, playerId: 'X' },
        { move: 3, playerId: 'O' },
        { move: 4, playerId: 'X' },
        { move: 5, playerId: 'O' },
      ];
      expect(getRemovalPlayer(history, null)).toBeNull();
      expect(getRemovalPlayer(history, undefined)).toBeNull();
    });

    test('should handle invalid players array', () => {
      const history = [
        { move: 0, playerId: 'X' },
        { move: 1, playerId: 'O' },
        { move: 2, playerId: 'X' },
        { move: 3, playerId: 'O' },
        { move: 4, playerId: 'X' },
        { move: 5, playerId: 'O' },
      ];
      expect(getRemovalPlayer(history, [])).toBeNull();
      expect(getRemovalPlayer(history, [players[0]])).toBeNull(); // Only 1 player
    });

    test('should handle invalid move history format', () => {
      const invalidHistory = [
        {},
        { move: 1, playerId: 'O' },
        { move: 2, playerId: 'X' },
        { move: 3, playerId: 'O' },
        { move: 4, playerId: 'X' },
        { move: 5, playerId: 'O' },
      ];
      expect(getRemovalPlayer(invalidHistory, players)).toBeNull();
    });
  });
});
