import { body, param, validationResult } from 'express-validator';

/**
 * Middleware de validación para validación de solicitudes
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

// Reglas de validación de partidas
export const validateMatch = [
  body('player1').custom(value => {
    if (!value) {
      throw new Error('Se necesitan dos jugadores para iniciar la partida.');
    }
    if (typeof value !== 'object') {
      throw new Error('player1 debe ser un objeto');
    }
    if (!value.name || (!value.port && !value.url)) {
      throw new Error('player1 debe tener name y (port o url)');
    }
    return true;
  }),
  body('player1.name')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('player1.name debe ser una cadena de 1-50 caracteres')
    .custom(value => {
      // Verificar intentos de XSS
      if (/<script|javascript:|on\w+\s*=/i.test(value)) {
        throw new Error('player1.name contiene caracteres no permitidos');
      }
      return true;
    }),
  body('player1.port')
    .optional()
    .isInt({ min: 3000, max: 9999 })
    .withMessage('player1.port debe ser un número entre 3000-9999'),
  body('player1.url')
    .optional()
    .isURL()
    .withMessage('player1.url debe ser una URL válida'),
  body('player2').custom(value => {
    if (!value) {
      throw new Error('Se necesitan dos jugadores para iniciar la partida.');
    }
    if (typeof value !== 'object') {
      throw new Error('player2 debe ser un objeto');
    }
    if (!value.name || (!value.port && !value.url)) {
      throw new Error('player2 debe tener name y (port o url)');
    }
    return true;
  }),
  body('player2.name')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('player2.name debe ser una cadena de 1-50 caracteres')
    .custom(value => {
      // Verificar intentos de XSS
      if (/<script|javascript:|on\w+\s*=/i.test(value)) {
        throw new Error('player2.name contiene caracteres no permitidos');
      }
      return true;
    }),
  body('player2.port')
    .optional()
    .isInt({ min: 3000, max: 9999 })
    .withMessage('player2.port debe ser un número entre 3000-9999'),
  body('player2.url')
    .optional()
    .isURL()
    .withMessage('player2.url debe ser una URL válida'),
  body('boardSize')
    .optional()
    .isIn(['3x3', '5x5'])
    .withMessage('boardSize debe ser 3x3 o 5x5'),
  body('noTie')
    .optional()
    .isBoolean()
    .withMessage('noTie debe ser un booleano'),
  body('speed')
    .optional()
    .isIn(['slow', 'normal', 'fast'])
    .withMessage('speed debe ser slow, normal o fast'),
];

// Reglas de validación de torneos
export const validateTournament = [
  body('players')
    .isArray({ min: 2, max: 12 })
    .withMessage('players debe ser un array de 2-12 jugadores'),
  body('players.*.name')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cada jugador debe tener un name de 1-50 caracteres'),
  body('players.*.port')
    .isInt({ min: 3000, max: 9999 })
    .withMessage('Cada jugador debe tener un port entre 3000-9999'),
  body('boardSize')
    .optional()
    .isIn(['3x3', '5x5'])
    .withMessage('boardSize debe ser 3x3 o 5x5'),
  body('noTie')
    .optional()
    .isBoolean()
    .withMessage('noTie debe ser un booleano'),
  body('speed')
    .optional()
    .isIn(['slow', 'normal', 'fast'])
    .withMessage('speed debe ser slow, normal o fast'),
];

// Reglas de validación de configuración de torneo (nuevo formato)
export const validateTournamentConfig = [
  body('totalPlayers')
    .isInt({ min: 2, max: 12 })
    .withMessage('totalPlayers debe ser un número entero entre 2-12'),
  body('includeRandom')
    .optional()
    .isBoolean()
    .withMessage('includeRandom debe ser un booleano'),
  body('humanName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 32 })
    .withMessage('humanName debe ser una cadena de 1-32 caracteres')
    .custom(value => {
      if (value && /<script|javascript:|on\w+\s*=/i.test(value)) {
        throw new Error('humanName contiene caracteres no permitidos');
      }
      return true;
    }),
  body('boardSize')
    .optional()
    .isIn(['3x3', '5x5'])
    .withMessage('boardSize debe ser 3x3 o 5x5'),
  body('noTie')
    .optional()
    .isBoolean()
    .withMessage('noTie debe ser un booleano'),
  body('speed')
    .optional()
    .isIn(['slow', 'normal', 'fast'])
    .withMessage('speed debe ser slow, normal o fast'),
];

// Validación de verificación de salud
export const validateHealth = [
  param('service')
    .optional()
    .isIn(['arbitrator', 'player', 'all'])
    .withMessage('service debe ser arbitrator, player o all'),
];

// Middleware de manejo de errores
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (process.env.NODE_ENV !== 'test') {
      console.log('❌ VALIDATION FAILED ━━━━━━━━━━━━━━━━━━━━');
      console.log('📍 Endpoint:', req.method, req.path);
      console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
      console.log(
        '❌ Validation errors:',
        JSON.stringify(errors.array(), null, 2)
      );
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    // Store validation errors in request for debugging
    req.validationErrors = errors.array();

    // Verificar si es un error de jugador faltante
    const missingPlayerError = errors
      .array()
      .find(
        error =>
          error.msg === 'Se necesitan dos jugadores para iniciar la partida.'
      );

    if (missingPlayerError) {
      return res.status(400).json({
        error: 'Se necesitan dos jugadores para iniciar la partida.',
        details: errors.array(),
      });
    }

    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors.array(),
    });
  }
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ Validation passed for:', req.method, req.path);
  }
  next();
};

// Middleware de sanitización
export const sanitizeInput = (req, res, next) => {
  // Eliminar cualquier intento potencial de XSS
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Función auxiliar para sanitizar objetos recursivamente
const sanitizeObject = obj => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return obj.trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    Object.keys(obj).forEach(key => {
      sanitized[key] = sanitizeObject(obj[key]);
    });
    return sanitized;
  }

  return obj;
};

// Reglas de validación para movimientos de jugadores humanos
export const validateMove = [
  param('matchId')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('matchId debe ser una cadena de 1-50 caracteres'),
  body('player')
    .isIn(['player1', 'player2'])
    .withMessage('player debe ser player1 o player2'),
  body('position')
    .isInt({ min: 0, max: 24 })
    .withMessage('position debe ser un número entre 0-24'),
];
