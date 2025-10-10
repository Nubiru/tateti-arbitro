/**
 * Smart Bot Algorithm
 * Strategy: WIN → BLOCK → CENTER → CORNERS → ANY
 * Board-size aware: 3x3 (9 cells) and 5x5 (25 cells)
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

// Win patterns for 3x3
const WIN_PATTERNS_3X3 = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6] // diagonals
];

// Win patterns for 5x5
const WIN_PATTERNS_5X5 = [
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
 * Detect symbol based on empty positions count
 * X plays on odd empty counts (9,7,5,3,1)
 * O plays on even empty counts (8,6,4,2,0)
 */
export function detectMySymbol(board, emptyPositions) {
  const emptyCount = emptyPositions.length;
  return emptyCount % 2 === 1 ? 1 : 2; // X = 1, O = 2
}

/**
 * Check if a player has won
 */
export function checkWin(board, symbol) {
  const boardSize = board.length === 9 ? 3 : 5;
  const patterns = boardSize === 3 ? WIN_PATTERNS_3X3 : WIN_PATTERNS_5X5;

  return patterns.some((pattern) =>
    pattern.every((pos) => board[pos] === symbol)
  );
}

/**
 * Find a move that results in immediate win
 */
export function findWinningMove(board, emptyPositions, symbol) {
  for (const pos of emptyPositions) {
    const testBoard = [...board];
    testBoard[pos] = symbol;
    if (checkWin(testBoard, symbol)) {
      return pos;
    }
  }
  return null;
}

/**
 * Main smart bot algorithm
 * Priority: WIN → BLOCK → CENTER → CORNERS → ANY
 */
export function getSmartMove(board) {
  const emptyPositions = board
    .map((cell, index) => (cell === 0 ? index : null))
    .filter((index) => index !== null);

  if (emptyPositions.length === 0) {
    return 0; // Fallback
  }

  const boardSize = board.length === 9 ? 3 : 5;
  const mySymbol = detectMySymbol(board, emptyPositions);
  const opponentSymbol = mySymbol === 1 ? 2 : 1;

  // 1. Try to WIN
  const winMove = findWinningMove(board, emptyPositions, mySymbol);
  if (winMove !== null) return winMove;

  // 2. BLOCK opponent
  const blockMove = findWinningMove(board, emptyPositions, opponentSymbol);
  if (blockMove !== null) return blockMove;

  // 3. Take CENTER
  const center = boardSize === 3 ? 4 : 12;
  if (emptyPositions.includes(center)) return center;

  // 4. Take CORNERS (board-size aware)
  const corners = boardSize === 3 ? [0, 2, 6, 8] : [0, 4, 20, 24];
  for (const corner of corners) {
    if (emptyPositions.includes(corner)) return corner;
  }

  // 5. Take ANY available position
  return emptyPositions[0];
}

export default getSmartMove;

