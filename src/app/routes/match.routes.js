import express from 'express';
import logger from '../logger.js';

const router = express.Router();

/**
 * Rutas de partidas
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

router.post('/', async (req, res) => {
  try {
    const { player1, player2, timeoutMs, noTie, boardSize } = req.body;
    const arbitrator = req.app.locals.arbitrator;

    if (!arbitrator) {
      logger.error('MATCH', 'ROUTE', 'NO_ARBITRATOR', 'Árbitro no disponible');
      return res.status(500).json({ error: 'Servicio no disponible' });
    }

    // Normalizar jugadores para el árbitro
    const players = [
      {
        name: player1.name,
        port: player1.port,
        host: 'localhost',
        protocol: 'http',
      },
      {
        name: player2.name,
        port: player2.port,
        host: 'localhost',
        protocol: 'http',
      },
    ];

    const result = await arbitrator.runMatch(players, {
      timeoutMs: timeoutMs || 3000,
      noTie: noTie || false,
      boardSize: boardSize || '3x3',
    });

    res.json(result);
  } catch (error) {
    logger.error('MATCH', 'ROUTE', 'ERROR', 'Error en ruta de partida', {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
