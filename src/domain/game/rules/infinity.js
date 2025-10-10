/**
 * Infinity Mode Rule - Rolling Window Mechanic
 * Each player can only have 3 marks on board at any time.
 * When 6th move is played, oldest move is removed.
 *
 * Inspired by "Tic Tac Infinity" variant that prevents draws
 * by automatically removing the oldest mark when board reaches 6 pieces.
 *
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

/**
 * Threshold for infinity mode - when to start removing moves
 * Each player can have maximum 3 marks (6 total on board)
 * @constant {number}
 */
export const INFINITY_THRESHOLD = 6;

/**
 * Determines if the oldest move should be removed
 * @param {Array} moveHistory - Array of move history objects
 * @returns {boolean} True if moveHistory length >= INFINITY_THRESHOLD
 */
export function shouldRemoveOldestMove(moveHistory) {
  if (!moveHistory || !Array.isArray(moveHistory)) return false;
  return moveHistory.length >= INFINITY_THRESHOLD;
}

/**
 * Gets the position of the oldest move to be removed
 * @param {Array} moveHistory - Array of move history objects with 'move' property
 * @returns {number|null} Position to remove, or null if no removal needed
 */
export function getRemovalPosition(moveHistory) {
  if (!shouldRemoveOldestMove(moveHistory)) return null;
  if (!moveHistory[0] || typeof moveHistory[0].move !== 'number') return null;
  return moveHistory[0].move;
}

/**
 * Gets the player information for the move being removed
 * @param {Array} moveHistory - Array of move history objects with 'playerId' property
 * @param {Array} players - Array of player objects with 'id' and 'name' properties
 * @returns {Object|null} Player object with id and name, or null if no removal needed
 */
export function getRemovalPlayer(moveHistory, players) {
  if (!shouldRemoveOldestMove(moveHistory)) return null;
  if (!moveHistory[0] || !moveHistory[0].playerId) return null;
  if (!Array.isArray(players) || players.length < 2) return null;

  const oldest = moveHistory[0];
  return {
    id: oldest.playerId,
    name: oldest.playerId === players[0].id ? players[0].name : players[1].name,
  };
}
