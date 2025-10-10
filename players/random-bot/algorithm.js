/**
 * Random Bot Algorithm
 * Pure function - no server, no side effects
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

/**
 * Generate a random move on the board
 * @param {Array} board - Current board state (0=empty, 1=player1, 2=player2)
 * @returns {number} Move position (0-8 for 3x3, 0-24 for 5x5)
 */
export function getRandomMove(board) {
  const emptyCells = board
    .map((cell, index) => (cell === 0 ? index : null))
    .filter((index) => index !== null);

  if (emptyCells.length === 0) {
    return 0; // Fallback if no empty cells
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}

export default getRandomMove;

