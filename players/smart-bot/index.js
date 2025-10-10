/**
 * Smart Bot Player for Ta-Te-Ti
 * Implements smart strategy: WIN → BLOCK → CENTER → CORNERS → ANY
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import express from 'express';
import getSmartMove from './algorithm.js';

const logger = {
  info: (message, data) => {
    // eslint-disable-next-line no-console
    console.log(`[INFO][${new Date().toISOString()}] ${message}`, data || '');
  },
  error: (message, data) => {
    // eslint-disable-next-line no-console
    console.error(
      `[ERROR][${new Date().toISOString()}] ${message}`,
      data || ''
    );
  }
};

const app = express();
const PORT = process.env.PORT || 3003;
const PLAYER_NAME = process.env.PLAYER_NAME || 'SmartBot';

app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    player: PLAYER_NAME,
    timestamp: new Date().toISOString()
  });
});

/**
 * Move endpoint - receives board state and returns smart move
 */
app.get('/move', (req, res) => {
  try {
    const { board } = req.query;

    if (!board) {
      return res.status(400).json({
        error: 'Missing required parameter: board'
      });
    }

    // Parse board with specific error handling
    let boardArray;
    try {
      boardArray = JSON.parse(board);
    } catch (parseError) {
      return res.status(400).json({
        error: 'Invalid board format: must be valid JSON array'
      });
    }

    if (!Array.isArray(boardArray)) {
      return res.status(400).json({
        error: 'Board must be an array'
      });
    }

    if (boardArray.length !== 9 && boardArray.length !== 25) {
      return res.status(400).json({
        error: 'Board must be 9 (3x3) or 25 (5x5) elements'
      });
    }

    const move = getSmartMove(boardArray);

    logger.info(`${PLAYER_NAME}: Move ${move} on board`, boardArray);

    res.json({ move });
  } catch (error) {
    logger.error(`${PLAYER_NAME}: Error processing move:`, error);
    res.status(500).json({
      error: 'Internal player error'
    });
  }
});

/**
 * Player info endpoint
 */
app.get('/info', (req, res) => {
  res.json({
    name: PLAYER_NAME,
    strategy: 'Smart',
    version: '1.0.0',
    port: PORT
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`${PLAYER_NAME} escuchando en puerto ${PORT}`);
});

// Export app and server for testing
export { app, server };

