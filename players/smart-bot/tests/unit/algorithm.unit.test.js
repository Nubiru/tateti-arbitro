/**
 * SmartBot Algorithm Unit Tests
 * TDD approach - tests written before implementation
 * @lastModified 2025-10-10
 */

import {
  getSmartMove,
  detectMySymbol,
  findWinningMove,
  checkWin
} from '../../algorithm.js';

describe('SmartBot Algorithm', () => {
  describe('Symbol Detection', () => {
    test('should detect X symbol on odd empty positions (3x3)', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 9 empty
      const emptyPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const symbol = detectMySymbol(board, emptyPositions);
      expect(symbol).toBe(1); // X plays first
    });

    test('should detect O symbol on even empty positions (3x3)', () => {
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0]; // 8 empty
      const emptyPositions = [1, 2, 3, 4, 5, 6, 7, 8];
      const symbol = detectMySymbol(board, emptyPositions);
      expect(symbol).toBe(2); // O plays second
    });

    test('should detect X symbol on odd empty positions (5x5)', () => {
      const board = Array(25).fill(0); // 25 empty
      const emptyPositions = Array.from({ length: 25 }, (_, i) => i);
      const symbol = detectMySymbol(board, emptyPositions);
      expect(symbol).toBe(1);
    });

    test('should detect O symbol on even empty positions (5x5)', () => {
      const board = Array(25).fill(0);
      board[0] = 1; // 24 empty
      const emptyPositions = Array.from({ length: 24 }, (_, i) => i + 1);
      const symbol = detectMySymbol(board, emptyPositions);
      expect(symbol).toBe(2);
    });
  });

  describe('Win Detection (3x3)', () => {
    test('should detect horizontal win', () => {
      const board = [1, 1, 1, 0, 0, 0, 0, 0, 0];
      expect(checkWin(board, 1)).toBe(true);
    });

    test('should detect vertical win', () => {
      const board = [1, 0, 0, 1, 0, 0, 1, 0, 0];
      expect(checkWin(board, 1)).toBe(true);
    });

    test('should detect diagonal win', () => {
      const board = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      expect(checkWin(board, 1)).toBe(true);
    });

    test('should return false for no win', () => {
      const board = [1, 2, 1, 0, 0, 0, 0, 0, 0];
      expect(checkWin(board, 1)).toBe(false);
    });
  });

  describe('Win Detection (5x5)', () => {
    test('should detect horizontal win', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[1] = 1;
      board[2] = 1;
      board[3] = 1;
      board[4] = 1;
      expect(checkWin(board, 1)).toBe(true);
    });

    test('should detect vertical win', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[5] = 1;
      board[10] = 1;
      board[15] = 1;
      board[20] = 1;
      expect(checkWin(board, 1)).toBe(true);
    });

    test('should detect diagonal win', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[6] = 1;
      board[12] = 1;
      board[18] = 1;
      board[24] = 1;
      expect(checkWin(board, 1)).toBe(true);
    });
  });

  describe('Winning Move Detection', () => {
    test('should find immediate winning move (3x3)', () => {
      const board = [1, 1, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [2, 3, 4, 5, 6, 7, 8];
      const move = findWinningMove(board, emptyPositions, 1);
      expect(move).toBe(2); // Complete top row
    });

    test('should return null when no winning move (3x3)', () => {
      const board = [1, 2, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [2, 3, 4, 5, 6, 7, 8];
      const move = findWinningMove(board, emptyPositions, 1);
      expect(move).toBeNull();
    });

    test('should find immediate winning move (5x5)', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[1] = 1;
      board[2] = 1;
      board[3] = 1;
      const emptyPositions = [
        4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
        23, 24
      ];
      const move = findWinningMove(board, emptyPositions, 1);
      expect(move).toBe(4); // Complete top row
    });
  });

  describe('Smart Strategy Priority (3x3)', () => {
    test('should prioritize winning over blocking', () => {
      const board = [1, 1, 0, 2, 2, 0, 0, 0, 0];
      const move = getSmartMove(board);
      expect(move).toBe(2); // Win instead of blocking at 5
    });

    test('should block opponent winning move', () => {
      const board = [0, 0, 0, 2, 2, 0, 1, 0, 0];
      const move = getSmartMove(board);
      expect(move).toBe(5); // Block O from winning
    });

    test('should take center when no immediate threats', () => {
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      const move = getSmartMove(board);
      expect(move).toBe(4); // Take center
    });

    test('should take corner when center occupied', () => {
      const board = [0, 0, 0, 0, 1, 0, 0, 0, 0];
      const move = getSmartMove(board);
      expect([0, 2, 6, 8]).toContain(move); // Take corner
    });

    test('should take any available position as fallback', () => {
      const board = [1, 2, 0, 2, 1, 2, 1, 2, 1];
      const move = getSmartMove(board);
      expect(move).toBe(2); // Only position left
    });
  });

  describe('Smart Strategy Priority (5x5)', () => {
    test('should prioritize winning over blocking', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[1] = 1;
      board[2] = 1;
      board[3] = 1; // X about to win
      board[5] = 2;
      board[6] = 2;
      board[7] = 2;
      board[8] = 2; // O about to win
      const move = getSmartMove(board);
      expect(move).toBe(4); // Win instead of blocking at 9
    });

    test('should block opponent winning move', () => {
      const board = Array(25).fill(0);
      board[0] = 2;
      board[1] = 2;
      board[2] = 2;
      board[3] = 2;
      board[10] = 1;
      const move = getSmartMove(board);
      expect(move).toBe(4); // Block O from winning
    });

    test('should take center when no immediate threats', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      const move = getSmartMove(board);
      expect(move).toBe(12); // Take center (position 12 in 5x5)
    });

    test('should take corner when center occupied', () => {
      const board = Array(25).fill(0);
      board[12] = 1;
      const move = getSmartMove(board);
      expect([0, 4, 20, 24]).toContain(move); // Take corner
    });
  });

  describe('Edge Cases', () => {
    test('should handle board with single empty cell', () => {
      const board = [1, 2, 1, 2, 0, 1, 2, 1, 2];
      const move = getSmartMove(board);
      expect(move).toBe(4);
    });

    test('should handle first move on empty board', () => {
      const board = Array(9).fill(0);
      const move = getSmartMove(board);
      expect(move).toBe(4); // Center
    });
  });
});

