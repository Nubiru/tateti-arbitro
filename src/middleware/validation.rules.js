/**
 * Reglas de validación puras para validación de solicitudes
 * @lastModified 2025-01-27
 * @version 1.1.0
 */

/**
 * Validar estructura del objeto jugador
 * @param {Object} player - Objeto jugador a validar
 * @param {string} playerName - Nombre del campo jugador (ej., 'player1')
 * @returns {Object} Resultado de validación con isValid y mensaje de error
 */
export function validatePlayerShape(player, playerName) {
  if (!player) {
    return {
      isValid: false,
      error: 'Se necesitan dos jugadores para iniciar la partida.',
    };
  }

  if (typeof player !== 'object') {
    return {
      isValid: false,
      error: `${playerName} debe ser un objeto`,
    };
  }

  if (!player.name || (!player.port && !player.url)) {
    return {
      isValid: false,
      error: `${playerName} debe tener name y (port o url)`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validar nombre del jugador para XSS y longitud
 * @param {string} name - Nombre del jugador a validar
 * @param {string} playerName - Nombre del campo jugador (ej., 'player1')
 * @returns {Object} Resultado de validación con isValid y mensaje de error
 */
export function validatePlayerName(name, playerName) {
  if (typeof name !== 'string') {
    return {
      isValid: false,
      error: `${playerName}.name debe ser una cadena de 1-50 caracteres`,
    };
  }

  if (name.length < 1 || name.length > 50) {
    return {
      isValid: false,
      error: `${playerName}.name debe ser una cadena de 1-50 caracteres`,
    };
  }

  // Verificar intentos de XSS
  if (/<script|javascript:|on\w+\s*=/i.test(name)) {
    return {
      isValid: false,
      error: `${playerName}.name contiene caracteres no permitidos`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validar número de puerto del jugador
 * @param {number} port - Número de puerto a validar
 * @param {string} playerName - Nombre del campo jugador (ej., 'player1')
 * @returns {Object} Resultado de validación con isValid y mensaje de error
 */
export function validatePlayerPort(port, playerName) {
  if (typeof port !== 'number' || !Number.isInteger(port)) {
    return {
      isValid: false,
      error: `${playerName}.port debe ser un número entre 3000-9999`,
    };
  }

  if (port < 3000 || port > 9999) {
    return {
      isValid: false,
      error: `${playerName}.port debe ser un número entre 3000-9999`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validar tamaño del tablero
 * @param {string} boardSize - Tamaño del tablero a validar
 * @returns {Object} Resultado de validación con isValid y mensaje de error
 */
export function validateBoardSize(boardSize) {
  if (boardSize === undefined || boardSize === null) {
    return { isValid: true, error: null }; // Campo opcional
  }

  if (!['3x3', '5x5'].includes(boardSize)) {
    return {
      isValid: false,
      error: 'boardSize debe ser 3x3 o 5x5',
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validar booleano noTie
 * @param {boolean} noTie - Valor noTie a validar
 * @returns {Object} Resultado de validación con isValid y mensaje de error
 */
export function validateNoTie(noTie) {
  if (noTie === undefined || noTie === null) {
    return { isValid: true, error: null }; // Campo opcional
  }

  if (typeof noTie !== 'boolean') {
    return {
      isValid: false,
      error: 'noTie debe ser un booleano',
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validar configuración de velocidad
 * @param {string} speed - Valor de velocidad a validar
 * @returns {Object} Resultado de validación con isValid y mensaje de error
 */
export function validateSpeed(speed) {
  if (speed === undefined || speed === null) {
    return { isValid: true, error: null }; // Campo opcional
  }

  if (!['slow', 'normal', 'fast'].includes(speed)) {
    return {
      isValid: false,
      error: 'speed debe ser slow, normal o fast',
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validar array de jugadores para torneo
 * @param {Array} players - Array de jugadores a validar
 * @returns {Object} Resultado de validación con isValid y mensaje de error
 */
export function validatePlayersArray(players) {
  if (!Array.isArray(players)) {
    return {
      isValid: false,
      error: 'players debe ser un array de 2-12 jugadores',
    };
  }

  if (players.length < 2 || players.length > 12) {
    return {
      isValid: false,
      error: 'players debe ser un array de 2-12 jugadores',
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validar conteo total de jugadores para torneo
 * @param {number} totalPlayers - Número total de jugadores
 * @returns {Object} Resultado de validación con isValid y mensaje de error
 */
export function validateTotalPlayers(totalPlayers) {
  if (typeof totalPlayers !== 'number' || !Number.isInteger(totalPlayers)) {
    return {
      isValid: false,
      error: 'totalPlayers debe ser un número entero entre 2-12',
    };
  }

  if (totalPlayers < 2 || totalPlayers > 12) {
    return {
      isValid: false,
      error: 'totalPlayers debe ser un número entero entre 2-12',
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validar booleano includeRandom
 * @param {boolean} includeRandom - Si incluir jugador Random
 * @returns {Object} Resultado de validación con isValid y mensaje de error
 */
export function validateIncludeRandom(includeRandom) {
  if (includeRandom === undefined || includeRandom === null) {
    return { isValid: true, error: null }; // Campo opcional
  }

  if (typeof includeRandom !== 'boolean') {
    return {
      isValid: false,
      error: 'includeRandom debe ser un booleano',
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validar nombre del jugador humano
 * @param {string} humanName - Nombre del jugador humano
 * @returns {Object} Resultado de validación con isValid y mensaje de error
 */
export function validateHumanName(humanName) {
  if (humanName === undefined || humanName === null) {
    return { isValid: true, error: null }; // Campo opcional
  }

  if (typeof humanName !== 'string') {
    return {
      isValid: false,
      error: 'humanName debe ser una cadena de 1-32 caracteres',
    };
  }

  if (humanName.length < 1 || humanName.length > 32) {
    return {
      isValid: false,
      error: 'humanName debe ser una cadena de 1-32 caracteres',
    };
  }

  // Verificar intentos de XSS
  if (/<script|javascript:|on\w+\s*=/i.test(humanName)) {
    return {
      isValid: false,
      error: 'humanName contiene caracteres no permitidos',
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validar parámetro de servicio para verificación de salud
 * @param {string} service - Nombre del servicio a validar
 * @returns {Object} Resultado de validación con isValid y mensaje de error
 */
export function validateService(service) {
  if (service === undefined || service === null) {
    return { isValid: true, error: null }; // Campo opcional
  }

  if (!['arbitrator', 'player', 'all'].includes(service)) {
    return {
      isValid: false,
      error: 'service debe ser arbitrator, player o all',
    };
  }

  return { isValid: true, error: null };
}
