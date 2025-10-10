/**
 * RandomBot Algorithm Unit Tests
 * Pure unit tests - no server, no async, instant execution
 * Tests for board-size awareness (3x3 and 5x5)
 * @lastModified 2025-10-10
 */

import { getRandomMove } from '../../algorithm.js';

describe('RandomBot Algorithm', () => {
  describe('3x3 Board Support', () => {
    test('should return valid move for empty 3x3 board', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const move = getRandomMove(board);
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThan(9);
    });

    test('should return valid move for partially filled 3x3 board', () => {
      const board = [1, 2, 0, 0, 1, 0, 2, 0, 0];
      const move = getRandomMove(board);
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThan(9);
      expect(board[move]).toBe(0); // Move is on empty cell
    });

    test('should only choose from empty cells on 3x3 board', () => {
      const board = [1, 2, 1, 2, 1, 2, 0, 0, 0];
      const validMoves = [6, 7, 8];
      const move = getRandomMove(board);
      expect(validMoves).toContain(move);
    });
  });

  describe('5x5 Board Support', () => {
    test('should return valid move for empty 5x5 board', () => {
      const board = Array(25).fill(0);
      const move = getRandomMove(board);
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThan(25);
    });

    test('should return valid move for partially filled 5x5 board', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[12] = 2;
      board[24] = 1;
      const move = getRandomMove(board);
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThan(25);
      expect(board[move]).toBe(0);
    });

    test('should only choose from empty cells on 5x5 board', () => {
      const board = Array(25).fill(1);
      board[5] = 0;
      board[15] = 0;
      board[20] = 0;
      const validMoves = [5, 15, 20];
      const move = getRandomMove(board);
      expect(validMoves).toContain(move);
    });
  });

  describe('Edge Cases', () => {
    test('should handle board with single empty cell', () => {
      const board = [1, 2, 1, 2, 0, 1, 2, 1, 2];
      const move = getRandomMove(board);
      expect(move).toBe(4);
    });

    test('should return 0 when no empty cells (fallback)', () => {
      const board = [1, 2, 1, 2, 1, 2, 1, 2, 1];
      const move = getRandomMove(board);
      expect(move).toBe(0);
    });
  });
});

