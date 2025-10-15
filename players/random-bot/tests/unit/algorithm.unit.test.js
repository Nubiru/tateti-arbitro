/**
 * Pruebas Unitarias del Algoritmo RandomBot
 * Pruebas unitarias puras - sin servidor, sin async, ejecución instantánea
 * Pruebas de conciencia del tamaño del tablero (3x3 y 5x5)
 * @lastModified 2025-10-10
 */

import { getRandomMove } from '../../algorithm.js';

describe('Algoritmo RandomBot', () => {
  describe('Soporte de Tablero 3x3', () => {
    test('debería retornar movimiento válido para tablero 3x3 vacío', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const move = getRandomMove(board);
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThan(9);
    });

    test('debería retornar movimiento válido para tablero 3x3 parcialmente lleno', () => {
      const board = [1, 2, 0, 0, 1, 0, 2, 0, 0];
      const move = getRandomMove(board);
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThan(9);
      expect(board[move]).toBe(0); // El movimiento es en una celda vacía
    });

    test('debería elegir solo de celdas vacías en tablero 3x3', () => {
      const board = [1, 2, 1, 2, 1, 2, 0, 0, 0];
      const validMoves = [6, 7, 8];
      const move = getRandomMove(board);
      expect(validMoves).toContain(move);
    });
  });

  describe('Soporte de Tablero 5x5', () => {
    test('debería retornar movimiento válido para tablero 5x5 vacío', () => {
      const board = Array(25).fill(0);
      const move = getRandomMove(board);
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThan(25);
    });

    test('debería retornar movimiento válido para tablero 5x5 parcialmente lleno', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[12] = 2;
      board[24] = 1;
      const move = getRandomMove(board);
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThan(25);
      expect(board[move]).toBe(0);
    });

    test('debería elegir solo de celdas vacías en tablero 5x5', () => {
      const board = Array(25).fill(1);
      board[5] = 0;
      board[15] = 0;
      board[20] = 0;
      const validMoves = [5, 15, 20];
      const move = getRandomMove(board);
      expect(validMoves).toContain(move);
    });
  });

  describe('Casos Extremos', () => {
    test('debería manejar tablero con una sola celda vacía', () => {
      const board = [1, 2, 1, 2, 0, 1, 2, 1, 2];
      const move = getRandomMove(board);
      expect(move).toBe(4);
    });

    test('debería retornar 0 cuando no hay celdas vacías (respaldo)', () => {
      const board = [1, 2, 1, 2, 1, 2, 1, 2, 1];
      const move = getRandomMove(board);
      expect(move).toBe(0);
    });
  });
});

