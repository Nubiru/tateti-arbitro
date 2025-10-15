/**
 * Pruebas Unitarias del Algoritmo StrategicBot
 * Enfoque TDD - pruebas escritas antes de la implementación
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

describe('Algoritmo StrategicBot', () => {
  describe('Detección de Símbolos', () => {
    test('debería detectar símbolo X en primer movimiento (9 vacías)', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const symbol = detectMySymbol(board, emptyPositions);
      expect(symbol).toBe(1);
    });

    test('debería detectar símbolo O en segundo movimiento (8 vacías)', () => {
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [1, 2, 3, 4, 5, 6, 7, 8];
      const symbol = detectMySymbol(board, emptyPositions);
      expect(symbol).toBe(2);
    });
  });

  describe('Detección de Victoria', () => {
    test('debería detectar victoria horizontal (3x3)', () => {
      const board = [1, 1, 1, 0, 0, 0, 0, 0, 0];
      expect(checkWin(board, 1)).toBe(true);
    });

    test('debería detectar victoria vertical (3x3)', () => {
      const board = [1, 0, 0, 1, 0, 0, 1, 0, 0];
      expect(checkWin(board, 1)).toBe(true);
    });

    test('debería detectar victoria diagonal (3x3)', () => {
      const board = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      expect(checkWin(board, 1)).toBe(true);
    });

    test('debería detectar victoria horizontal (5x5)', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[1] = 1;
      board[2] = 1;
      board[3] = 1;
      board[4] = 1;
      expect(checkWin(board, 1)).toBe(true);
    });
  });

  describe('Detección de Movimiento Ganador', () => {
    test('debería encontrar movimiento ganador inmediato', () => {
      const board = [1, 1, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [2, 3, 4, 5, 6, 7, 8];
      const move = findWinningMove(board, emptyPositions, 1);
      expect(move).toBe(2);
    });

    test('debería retornar null cuando no hay movimiento ganador', () => {
      const board = [1, 2, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [2, 3, 4, 5, 6, 7, 8];
      const move = findWinningMove(board, emptyPositions, 1);
      expect(move).toBeNull();
    });
  });

  describe('Detección de Movimiento de Bloqueo', () => {
    test('debería encontrar movimiento de bloqueo inmediato', () => {
      const board = [0, 0, 0, 2, 2, 0, 1, 0, 0];
      const emptyPositions = [0, 1, 2, 5, 7, 8];
      const move = findBlockingMove(board, emptyPositions, 1, 2);
      expect(move).toBe(5);
    });

    test('debería retornar null cuando no se necesita bloqueo', () => {
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [1, 2, 3, 4, 5, 6, 7, 8];
      const move = findBlockingMove(board, emptyPositions, 1, 2);
      expect(move).toBeNull();
    });
  });

  describe('Estrategia Posicional', () => {
    test('debería preferir centro cuando esté disponible', () => {
      const emptyPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const move = estrategiaPosicional(emptyPositions, 3);
      expect(move).toBe(4);
    });

    test('debería preferir esquinas cuando el centro esté ocupado', () => {
      const emptyPositions = [0, 1, 2, 3, 5, 6, 7, 8];
      const move = estrategiaPosicional(emptyPositions, 3);
      expect([0, 2, 6, 8]).toContain(move);
    });

    test('debería tomar bordes cuando esquinas y centro estén ocupados', () => {
      const emptyPositions = [1, 3, 5, 7];
      const move = estrategiaPosicional(emptyPositions, 3);
      expect([1, 3, 5, 7]).toContain(move);
    });
  });

  describe('Decisiones Estratégicas Basadas en Turnos (3x3)', () => {
    test('debería tomar centro en primer movimiento (9 vacías)', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const move = getStrategicMove(board);
      expect(move).toBe(4);
    });

    test('debería tomar centro o esquina en segundo movimiento (8 vacías)', () => {
      const board = [0, 0, 0, 0, 1, 0, 0, 0, 0]; // Oponente tomó centro
      const move = getStrategicMove(board);
      expect([0, 2, 6, 8]).toContain(move);
    });

    test('debería priorizar ganar en tercer movimiento (7 vacías)', () => {
      const board = [1, 0, 0, 0, 1, 0, 0, 0, 0];
      const move = getStrategicMove(board);
      expect(move).toBe(8); // Completar diagonal
    });

    test('debería bloquear oponente en tercer movimiento (7 vacías)', () => {
      const board = [2, 0, 0, 0, 2, 0, 0, 0, 0];
      const move = getStrategicMove(board);
      expect(move).toBe(8); // Bloquear diagonal
    });

    test('debería aplicar estrategia posicional cuando no hay amenazas (7 vacías)', () => {
      const board = [0, 0, 2, 0, 1, 0, 0, 0, 0];
      const move = getStrategicMove(board);
      // Debería elegir posición táctica
      expect([0, 1, 3, 5, 6, 7, 8]).toContain(move);
    });

    test('debería priorizar ganar sobre bloquear (6+ vacías)', () => {
      const board = [1, 1, 0, 2, 2, 0, 0, 0, 0];
      const move = getStrategicMove(board);
      expect(move).toBe(2); // Ganar en lugar de bloquear en 5
    });
  });

  describe('Decisiones Estratégicas Basadas en Turnos (5x5)', () => {
    test('debería tomar centro en primer movimiento (25 vacías)', () => {
      const board = Array(25).fill(0);
      const move = getStrategicMove(board);
      expect(move).toBe(12);
    });

    test('debería priorizar ganar en cualquier movimiento', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[1] = 1;
      board[2] = 1;
      board[3] = 1;
      const move = getStrategicMove(board);
      expect(move).toBe(4); // Completar victoria
    });

    test('debería bloquear oponente en cualquier movimiento', () => {
      const board = Array(25).fill(0);
      board[0] = 2;
      board[1] = 2;
      board[2] = 2;
      board[3] = 2;
      board[10] = 1;
      const move = getStrategicMove(board);
      expect(move).toBe(4); // Bloquear
    });
  });

  describe('Casos Extremos', () => {
    test('debería manejar celda vacía única', () => {
      const board = [1, 2, 1, 2, 0, 1, 2, 1, 2];
      const move = getStrategicMove(board);
      expect(move).toBe(4);
    });

    test('debería manejar estado de tablero complejo', () => {
      const board = [1, 2, 1, 2, 1, 2, 0, 0, 0];
      const move = getStrategicMove(board);
      expect([6, 7, 8]).toContain(move);
    });
  });
});

