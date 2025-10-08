/**
 * Utilidades del Tablero
 * Funciones auxiliares para operaciones del tablero de juego
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

/**
 * Obtener tamaño del tablero desde el array del tablero
 * @param {Array} board - El tablero de juego
 * @returns {number} Tamaño del tablero (3 para 3x3, 5 para 5x5)
 */
export function getBoardSize(board) {
  if (!Array.isArray(board) || board.length === 0) {
    throw new Error('Tamaño de tablero inválido');
  }

  const size = Math.sqrt(board.length);
  if (size !== Math.floor(size) || ![3, 5].includes(size)) {
    throw new Error('Tamaño de tablero inválido');
  }

  return size;
}

/**
 * Obtener posición de celda desde fila y columna
 * @param {number} row - Número de fila
 * @param {number} col - Número de columna
 * @param {number} boardSize - Tamaño del tablero
 * @returns {number} Posición en el tablero
 */
export function getCellPosition(row, col, boardSize) {
  return row * boardSize + col;
}

/**
 * Obtener fila y columna desde posición
 * @param {number} position - Posición en el tablero
 * @param {number} boardSize - Tamaño del tablero
 * @returns {Object} Fila y columna
 */
export function getRowCol(position, boardSize) {
  return {
    row: Math.floor(position / boardSize),
    col: position % boardSize,
  };
}

/**
 * Verificar si la posición es válida para el tablero
 * @param {number} position - Posición a verificar
 * @param {number} boardSize - Tamaño del tablero
 * @returns {boolean} Verdadero si es válida
 */
export function isValidPosition(position, boardSize) {
  return position >= 0 && position < boardSize * boardSize;
}

/**
 * Obtener posiciones ocupadas por un jugador específico
 * @param {Array} board - El tablero de juego
 * @param {number} player - Número de jugador (1 o 2)
 * @returns {Array} Array de posiciones ocupadas
 */
export function getOccupiedPositions(board, player) {
  return board
    .map((cell, index) => (cell === player ? index : -1))
    .filter(index => index !== -1);
}

/**
 * Contar celdas vacías en el tablero
 * @param {Array} board - El tablero de juego
 * @returns {number} Número de celdas vacías
 */
export function countEmptyCells(board) {
  return board.filter(cell => cell === 0 || cell === '').length;
}

/**
 * Contar celdas ocupadas en el tablero
 * @param {Array} board - El tablero de juego
 * @returns {number} Número de celdas ocupadas
 */
export function countOccupiedCells(board) {
  return board.filter(cell => cell !== 0 && cell !== '').length;
}

/**
 * Convertir tablero a representación de cadena
 * @param {Array} board - El tablero de juego
 * @param {number} boardSize - Tamaño del tablero
 * @returns {string} Representación de cadena
 */
export function boardToString(board, boardSize) {
  const symbols = { 1: 'X', 2: 'O', 0: '.', '': '.' };
  let result = '';

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const position = row * boardSize + col;
      const cell = board[position];
      result += symbols[cell] || '.';
      if (col < boardSize - 1) result += ' ';
    }
    if (row < boardSize - 1) result += '\n';
  }

  return result;
}

/**
 * Crear una copia del tablero
 * @param {Array} board - El tablero de juego
 * @returns {Array} Copia del tablero
 */
export function copyBoard(board) {
  return [...board];
}

/**
 * Verificar si dos tableros son iguales
 * @param {Array} board1 - Primer tablero
 * @param {Array} board2 - Segundo tablero
 * @returns {boolean} Verdadero si son iguales
 */
export function boardsEqual(board1, board2) {
  if (board1.length !== board2.length) return false;
  return board1.every((cell, index) => cell === board2[index]);
}

/**
 * Obtener líneas ganadoras para un tamaño de tablero
 * @param {number} boardSize - Tamaño del tablero
 * @returns {Array} Array de líneas ganadoras
 */
export function getWinningLines(boardSize) {
  const lines = [];

  // Filas
  for (let row = 0; row < boardSize; row++) {
    const line = [];
    for (let col = 0; col < boardSize; col++) {
      line.push(row * boardSize + col);
    }
    lines.push(line);
  }

  // Columnas
  for (let col = 0; col < boardSize; col++) {
    const line = [];
    for (let row = 0; row < boardSize; row++) {
      line.push(row * boardSize + col);
    }
    lines.push(line);
  }

  // Diagonal principal
  const mainDiagonal = [];
  for (let i = 0; i < boardSize; i++) {
    mainDiagonal.push(i * boardSize + i);
  }
  lines.push(mainDiagonal);

  // Anti-diagonal
  const antiDiagonal = [];
  for (let i = 0; i < boardSize; i++) {
    antiDiagonal.push(i * boardSize + (boardSize - 1 - i));
  }
  lines.push(antiDiagonal);

  return lines;
}

/**
 * Verificar si una línea está completa con el mismo símbolo
 * @param {Array} board - El tablero de juego
 * @param {Array} line - Posiciones de la línea
 * @param {string} symbol - Símbolo a verificar
 * @returns {boolean} Verdadero si la línea está completa
 */
export function isLineComplete(board, line, symbol) {
  return line.every(position => board[position] === symbol);
}

/**
 * Obtener posiciones vacías en el tablero
 * @param {Array} board - El tablero de juego
 * @returns {Array} Array de posiciones vacías
 */
export function getEmptyPositions(board) {
  return board
    .map((cell, index) => (cell === 0 || cell === '' ? index : -1))
    .filter(index => index !== -1);
}

/**
 * Obtener posiciones ocupadas por un símbolo específico
 * @param {Array} board - El tablero de juego
 * @param {string} symbol - Símbolo a buscar
 * @returns {Array} Array de posiciones ocupadas
 */
export function getSymbolPositions(board, symbol) {
  return board
    .map((cell, index) => (cell === symbol ? index : -1))
    .filter(index => index !== -1);
}

/**
 * Verificar si una posición está en el borde del tablero
 * @param {number} position - Posición a verificar
 * @param {number} boardSize - Tamaño del tablero
 * @returns {boolean} Verdadero si la posición está en el borde
 */
export function isEdgePosition(position, boardSize) {
  const row = Math.floor(position / boardSize);
  const col = position % boardSize;

  return (
    row === 0 || row === boardSize - 1 || col === 0 || col === boardSize - 1
  );
}

/**
 * Verificar si una posición está en el centro del tablero
 * @param {number} position - Posición a verificar
 * @param {number} boardSize - Tamaño del tablero
 * @returns {boolean} Verdadero si la posición está en el centro
 */
export function isCenterPosition(position, boardSize) {
  const center = Math.floor(boardSize / 2);
  const row = Math.floor(position / boardSize);
  const col = position % boardSize;

  return row === center && col === center;
}

/**
 * Obtener posiciones adyacentes
 * @param {number} position - Posición a verificar
 * @param {number} boardSize - Tamaño del tablero
 * @returns {Array} Array de posiciones adyacentes
 */
export function getAdjacentPositions(position, boardSize) {
  const row = Math.floor(position / boardSize);
  const col = position % boardSize;
  const adjacent = [];

  // Verificar todas las 8 direcciones
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (
      newRow >= 0 &&
      newRow < boardSize &&
      newCol >= 0 &&
      newCol < boardSize
    ) {
      adjacent.push(newRow * boardSize + newCol);
    }
  }

  return adjacent;
}

/**
 * Obtener posiciones en una fila específica
 * @param {number} row - Número de fila
 * @param {number} boardSize - Tamaño del tablero
 * @returns {Array} Array de posiciones en la fila
 */
export function getRowPositions(row, boardSize) {
  const positions = [];
  for (let col = 0; col < boardSize; col++) {
    positions.push(row * boardSize + col);
  }
  return positions;
}

/**
 * Obtener posiciones en una columna específica
 * @param {number} col - Número de columna
 * @param {number} boardSize - Tamaño del tablero
 * @returns {Array} Array de posiciones en la columna
 */
export function getColumnPositions(col, boardSize) {
  const positions = [];
  for (let row = 0; row < boardSize; row++) {
    positions.push(row * boardSize + col);
  }
  return positions;
}

/**
 * Obtener posiciones diagonales (diagonal principal)
 * @param {number} boardSize - Tamaño del tablero
 * @returns {Array} Array de posiciones en la diagonal principal
 */
export function getMainDiagonalPositions(boardSize) {
  const positions = [];
  for (let i = 0; i < boardSize; i++) {
    positions.push(i * boardSize + i);
  }
  return positions;
}

/**
 * Obtener posiciones anti-diagonales
 * @param {number} boardSize - Tamaño del tablero
 * @returns {Array} Array de posiciones en la anti-diagonal
 */
export function getAntiDiagonalPositions(boardSize) {
  const positions = [];
  for (let i = 0; i < boardSize; i++) {
    positions.push(i * boardSize + (boardSize - 1 - i));
  }
  return positions;
}

/**
 * Convertir posición a coordenadas de fila/columna
 * @param {number} position - Posición en el tablero
 * @param {number} boardSize - Tamaño del tablero
 * @returns {Object} Coordenadas de fila y columna
 */
export function positionToCoordinates(position, boardSize) {
  return {
    row: Math.floor(position / boardSize),
    col: position % boardSize,
  };
}

/**
 * Convertir coordenadas de fila/columna a posición
 * @param {number} row - Número de fila
 * @param {number} col - Número de columna
 * @param {number} boardSize - Tamaño del tablero
 * @returns {number} Posición en el tablero
 */
export function coordinatesToPosition(row, col, boardSize) {
  return row * boardSize + col;
}
