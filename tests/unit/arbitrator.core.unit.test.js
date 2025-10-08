/**
 * Pruebas unitarias para funciones puras del Núcleo del Árbitro
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import {
  checkWinner,
  isBoardFull,
  isValidMove,
  makeMove,
  getNextPlayer,
  createInitialBoard,
  checkGameOver,
  getValidMoves,
  isInWinningLine,
} from '../../src/domain/game/arbitrator.core.js';

describe('Pruebas Unitarias del Núcleo del Árbitro', () => {
  describe('createInitialBoard', () => {
    test('debería crear tablero 3x3', () => {
      const board = createInitialBoard(3);
      expect(board).toHaveLength(9);
      expect(board.every(cell => cell === 0)).toBe(true);
    });

    test('debería crear tablero 5x5', () => {
      const board = createInitialBoard(5);
      expect(board).toHaveLength(25);
      expect(board.every(cell => cell === 0)).toBe(true);
    });

    test('debería lanzar error para tamaño de tablero inválido', () => {
      expect(() => createInitialBoard(4)).toThrow('Tamaño de tablero inválido');
    });
  });

  describe('isValidMove', () => {
    test('debería devolver true para un movimiento válido', () => {
      const board = createInitialBoard(3);
      expect(isValidMove(board, 0, 3)).toBe(true);
    });

    test('debería devolver false para una posición ocupada', () => {
      const board = ['X', '', '', '', '', '', '', '', ''];
      expect(isValidMove(board, 0, 3)).toBe(false);
    });

    test('debería devolver false para posición fuera de límites', () => {
      const board = createInitialBoard(3);
      expect(isValidMove(board, 9, 3)).toBe(false);
      expect(isValidMove(board, -1, 3)).toBe(false);
    });
  });

  describe('makeMove', () => {
    test('debería colocar símbolo en el tablero', () => {
      const board = createInitialBoard(3);
      const newBoard = makeMove(board, 0, 'X');
      expect(newBoard[0]).toBe('X');
      expect(newBoard).not.toBe(board); // Asegurar inmutabilidad
    });
  });

  describe('checkWinner', () => {
    test('debería devolver true para victoria horizontal', () => {
      const board = ['X', 'X', 'X', '', '', '', '', '', ''];
      expect(checkWinner(board, 3, 'X')).toBe(true);
    });

    test('debería devolver true para victoria vertical', () => {
      const board = ['O', '', '', 'O', '', '', 'O', '', ''];
      expect(checkWinner(board, 3, 'O')).toBe(true);
    });

    test('debería devolver true para victoria diagonal (principal)', () => {
      const board = ['X', '', '', '', 'X', '', '', '', 'X'];
      expect(checkWinner(board, 3, 'X')).toBe(true);
    });

    test('debería devolver true para victoria diagonal (anti)', () => {
      const board = ['', '', 'O', '', 'O', '', 'O', '', ''];
      expect(checkWinner(board, 3, 'O')).toBe(true);
    });

    test('debería devolver false si no hay ganador', () => {
      const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      expect(checkWinner(board, 3, 'X')).toBe(false);
      expect(checkWinner(board, 3, 'O')).toBe(false);
    });
  });

  describe('isBoardFull', () => {
    test('debería devolver true para un tablero lleno', () => {
      const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      expect(isBoardFull(board)).toBe(true);
    });

    test('debería devolver false para un tablero no lleno', () => {
      const board = ['X', 'O', 'X', 'O', 0, 'O', 'O', 'X', 'O'];
      expect(isBoardFull(board)).toBe(false);
    });
  });

  describe('getNextPlayer', () => {
    test('debería devolver "O" si el jugador actual es "X"', () => {
      expect(getNextPlayer('X')).toBe('O');
    });

    test('debería devolver "X" si el jugador actual es "O"', () => {
      expect(getNextPlayer('O')).toBe('X');
    });
  });

  describe('checkGameOver', () => {
    test('debería detectar fin de juego con ganador', () => {
      const board = ['X', 'X', 'X', '', '', '', '', '', ''];
      const result = checkGameOver(board, 3);
      expect(result.result).toBe('win');
      expect(result.winner).toBe('X');
    });

    test('debería detectar fin de juego con empate', () => {
      const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      const result = checkGameOver(board, 3);
      expect(result.result).toBe('draw');
      expect(result.winner).toBe(null);
    });

    test('debería detectar que el juego no ha terminado', () => {
      const board = createInitialBoard(3);
      const result = checkGameOver(board, 3);
      expect(result.result).toBe('continue');
      expect(result.winner).toBe(null);
    });
  });

  describe('getValidMoves', () => {
    test('debería devolver todas las posiciones para tablero vacío', () => {
      const board = createInitialBoard(3);
      expect(getValidMoves(board, 3)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    test('debería devolver solo posiciones vacías', () => {
      const board = ['X', 0, 'O', 0, 'X', 0, 'O', 0, 0];
      expect(getValidMoves(board, 3)).toEqual([1, 3, 5, 7, 8]);
    });
  });

  describe('isInWinningLine', () => {
    test('debería detectar posición en línea ganadora', () => {
      const board = ['X', 'X', 0, 0, 0, 0, 0, 0, 0];
      expect(isInWinningLine(board, 2, 3, 'X')).toBe(true);
    });

    test('debería no detectar posición no en línea ganadora', () => {
      const board = ['X', 'O', 'X', 0, 0, 0, 0, 0, 0];
      expect(isInWinningLine(board, 0, 3, 'X')).toBe(false);
    });
  });
});
