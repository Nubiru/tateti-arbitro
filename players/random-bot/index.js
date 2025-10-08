import express from 'express';

// Simple logger for player bot - forwards to console with structured format
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

/**
 * Random Bot Player for Ta-Te-Ti
 * Implements random move strategy
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const app = express();
const PORT = process.env.PORT || 3001;
const PLAYER_NAME = process.env.PLAYER_NAME || 'RandomBot';

app.use(express.json());

/**
 * Generate a random move on the board
 * @param {Array} board - Current board state (0=empty, 1=player1, 2=player2)
 * @param {number} playerId - This player's ID
 * @returns {number} Move position (0-8 for 3x3, 0-24 for 5x5)
 */
function getRandomMove(board) {
  const emptyCells = board
    .map((cell, index) => (cell === 0 ? index : null))
    .filter((index) => index !== null);

  if (emptyCells.length === 0) {
    return 0; // Fallback if no empty cells
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
}

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
 * Move endpoint - receives board state and returns move
 */
app.get('/move', (req, res) => {
  try {
    const { tablero, jugador } = req.query;

    if (!tablero || !jugador) {
      return res.status(400).json({
        error: 'Se requieren parámetros tablero y jugador'
      });
    }

    const board = JSON.parse(tablero);
    const playerId = parseInt(jugador);

    if (!Array.isArray(board)) {
      return res.status(400).json({
        error: 'El tablero debe ser un array'
      });
    }

    const move = getRandomMove(board, playerId);

    logger.info(`${PLAYER_NAME}: Movimiento ${move} en tablero:`, board);

    res.json({
      movimiento: move,
      jugador: playerId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`${PLAYER_NAME}: Error procesando movimiento:`, error);
    res.status(500).json({
      error: 'Error interno del jugador'
    });
  }
});

/**
 * Player info endpoint
 */
app.get('/info', (req, res) => {
  res.json({
    nombre: PLAYER_NAME,
    estrategia: 'Aleatoria',
    version: '1.0.0',
    puerto: PORT
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`${PLAYER_NAME} escuchando en puerto ${PORT}`);
});
