/**
 * Pruebas unitarias para funciones puras de Board Utils
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import {
  getBoardSize,
  getCellPosition,
  getRowCol,
  isValidPosition,
  getEmptyPositions,
  getOccupiedPositions,
  countEmptyCells,
  countOccupiedCells,
  boardToString,
  copyBoard,
  boardsEqual,
  getWinningLines,
  isLineComplete,
  getSymbolPositions,
  isEdgePosition,
  isCenterPosition,
  getAdjacentPositions,
  getRowPositions,
  getColumnPositions,
  getMainDiagonalPositions,
  getAntiDiagonalPositions,
  positionToCoordinates,
  coordinatesToPosition,
} from '../../src/domain/game/board.utils.js';

describe('Pruebas Unitarias de Board Utils', () => {
  describe('getBoardSize', () => {
    test('debería devolver 3 for 3x3 board', () => {
      const board = Array(9).fill(0);
      expect(getBoardSize(board)).toBe(3);
    });

    test('debería devolver 5 for 5x5 board', () => {
      const board = Array(25).fill(0);
      expect(getBoardSize(board)).toBe(5);
    });

    test('debería lanzar error para tamaño de tablero inválido', () => {
      expect(() => getBoardSize(Array(10).fill(0))).toThrow(
        'Tamaño de tablero inválido'
      );
      expect(() => getBoardSize(Array(15).fill(0))).toThrow(
        'Tamaño de tablero inválido'
      );
    });

    test('debería manejar empty array', () => {
      expect(() => getBoardSize([])).toThrow('Tamaño de tablero inválido');
    });

    test('debería manejar single element array', () => {
      expect(() => getBoardSize([1])).toThrow('Tamaño de tablero inválido');
    });
  });

  describe('getCellPosition', () => {
    test('debería devolver correct position for 3x3 board', () => {
      expect(getCellPosition(0, 0, 3)).toBe(0);
      expect(getCellPosition(0, 1, 3)).toBe(1);
      expect(getCellPosition(1, 0, 3)).toBe(3);
      expect(getCellPosition(2, 2, 3)).toBe(8);
    });

    test('debería devolver correct position for 5x5 board', () => {
      expect(getCellPosition(0, 0, 5)).toBe(0);
      expect(getCellPosition(0, 4, 5)).toBe(4);
      expect(getCellPosition(4, 0, 5)).toBe(20);
      expect(getCellPosition(4, 4, 5)).toBe(24);
    });
  });

  describe('getRowCol', () => {
    test('debería devolver correct row and column for 3x3 board', () => {
      expect(getRowCol(0, 3)).toEqual({ row: 0, col: 0 });
      expect(getRowCol(1, 3)).toEqual({ row: 0, col: 1 });
      expect(getRowCol(3, 3)).toEqual({ row: 1, col: 0 });
      expect(getRowCol(8, 3)).toEqual({ row: 2, col: 2 });
    });

    test('debería devolver correct row and column for 5x5 board', () => {
      expect(getRowCol(0, 5)).toEqual({ row: 0, col: 0 });
      expect(getRowCol(4, 5)).toEqual({ row: 0, col: 4 });
      expect(getRowCol(5, 5)).toEqual({ row: 1, col: 0 });
      expect(getRowCol(24, 5)).toEqual({ row: 4, col: 4 });
    });
  });

  describe('isValidPosition', () => {
    test('debería devolver true for valid positions in 3x3 board', () => {
      expect(isValidPosition(0, 3)).toBe(true);
      expect(isValidPosition(4, 3)).toBe(true);
      expect(isValidPosition(8, 3)).toBe(true);
    });

    test('debería devolver false for invalid positions in 3x3 board', () => {
      expect(isValidPosition(-1, 3)).toBe(false);
      expect(isValidPosition(9, 3)).toBe(false);
    });

    test('debería devolver true for valid positions in 5x5 board', () => {
      expect(isValidPosition(0, 5)).toBe(true);
      expect(isValidPosition(12, 5)).toBe(true);
      expect(isValidPosition(24, 5)).toBe(true);
    });

    test('debería devolver false for invalid positions in 5x5 board', () => {
      expect(isValidPosition(-1, 5)).toBe(false);
      expect(isValidPosition(25, 5)).toBe(false);
    });
  });

  describe('getEmptyPositions', () => {
    test('debería devolver all empty positions', () => {
      const board = [1, 0, 2, 0, 0, 1, 0, 2, 0];
      const emptyPositions = getEmptyPositions(board);
      expect(emptyPositions).toEqual([1, 3, 4, 6, 8]);
    });

    test('debería devolver empty array for full board', () => {
      const board = [1, 2, 1, 2, 1, 2, 2, 1, 2];
      const emptyPositions = getEmptyPositions(board);
      expect(emptyPositions).toEqual([]);
    });

    test('debería devolver all positions for empty board', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const emptyPositions = getEmptyPositions(board);
      expect(emptyPositions).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    test('debería manejar mixed empty values (0 and empty string)', () => {
      const board = [1, 0, 2, '', 0, 1, '', 2, 0];
      const emptyPositions = getEmptyPositions(board);
      expect(emptyPositions).toEqual([1, 3, 4, 6, 8]);
    });
  });

  describe('getOccupiedPositions', () => {
    test('debería devolver positions occupied by specific player', () => {
      const board = [1, 0, 2, 1, 0, 2, 0, 1, 0];
      const player1Positions = getOccupiedPositions(board, 1);
      const player2Positions = getOccupiedPositions(board, 2);

      expect(player1Positions).toEqual([0, 3, 7]);
      expect(player2Positions).toEqual([2, 5]);
    });

    test('debería devolver empty array when player has no positions', () => {
      const board = [1, 1, 1, 0, 0, 0, 0, 0, 0];
      const player2Positions = getOccupiedPositions(board, 2);
      expect(player2Positions).toEqual([]);
    });
  });

  describe('countEmptyCells', () => {
    test('debería contar empty cells correctly', () => {
      const board = [1, 0, 2, 0, 0, 1, 0, 2, 0];
      expect(countEmptyCells(board)).toBe(5);
    });

    test('debería devolver 0 for full board', () => {
      const board = [1, 2, 1, 2, 1, 2, 2, 1, 2];
      expect(countEmptyCells(board)).toBe(0);
    });

    test('debería devolver board length for empty board', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      expect(countEmptyCells(board)).toBe(9);
    });

    test('debería manejar mixed empty values', () => {
      const board = [1, 0, 2, '', 0, 1, '', 2, 0];
      expect(countEmptyCells(board)).toBe(5);
    });
  });

  describe('countOccupiedCells', () => {
    test('debería contar occupied cells correctly', () => {
      const board = [1, 0, 2, 0, 0, 1, 0, 2, 0];
      expect(countOccupiedCells(board)).toBe(4);
    });

    test('debería devolver board length for full board', () => {
      const board = [1, 2, 1, 2, 1, 2, 2, 1, 2];
      expect(countOccupiedCells(board)).toBe(9);
    });

    test('debería devolver 0 for empty board', () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      expect(countOccupiedCells(board)).toBe(0);
    });

    test('debería manejar mixed empty values', () => {
      const board = [1, 0, 2, '', 0, 1, '', 2, 0];
      expect(countOccupiedCells(board)).toBe(4);
    });
  });

  describe('boardToString', () => {
    test('debería convertir 3x3 board to string', () => {
      const board = [1, 0, 2, 0, 1, 0, 2, 0, 1];
      const result = boardToString(board, 3);

      expect(result).toBe('X . O\n. X .\nO . X');
    });

    test('debería convertir 5x5 board to string', () => {
      const board = Array(25).fill(0);
      board[0] = 1;
      board[24] = 2;
      const result = boardToString(board, 5);

      const lines = result.split('\n');
      expect(lines).toHaveLength(5);
      expect(lines[0]).toBe('X . . . .');
      expect(lines[4]).toBe('. . . . O');
    });

    test('debería manejar empty string values', () => {
      const board = [1, '', 2, '', 1, '', 2, '', 1];
      const result = boardToString(board, 3);
      expect(result).toBe('X . O\n. X .\nO . X');
    });

    test('debería manejar undefined/null values with fallback', () => {
      const board = [1, undefined, 2, null, 1, undefined, 2, null, 1];
      const result = boardToString(board, 3);
      expect(result).toBe('X . O\n. X .\nO . X');
    });
  });

  describe('copyBoard', () => {
    test('debería crear independent copy of board', () => {
      const original = [1, 0, 2, 0, 1, 0, 2, 0, 1];
      const copy = copyBoard(original);

      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);

      // Modificar copia y asegurar que el original no cambió
      copy[0] = 0;
      expect(original[0]).toBe(1);
    });

    test('debería manejar empty board', () => {
      const original = [];
      const copy = copyBoard(original);
      expect(copy).toEqual([]);
      expect(copy).not.toBe(original);
    });
  });

  describe('boardsEqual', () => {
    test('debería devolver true for equal boards', () => {
      const board1 = [1, 0, 2, 0, 1, 0, 2, 0, 1];
      const board2 = [1, 0, 2, 0, 1, 0, 2, 0, 1];

      expect(boardsEqual(board1, board2)).toBe(true);
    });

    test('debería devolver false for different boards', () => {
      const board1 = [1, 0, 2, 0, 1, 0, 2, 0, 1];
      const board2 = [1, 0, 2, 0, 1, 0, 2, 0, 0];

      expect(boardsEqual(board1, board2)).toBe(false);
    });

    test('debería devolver false for different length boards', () => {
      const board1 = [1, 0, 2];
      const board2 = [1, 0, 2, 0, 1, 0, 2, 0, 1];

      expect(boardsEqual(board1, board2)).toBe(false);
    });

    test('debería devolver true for empty boards', () => {
      const board1 = [];
      const board2 = [];

      expect(boardsEqual(board1, board2)).toBe(true);
    });
  });

  describe('getWinningLines', () => {
    test('debería devolver winning lines for 3x3 board', () => {
      const lines = getWinningLines(3);

      // Debería tener 8 líneas: 3 filas + 3 columnas + 2 diagonales
      expect(lines).toHaveLength(8);

      // Verificar filas
      expect(lines[0]).toEqual([0, 1, 2]); // Fila 0
      expect(lines[1]).toEqual([3, 4, 5]); // Fila 1
      expect(lines[2]).toEqual([6, 7, 8]); // Fila 2

      // Verificar columnas
      expect(lines[3]).toEqual([0, 3, 6]); // Columna 0
      expect(lines[4]).toEqual([1, 4, 7]); // Columna 1
      expect(lines[5]).toEqual([2, 5, 8]); // Columna 2

      // Verificar diagonales
      expect(lines[6]).toEqual([0, 4, 8]); // Diagonal principal
      expect(lines[7]).toEqual([2, 4, 6]); // Anti-diagonal
    });

    test('debería devolver winning lines for 5x5 board', () => {
      const lines = getWinningLines(5);

      // Debería tener 12 líneas: 5 filas + 5 columnas + 2 diagonales
      expect(lines).toHaveLength(12);

      // Verificar primera fila
      expect(lines[0]).toEqual([0, 1, 2, 3, 4]);

      // Verificar primera columna
      expect(lines[5]).toEqual([0, 5, 10, 15, 20]);

      // Verificar diagonal principal
      expect(lines[10]).toEqual([0, 6, 12, 18, 24]);

      // Verificar anti-diagonal
      expect(lines[11]).toEqual([4, 8, 12, 16, 20]);
    });
  });

  describe('isLineComplete', () => {
    test('debería devolver true for complete line', () => {
      const board = ['X', 'X', 'X', '', '', '', '', '', ''];
      const line = [0, 1, 2];
      expect(isLineComplete(board, line, 'X')).toBe(true);
    });

    test('debería devolver false for incomplete line', () => {
      const board = ['X', 'O', 'X', '', '', '', '', '', ''];
      const line = [0, 1, 2];
      expect(isLineComplete(board, line, 'X')).toBe(false);
    });

    test('debería devolver false for different symbol', () => {
      const board = ['X', 'X', 'X', '', '', '', '', '', ''];
      const line = [0, 1, 2];
      expect(isLineComplete(board, line, 'O')).toBe(false);
    });
  });

  describe('getSymbolPositions', () => {
    test('debería devolver positions of specific symbol', () => {
      const board = ['X', 'O', 'X', 'O', '', 'X', 'O', '', 'X'];
      const xPositions = getSymbolPositions(board, 'X');
      const oPositions = getSymbolPositions(board, 'O');

      expect(xPositions).toEqual([0, 2, 5, 8]);
      expect(oPositions).toEqual([1, 3, 6]);
    });

    test('debería devolver empty array when symbol not found', () => {
      const board = ['X', 'X', 'X', '', '', '', '', '', ''];
      const oPositions = getSymbolPositions(board, 'O');
      expect(oPositions).toEqual([]);
    });
  });

  describe('isEdgePosition', () => {
    test('debería devolver true for edge positions in 3x3 board', () => {
      expect(isEdgePosition(0, 3)).toBe(true); // Top-left
      expect(isEdgePosition(2, 3)).toBe(true); // Top-right
      expect(isEdgePosition(6, 3)).toBe(true); // Bottom-left
      expect(isEdgePosition(8, 3)).toBe(true); // Bottom-right
      expect(isEdgePosition(1, 3)).toBe(true); // Top edge
      expect(isEdgePosition(3, 3)).toBe(true); // Left edge
    });

    test('debería devolver false for center positions in 3x3 board', () => {
      expect(isEdgePosition(4, 3)).toBe(false); // Center
    });

    test('debería devolver true for edge positions in 5x5 board', () => {
      expect(isEdgePosition(0, 5)).toBe(true); // Top-left
      expect(isEdgePosition(4, 5)).toBe(true); // Top-right
      expect(isEdgePosition(20, 5)).toBe(true); // Bottom-left
      expect(isEdgePosition(24, 5)).toBe(true); // Bottom-right
    });
  });

  describe('isCenterPosition', () => {
    test('debería devolver true for center position in 3x3 board', () => {
      expect(isCenterPosition(4, 3)).toBe(true); // Center
    });

    test('debería devolver false for non-center positions in 3x3 board', () => {
      expect(isCenterPosition(0, 3)).toBe(false);
      expect(isCenterPosition(1, 3)).toBe(false);
      expect(isCenterPosition(8, 3)).toBe(false);
    });

    test('debería devolver true for center position in 5x5 board', () => {
      expect(isCenterPosition(12, 5)).toBe(true); // Center
    });

    test('debería devolver false for non-center positions in 5x5 board', () => {
      expect(isCenterPosition(0, 5)).toBe(false);
      expect(isCenterPosition(24, 5)).toBe(false);
    });
  });

  describe('getAdjacentPositions', () => {
    test('debería devolver adjacent positions for center of 3x3 board', () => {
      const adjacent = getAdjacentPositions(4, 3); // Center position
      expect(adjacent).toEqual([0, 1, 2, 3, 5, 6, 7, 8]);
    });

    test('debería devolver adjacent positions for corner of 3x3 board', () => {
      const adjacent = getAdjacentPositions(0, 3); // Top-left corner
      expect(adjacent).toEqual([1, 3, 4]);
    });

    test('debería devolver adjacent positions for edge of 3x3 board', () => {
      const adjacent = getAdjacentPositions(1, 3); // Top edge
      expect(adjacent).toEqual([0, 2, 3, 4, 5]);
    });

    test('debería devolver adjacent positions for center of 5x5 board', () => {
      const adjacent = getAdjacentPositions(12, 5); // Center position
      expect(adjacent).toEqual([6, 7, 8, 11, 13, 16, 17, 18]);
    });
  });

  describe('getRowPositions', () => {
    test('debería devolver positions for row 0 in 3x3 board', () => {
      const positions = getRowPositions(0, 3);
      expect(positions).toEqual([0, 1, 2]);
    });

    test('debería devolver positions for row 1 in 3x3 board', () => {
      const positions = getRowPositions(1, 3);
      expect(positions).toEqual([3, 4, 5]);
    });

    test('debería devolver positions for row 0 in 5x5 board', () => {
      const positions = getRowPositions(0, 5);
      expect(positions).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('getColumnPositions', () => {
    test('debería devolver positions for column 0 in 3x3 board', () => {
      const positions = getColumnPositions(0, 3);
      expect(positions).toEqual([0, 3, 6]);
    });

    test('debería devolver positions for column 1 in 3x3 board', () => {
      const positions = getColumnPositions(1, 3);
      expect(positions).toEqual([1, 4, 7]);
    });

    test('debería devolver positions for column 0 in 5x5 board', () => {
      const positions = getColumnPositions(0, 5);
      expect(positions).toEqual([0, 5, 10, 15, 20]);
    });
  });

  describe('getMainDiagonalPositions', () => {
    test('debería devolver main diagonal positions for 3x3 board', () => {
      const positions = getMainDiagonalPositions(3);
      expect(positions).toEqual([0, 4, 8]);
    });

    test('debería devolver main diagonal positions for 5x5 board', () => {
      const positions = getMainDiagonalPositions(5);
      expect(positions).toEqual([0, 6, 12, 18, 24]);
    });
  });

  describe('getAntiDiagonalPositions', () => {
    test('debería devolver anti-diagonal positions for 3x3 board', () => {
      const positions = getAntiDiagonalPositions(3);
      expect(positions).toEqual([2, 4, 6]);
    });

    test('debería devolver anti-diagonal positions for 5x5 board', () => {
      const positions = getAntiDiagonalPositions(5);
      expect(positions).toEqual([4, 8, 12, 16, 20]);
    });
  });

  describe('positionToCoordinates', () => {
    test('debería convertir position to coordinates for 3x3 board', () => {
      expect(positionToCoordinates(0, 3)).toEqual({ row: 0, col: 0 });
      expect(positionToCoordinates(4, 3)).toEqual({ row: 1, col: 1 });
      expect(positionToCoordinates(8, 3)).toEqual({ row: 2, col: 2 });
    });

    test('debería convertir position to coordinates for 5x5 board', () => {
      expect(positionToCoordinates(0, 5)).toEqual({ row: 0, col: 0 });
      expect(positionToCoordinates(12, 5)).toEqual({ row: 2, col: 2 });
      expect(positionToCoordinates(24, 5)).toEqual({ row: 4, col: 4 });
    });
  });

  describe('coordinatesToPosition', () => {
    test('debería convertir coordinates to position for 3x3 board', () => {
      expect(coordinatesToPosition(0, 0, 3)).toBe(0);
      expect(coordinatesToPosition(1, 1, 3)).toBe(4);
      expect(coordinatesToPosition(2, 2, 3)).toBe(8);
    });

    test('debería convertir coordinates to position for 5x5 board', () => {
      expect(coordinatesToPosition(0, 0, 5)).toBe(0);
      expect(coordinatesToPosition(2, 2, 5)).toBe(12);
      expect(coordinatesToPosition(4, 4, 5)).toBe(24);
    });
  });
});
