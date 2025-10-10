/**
 * Strategic Bot Algorithm
 * Turn-based positional strategy with tactical decisions
 * Board-size aware: 3x3 and 5x5
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

// Win combinations for 3x3
const COMBINACIONES_GANADOR_3X3 = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // Filas
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // Columnas
  [0, 4, 8],
  [2, 4, 6] // Diagonales
];

// Win combinations for 5x5
const COMBINACIONES_GANADOR_5X5 = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20]
];

/**
 * Detect symbol based on empty positions
 */
export function detectMySymbol(board, emptyPositions) {
  const vacias = emptyPositions.length;
  return vacias % 2 === 1 ? 1 : 2; // X or O
}

/**
 * Check if player has won
 */
export function checkWin(board, symbol) {
  const boardSize = board.length === 9 ? 3 : 5;
  const combinations =
    boardSize === 3 ? COMBINACIONES_GANADOR_3X3 : COMBINACIONES_GANADOR_5X5;

  return combinations.some((combinacion) =>
    combinacion.every((posicion) => board[posicion] === symbol)
  );
}

/**
 * Find winning move for symbol
 */
export function findWinningMove(board, emptyPositions, symbol) {
  for (const posicion of emptyPositions) {
    const tableroPrueba = [...board];
    tableroPrueba[posicion] = symbol;
    if (checkWin(tableroPrueba, symbol)) {
      return posicion;
    }
  }
  return null;
}

/**
 * Find blocking move against opponent
 */
export function findBlockingMove(board, emptyPositions, mySymbol, opponentSymbol) {
  for (const posicion of emptyPositions) {
    const tableroPrueba = [...board];
    tableroPrueba[posicion] = opponentSymbol;
    if (checkWin(tableroPrueba, opponentSymbol)) {
      return posicion;
    }
  }
  return null;
}

/**
 * Positional strategy: center, corners, edges
 */
export function estrategiaPosicional(posicionesVacias, boardSize) {
  const centro = boardSize === 3 ? 4 : 12;
  if (posicionesVacias.includes(centro)) {
    return centro;
  }

  const esquinas = boardSize === 3 ? [0, 2, 6, 8] : [0, 4, 20, 24];
  for (const esquina of esquinas) {
    if (posicionesVacias.includes(esquina)) {
      return esquina;
    }
  }

  const bordes =
    boardSize === 3
      ? [1, 3, 5, 7]
      : [1, 2, 3, 5, 9, 10, 14, 15, 19, 21, 22, 23];
  for (const borde of bordes) {
    if (posicionesVacias.includes(borde)) {
      return borde;
    }
  }

  return posicionesVacias[0];
}

/**
 * Main strategic algorithm with turn-based decisions
 */
export function getStrategicMove(board) {
  const emptyPositions = board
    .map((cell, index) => (cell === 0 ? index : null))
    .filter((index) => index !== null);

  if (emptyPositions.length === 0) {
    return 0; // Fallback
  }

  const boardSize = board.length === 9 ? 3 : 5;
  const vacias = emptyPositions.length;
  const maxPositions = boardSize === 3 ? 9 : 25;
  const somosX = vacias % 2 === 1;
  const miSimbolo = somosX ? 1 : 2;
  const simboloOponente = somosX ? 2 : 1;
  const posicionesVacias = emptyPositions;

  // Move 1: Take center
  if (vacias === maxPositions) {
    return boardSize === 3 ? 4 : 12;
  }

  // Move 2: Take center or corner
  if (vacias === maxPositions - 1) {
    const centro = boardSize === 3 ? 4 : 12;
    if (posicionesVacias.includes(centro)) {
      return centro;
    }
    const esquinas = boardSize === 3 ? [0, 2, 6, 8] : [0, 4, 20, 24];
    for (const esquina of esquinas) {
      if (posicionesVacias.includes(esquina)) {
        return esquina;
      }
    }
  }

  // Move 3+: Strategic decisions
  if (vacias <= maxPositions - 2) {
    // Priority 1: Try to win
    const movimientoGanador = findWinningMove(
      board,
      posicionesVacias,
      miSimbolo
    );
    if (movimientoGanador !== null) {
      return movimientoGanador;
    }

    // Priority 2: Block opponent
    const movimientoBloqueo = findBlockingMove(
      board,
      posicionesVacias,
      miSimbolo,
      simboloOponente
    );
    if (movimientoBloqueo !== null) {
      return movimientoBloqueo;
    }

    // Priority 3: Positional strategy
    return estrategiaPosicional(posicionesVacias, boardSize);
  }

  return posicionesVacias[0];
}

export default getStrategicMove;

