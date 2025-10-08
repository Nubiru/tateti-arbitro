import { createArbitratorCoordinator } from '../../domain/game/arbitrator.di.js';
import { logger } from '../logger.js';

/**
 * Controlador para operaciones relacionadas con partidas
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

// Funciones de validación de entrada
function validatePlayer(player, playerName) {
  const errors = [];

  if (!player) {
    errors.push(`${playerName} es requerido`);
    return errors;
  }

  if (typeof player !== 'object') {
    errors.push(`${playerName} debe ser un objeto`);
    return errors;
  }

  if (!player.name || typeof player.name !== 'string') {
    errors.push(`${playerName}.name es requerido y debe ser una cadena`);
  } else if (player.name.length > 50) {
    errors.push(`${playerName}.name no puede exceder 50 caracteres`);
  }

  if (!player.port || typeof player.port !== 'number') {
    errors.push(`${playerName}.port es requerido y debe ser un número`);
  } else if (player.port < 1 || player.port > 65535) {
    errors.push(`${playerName}.port debe estar entre 1 y 65535`);
  }

  if (player.host && typeof player.host !== 'string') {
    errors.push(`${playerName}.host debe ser una cadena`);
  }

  if (player.protocol && !['http', 'https'].includes(player.protocol)) {
    errors.push(`${playerName}.protocol debe ser 'http' o 'https'`);
  }

  return errors;
}

function validateTimeout(timeoutMs) {
  if (timeoutMs !== undefined) {
    if (typeof timeoutMs !== 'number') {
      return 'timeoutMs debe ser un número';
    }
    if (timeoutMs < 100 || timeoutMs > 30000) {
      return 'timeoutMs debe estar entre 100 y 30000 milisegundos';
    }
  }
  return null;
}

async function createMatch(req, res) {
  const { player1, player2, timeoutMs, boardSize, noTie, speed } =
    req.body || {};

  // Validar campos requeridos
  if (!player1 || !player2) {
    return res
      .status(400)
      .json({ error: 'Se necesitan dos jugadores para iniciar la partida.' });
  }

  // Validar jugadores
  const player1Errors = validatePlayer(player1, 'player1');
  const player2Errors = validatePlayer(player2, 'player2');
  const timeoutError = validateTimeout(timeoutMs);

  const allErrors = [...player1Errors, ...player2Errors];
  if (timeoutError) allErrors.push(timeoutError);

  if (allErrors.length > 0) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: allErrors,
    });
  }

  // Sanitizar entradas
  const sanitizedPlayer1 = {
    name: player1.name.trim().substring(0, 50),
    port: Math.floor(player1.port),
    host: player1.host ? player1.host.trim() : 'localhost',
    protocol: player1.protocol || 'http',
  };

  const sanitizedPlayer2 = {
    name: player2.name.trim().substring(0, 50),
    port: Math.floor(player2.port),
    host: player2.host ? player2.host.trim() : 'localhost',
    protocol: player2.protocol || 'http',
  };

  const sanitizedTimeout = timeoutMs ? Math.floor(timeoutMs) : 3000;

  try {
    const arbitrator = createArbitratorCoordinator();
    const result = await arbitrator.runMatch(
      [sanitizedPlayer1, sanitizedPlayer2],
      {
        timeoutMs: sanitizedTimeout,
        boardSize: boardSize || '3x3',
        noTie: noTie || false,
        speed: speed || 'normal',
      }
    );
    return res.json(result);
  } catch (error) {
    logger.error(
      'MATCH',
      'CONTROLLER',
      'CREATE_ERROR',
      'Error en createMatch',
      {
        error: error.message,
        stack: error.stack,
      }
    );
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message,
    });
  }
}

export { createMatch };
