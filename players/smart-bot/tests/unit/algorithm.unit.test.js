/**
 * Pruebas Unitarias del Algoritmo SmartBot
 * Enfoque TDD - pruebas escritas antes de la implementación
 * @lastModified 2025-10-10
 */

import {
  getSmartMove,
  detectMySymbol,
  findWinningMove,
  checkWin
} from '../../algorithm.js';

describe('Algoritmo SmartBot', () => {
  describe('Detección de Símbolos', () => {
    test('debería detectar símbolo X en posiciones vacías impares (3x3)', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 9 vacías
      const emptyPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const symbol = detectMySymbol(board, emptyPositions);
      expect(symbol).toBe(1); // X juega primero
    });

    test('debería detectar símbolo O en posiciones vacías pares (3x3)', () => {
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0]; // 8 vacías
      const emptyPositions = [1, 2, 3, 4, 5, 6, 7, 8];
      const symbol = detectMySymbol(board, emptyPositions);
      expect(symbol).toBe(2); // O juega segundo
    });

    test('debería detectar símbolo X en posiciones vacías impares (5x5)', () => {
      const board = Array(25).fill(0); // 25 vacías
      const emptyPositions = Array.from({ length: 25 }, (_, i) => i);
      const symbol = detectMySymbol(board, emptyPositions);
      expect(symbol).toBe(1);
    });

    test('debería detectar símbolo O en posiciones vacías pares (5x5)', () => {
      const board = Array(25).fill(0);
      board[0] = 1; // 24 vacías
      const emptyPositions = Array.from({ length: 24 }, (_, i) => i + 1);
      const symbol = detectMySymbol(board, emptyPositions);
      expect(symbol).toBe(2);
    });
  });

  describe('Detección de Victoria (3x3)', () => {
    test('debería detectar victoria horizontal', () => {
      const board = [1, 1, 1, 0, 0, 0, 0, 0, 0];
      expect(checkWin(board, 1)).toBe(true);
    });

    test('debería detectar victoria vertical', () => {
      const board = [1, 0, 0, 1, 0, 0, 1, 0, 0];
      expect(checkWin(board, 1)).toBe(true);
    });

    test('debería detectar victoria diagonal', () => {
      const board = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      expect(checkWin(board, 1)).toBe(true);
    });

    test('debería retornar false para sin victoria', () => {
      const board = [1, 2, 1, 0, 0, 0, 0, 0, 0];
      expect(checkWin(board, 1)).toBe(false);
    });
  });

  describe('Detección de Victoria (5x5)', () => {
    test('debería detectar victoria horizontal', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[1] = 1;
      board[2] = 1;
      board[3] = 1;
      board[4] = 1;
      expect(checkWin(board, 1)).toBe(true);
    });

    test('debería detectar victoria vertical', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[5] = 1;
      board[10] = 1;
      board[15] = 1;
      board[20] = 1;
      expect(checkWin(board, 1)).toBe(true);
    });

    test('debería detectar victoria diagonal', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[6] = 1;
      board[12] = 1;
      board[18] = 1;
      board[24] = 1;
      expect(checkWin(board, 1)).toBe(true);
    });
  });

  describe('Detección de Movimiento Ganador', () => {
    test('debería encontrar movimiento ganador inmediato (3x3)', () => {
      const board = [1, 1, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [2, 3, 4, 5, 6, 7, 8];
      const move = findWinningMove(board, emptyPositions, 1);
      expect(move).toBe(2); // Completar fila superior
    });

    test('debería retornar null cuando no hay movimiento ganador (3x3)', () => {
      const board = [1, 2, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = [2, 3, 4, 5, 6, 7, 8];
      const move = findWinningMove(board, emptyPositions, 1);
      expect(move).toBeNull();
    });

    test('debería encontrar movimiento ganador inmediato (5x5)', () => {
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
      expect(move).toBe(4); // Completar fila superior
    });
  });

  describe('Prioridad de Estrategia Inteligente (3x3)', () => {
    test('debería priorizar ganar sobre bloquear', () => {
      const board = [1, 1, 0, 2, 2, 0, 0, 0, 0];
      const move = getSmartMove(board);
      expect(move).toBe(2); // Ganar en lugar de bloquear en 5
    });

    test('debería bloquear movimiento ganador del oponente', () => {
      const board = [0, 0, 0, 2, 2, 0, 1, 0, 0];
      const move = getSmartMove(board);
      expect(move).toBe(5); // Bloquear O de ganar
    });

    test('debería tomar el centro cuando no hay amenazas inmediatas', () => {
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      const move = getSmartMove(board);
      expect(move).toBe(4); // Tomar centro
    });

    test('debería tomar esquina cuando el centro está ocupado', () => {
      const board = [0, 0, 0, 0, 1, 0, 0, 0, 0];
      const move = getSmartMove(board);
      expect([0, 2, 6, 8]).toContain(move); // Tomar esquina
    });

    test('debería tomar cualquier posición disponible como respaldo', () => {
      const board = [1, 2, 0, 2, 1, 2, 1, 2, 1];
      const move = getSmartMove(board);
      expect(move).toBe(2); // Solo posición restante
    });
  });

  describe('Prioridad de Estrategia Inteligente (5x5)', () => {
    test('debería priorizar ganar sobre bloquear', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[1] = 1;
      board[2] = 1;
      board[3] = 1; // X a punto de ganar
      board[5] = 2;
      board[6] = 2;
      board[7] = 2;
      board[8] = 2; // O a punto de ganar
      const move = getSmartMove(board);
      expect(move).toBe(4); // Ganar en lugar de bloquear en 9
    });

    test('debería bloquear movimiento ganador del oponente', () => {
      const board = Array(25).fill(0);
      board[0] = 2;
      board[1] = 2;
      board[2] = 2;
      board[3] = 2;
      board[10] = 1;
      const move = getSmartMove(board);
      expect(move).toBe(4); // Bloquear O de ganar
    });

    test('debería tomar el centro cuando no hay amenazas inmediatas', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      const move = getSmartMove(board);
      expect(move).toBe(12); // Tomar centro (posición 12 en 5x5)
    });

    test('debería tomar esquina cuando el centro está ocupado', () => {
      const board = Array(25).fill(0);
      board[12] = 1;
      const move = getSmartMove(board);
      expect([0, 4, 20, 24]).toContain(move); // Tomar esquina
    });
  });

  describe('Casos Extremos', () => {
    test('debería manejar tablero con una sola celda vacía', () => {
      const board = [1, 2, 1, 2, 0, 1, 2, 1, 2];
      const move = getSmartMove(board);
      expect(move).toBe(4);
    });

    test('debería manejar primer movimiento en tablero vacío', () => {
      const board = Array(9).fill(0);
      const move = getSmartMove(board);
      expect(move).toBe(4); // Centro
    });
  });
});

