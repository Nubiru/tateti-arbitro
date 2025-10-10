/**
 * StrategicBot Algorithm Unit Tests
 * TDD approach - tests written before implementation
 * @lastModified 2025-10-10
 */

import {
  getStrategicMove,
  detectMySymbol,
  checkWin,
  findWinningMove,
  findBlockingMove,
  estrategiaPosicional
} from '../../algorithm.js';

describe('StrategicBot Algorithm', () => {
  describe('Symbol Detection', () => {
    test('should detect X symbol on first move (9 empty)', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const symbol = detectMySymbol(board, emptyPositions);
      expect(symbol).toBe(1);
    });

    test('should detect O symbol on second move (8 empty)', () => {
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [1, 2, 3, 4, 5, 6, 7, 8];
      const symbol = detectMySymbol(board, emptyPositions);
      expect(symbol).toBe(2);
    });
  });

  describe('Win Detection', () => {
    test('should detect horizontal win (3x3)', () => {
      const board = [1, 1, 1, 0, 0, 0, 0, 0, 0];
      expect(checkWin(board, 1)).toBe(true);
    });

    test('should detect vertical win (3x3)', () => {
      const board = [1, 0, 0, 1, 0, 0, 1, 0, 0];
      expect(checkWin(board, 1)).toBe(true);
    });

    test('should detect diagonal win (3x3)', () => {
      const board = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      expect(checkWin(board, 1)).toBe(true);
    });

    test('should detect horizontal win (5x5)', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[1] = 1;
      board[2] = 1;
      board[3] = 1;
      board[4] = 1;
      expect(checkWin(board, 1)).toBe(true);
    });
  });

  describe('Winning Move Detection', () => {
    test('should find immediate winning move', () => {
      const board = [1, 1, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [2, 3, 4, 5, 6, 7, 8];
      const move = findWinningMove(board, emptyPositions, 1);
      expect(move).toBe(2);
    });

    test('should return null when no winning move', () => {
      const board = [1, 2, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [2, 3, 4, 5, 6, 7, 8];
      const move = findWinningMove(board, emptyPositions, 1);
      expect(move).toBeNull();
    });
  });

  describe('Blocking Move Detection', () => {
    test('should find immediate blocking move', () => {
      const board = [0, 0, 0, 2, 2, 0, 1, 0, 0];
      const emptyPositions = [0, 1, 2, 5, 7, 8];
      const move = findBlockingMove(board, emptyPositions, 1, 2);
      expect(move).toBe(5);
    });

    test('should return null when no blocking needed', () => {
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [1, 2, 3, 4, 5, 6, 7, 8];
      const move = findBlockingMove(board, emptyPositions, 1, 2);
      expect(move).toBeNull();
    });
  });

  describe('Positional Strategy', () => {
    test('should prefer center when available', () => {
      const emptyPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const move = estrategiaPosicional(emptyPositions, 3);
      expect(move).toBe(4);
    });

    test('should prefer corners when center occupied', () => {
      const emptyPositions = [0, 1, 2, 3, 5, 6, 7, 8];
      const move = estrategiaPosicional(emptyPositions, 3);
      expect([0, 2, 6, 8]).toContain(move);
    });

    test('should take edges when corners and center occupied', () => {
      const emptyPositions = [1, 3, 5, 7];
      const move = estrategiaPosicional(emptyPositions, 3);
      expect([1, 3, 5, 7]).toContain(move);
    });
  });

  describe('Turn-Based Strategic Decisions (3x3)', () => {
    test('should take center on first move (9 empty)', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const move = getStrategicMove(board);
      expect(move).toBe(4);
    });

    test('should take center or corner on second move (8 empty)', () => {
      const board = [0, 0, 0, 0, 1, 0, 0, 0, 0]; // Opponent took center
      const move = getStrategicMove(board);
      expect([0, 2, 6, 8]).toContain(move);
    });

    test('should prioritize winning on third move (7 empty)', () => {
      const board = [1, 0, 0, 0, 1, 0, 0, 0, 0];
      const move = getStrategicMove(board);
      expect(move).toBe(8); // Complete diagonal
    });

    test('should block opponent on third move (7 empty)', () => {
      const board = [2, 0, 0, 0, 2, 0, 0, 0, 0];
      const move = getStrategicMove(board);
      expect(move).toBe(8); // Block diagonal
    });

    test('should apply positional strategy when no threats (7 empty)', () => {
      const board = [0, 0, 2, 0, 1, 0, 0, 0, 0];
      const move = getStrategicMove(board);
      // Should choose tactical position
      expect([0, 1, 3, 5, 6, 7, 8]).toContain(move);
    });

    test('should prioritize winning over blocking (6+ empty)', () => {
      const board = [1, 1, 0, 2, 2, 0, 0, 0, 0];
      const move = getStrategicMove(board);
      expect(move).toBe(2); // Win instead of blocking at 5
    });
  });

  describe('Turn-Based Strategic Decisions (5x5)', () => {
    test('should take center on first move (25 empty)', () => {
      const board = Array(25).fill(0);
      const move = getStrategicMove(board);
      expect(move).toBe(12);
    });

    test('should prioritize winning on any move', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[1] = 1;
      board[2] = 1;
      board[3] = 1;
      const move = getStrategicMove(board);
      expect(move).toBe(4); // Complete win
    });

    test('should block opponent on any move', () => {
      const board = Array(25).fill(0);
      board[0] = 2;
      board[1] = 2;
      board[2] = 2;
      board[3] = 2;
      board[10] = 1;
      const move = getStrategicMove(board);
      expect(move).toBe(4); // Block
    });
  });

  describe('Edge Cases', () => {
    test('should handle single empty cell', () => {
      const board = [1, 2, 1, 2, 0, 1, 2, 1, 2];
      const move = getStrategicMove(board);
      expect(move).toBe(4);
    });

    test('should handle complex board state', () => {
      const board = [1, 2, 1, 2, 1, 2, 0, 0, 0];
      const move = getStrategicMove(board);
      expect([6, 7, 8]).toContain(move);
    });
  });
});

