/**
 * Game Helper Functions - Pure Functions
 * Utility functions for game logic
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

/**
 * Get delay in milliseconds for given speed setting
 * @param {string} speed - 'slow', 'normal', 'fast', or undefined
 * @returns {number} Delay in milliseconds
 */
export function getDelayForSpeed(speed) {
  const delays = {
    slow: 2000,
    normal: 1000,
    fast: 200,
  };
  return delays[speed] || 1000; // Default to normal speed
}

/**
 * Validate move request
 * @param {string} matchId - Match ID
 * @param {number} position - Board position (0-8 for 3x3, 0-24 for 5x5)
 * @param {number} boardSize - Board size (9 or 25)
 * @throws {Error} If validation fails
 */
export function validateMoveRequest(matchId, position, boardSize = 9) {
  if (!matchId) {
    throw new Error('No active match found');
  }

  if (typeof position !== 'number') {
    throw new Error('Invalid position: must be a number');
  }

  if (position < 0 || position >= boardSize) {
    throw new Error(`Invalid position: must be between 0 and ${boardSize - 1}`);
  }
}

/**
 * Create move queue item from SSE data
 * @param {Object} data - Move data from SSE event
 * @returns {Object} Move queue item
 */
export function createMoveQueueItem(data) {
  return {
    type: 'move',
    data: data,
    timestamp: Date.now(),
  };
}

/**
 * Determine player ID based on move count
 * @param {number} moveCount - Current move count
 * @returns {string} 'player1' or 'player2'
 */
export function getPlayerIdForTurn(moveCount) {
  return moveCount % 2 === 0 ? 'player1' : 'player2';
}

/**
 * Format game configuration with defaults
 * @param {Object} options - Game options
 * @returns {Object} Formatted config with defaults
 */
export function formatGameConfig(options = {}) {
  return {
    speed: options.speed || 'normal',
    boardSize: options.boardSize || '3x3',
    noTie: options.noTie || false,
  };
}
