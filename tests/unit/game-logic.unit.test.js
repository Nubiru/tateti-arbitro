/**
 * Pruebas Unitarias para Lógica de Juego
 * Pruebas rápidas y aisladas para la lógica de negocio central
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { describe, test, expect } from '@jest/globals';

// Funciones simuladas de lógica de juego (estas se importarían de módulos reales)
const checkWin = (board, size = 3) => {
  const lines = [];

  // Filas
  for (let i = 0; i < size; i++) {
    lines.push(Array.from({ length: size }, (_, j) => i * size + j));
  }

  // Columnas
  for (let i = 0; i < size; i++) {
    lines.push(Array.from({ length: size }, (_, j) => j * size + i));
  }

  // Diagonales
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));

  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }

  return null;
};

const isBoardFull = board => {
  return board.every(cell => cell !== 0);
};

const isValidMove = (board, position) => {
  return position >= 0 && position < board.length && board[position] === 0;
};

describe('Pruebas Unitarias de Lógica de Juego', () => {
  describe('checkWin', () => {
    test('debería detectar victoria horizontal para jugador 1', () => {
      const board = [1, 1, 1, 0, 0, 0, 0, 0, 0];
      const result = checkWin(board);
      expect(result).toEqual({ winner: 1, line: [0, 1, 2] });
    });

    test('debería detectar victoria vertical para jugador 2', () => {
      const board = [2, 0, 0, 2, 0, 0, 2, 0, 0];
      const result = checkWin(board);
      expect(result).toEqual({ winner: 2, line: [0, 3, 6] });
    });

    test('debería detectar victoria diagonal para jugador 1', () => {
      const board = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      const result = checkWin(board);
      expect(result).toEqual({ winner: 1, line: [0, 4, 8] });
    });

    test('debería retornar null cuando no hay victoria', () => {
      const board = [1, 2, 1, 2, 1, 2, 2, 1, 2];
      const result = checkWin(board);
      expect(result).toBeNull();
    });

    test('debería funcionar con tablero 5x5', () => {
      const board = Array(25).fill(0);
      board[0] = board[1] = board[2] = board[3] = board[4] = 1;
      const result = checkWin(board, 5);
      expect(result).toEqual({ winner: 1, line: [0, 1, 2, 3, 4] });
    });
  });

  describe('isBoardFull', () => {
    test('debería retornar true para tablero lleno', () => {
      const board = [1, 2, 1, 2, 1, 2, 2, 1, 2];
      expect(isBoardFull(board)).toBe(true);
    });

    test('debería retornar false para tablero vacío', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      expect(isBoardFull(board)).toBe(false);
    });

    test('debería retornar false para tablero parcialmente lleno', () => {
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      expect(isBoardFull(board)).toBe(false);
    });
  });

  describe('isValidMove', () => {
    test('debería retornar true para movimiento válido', () => {
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      expect(isValidMove(board, 1)).toBe(true);
    });

    test('debería retornar false para posición ocupada', () => {
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      expect(isValidMove(board, 0)).toBe(false);
    });

    test('debería retornar false para posición fuera de límites', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      expect(isValidMove(board, 9)).toBe(false);
      expect(isValidMove(board, -1)).toBe(false);
    });
  });
});
