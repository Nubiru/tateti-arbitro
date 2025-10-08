/**
 * Adaptador HTTP para Comunicación con Jugadores
 * Encapsula la lógica de comunicación HTTP con axios para inyección de dependencias
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import axios from 'axios';

/**
 * Función pura para construir URL para solicitud del jugador
 * @param {Object} player - Objeto jugador
 * @param {string} endpoint - Punto final de la API
 * @returns {string} URL completa
 */
export function buildUrl(player, endpoint) {
  const protocol = player.protocol || 'http';
  const host = player.host || 'localhost';
  const port = player.port;
  return `${protocol}://${host}:${port}${endpoint}`;
}

/**
 * Función pura para construir datos de solicitud
 * @param {Array} board - Tablero de juego
 * @param {string} symbol - Símbolo del jugador
 * @param {Object} options - Opciones de solicitud
 * @returns {Object} Datos de solicitud
 */
export function buildRequestData(board, symbol, options = {}) {
  return {
    board: board,
    symbol: symbol,
    timeout: options.timeoutMs || 30000,
  };
}

/**
 * Función pura para analizar respuesta de movimiento del jugador
 * @param {Object} response - Respuesta de Axios
 * @returns {number} Movimiento analizado
 */
export function parseMoveResponse(response) {
  if (!response || !response.data) {
    throw new Error('Respuesta inválida del jugador');
  }

  const data = response.data;
  let move;

  // Intentar diferentes formatos de respuesta
  if (data.move !== undefined) {
    move = data.move;
  } else if (data.movimiento !== undefined) {
    move = data.movimiento;
  } else if (data.data && data.data.move !== undefined) {
    move = data.data.move;
  } else if (data.data && data.data.movimiento !== undefined) {
    move = data.data.movimiento;
  } else {
    throw new Error('Respuesta inválida del jugador');
  }

  // Convertir a número
  const numericMove = Number(move);
  if (isNaN(numericMove)) {
    throw new Error('El movimiento debe ser un número');
  }

  return numericMove;
}

/**
 * Función pura para validar movimiento
 * @param {number} move - Posición del movimiento
 * @param {number} boardSize - Tamaño del tablero
 * @throws {Error} Si el movimiento es inválido
 */
export function validateMove(move, boardSize) {
  if (move < 0 || move >= boardSize * boardSize) {
    throw new Error('Movimiento fuera de rango');
  }
}

/**
 * Función pura para manejar errores HTTP
 * @param {Error} error - Objeto de error
 * @throws {Error} Error formateado
 */
export function handleError(error) {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || 'Unknown error';
    throw new Error(`Error del servidor del jugador: ${status} - ${message}`);
  } else if (error.code === 'ECONNREFUSED') {
    throw new Error(`No fue posible contactar al jugador: ${error.message}`);
  } else if (error.code === 'ECONNABORTED') {
    throw new Error(
      `El jugador tardó demasiado en responder: ${error.message}`
    );
  } else {
    throw new Error(`Error desconocido: ${error.message}`);
  }
}

/**
 * Función pura para extraer movimiento de datos de respuesta
 * @param {Object} responseData - Objeto de datos de respuesta
 * @returns {Object} Resultado con movimiento o error
 */
export function extractMoveFromResponse(responseData) {
  let move;

  // Intentar diferentes formatos de respuesta
  if (responseData.move !== undefined) {
    move = responseData.move;
  } else if (responseData.movimiento !== undefined) {
    move = responseData.movimiento;
  } else if (responseData.data && responseData.data.move !== undefined) {
    move = responseData.data.move;
  } else if (responseData.data && responseData.data.movimiento !== undefined) {
    move = responseData.data.movimiento;
  } else {
    return { error: 'No fue posible contactar al jugador.' };
  }

  // Convertir movimientos de cadena a números
  const moveNumber = typeof move === 'string' ? parseInt(move, 10) : move;

  if (isNaN(moveNumber)) {
    return { error: 'Movimiento inválido recibido del jugador' };
  }

  return { move: moveNumber };
}

/**
 * Función pura para manejar errores de solicitud
 * @param {Error} error - Objeto de error
 * @returns {Object} Resultado de error
 */
export function handleRequestError(error) {
  if (error.code === 'ECONNABORTED') {
    return { error: 'Tiempo de espera agotado' };
  } else if (error.response) {
    return { error: `Respuesta ${error.response.status}` };
  } else if (error.code === 'ECONNREFUSED') {
    return { error: 'No fue posible contactar al jugador.' };
  } else {
    return { error: 'No fue posible contactar al jugador.' };
  }
}

/**
 * Adaptador HTTP para comunicación con jugadores
 * @lastModified 2025-10-03
 * @version 1.0.0
 */
export class HttpAdapter {
  constructor({ logger }) {
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.logger = logger;
  }

  /**
   * Construir URL para solicitud del jugador
   * @param {Object} player - Objeto jugador
   * @param {string} endpoint - Punto final de la API
   * @returns {string} URL completa
   */
  buildUrl(player, endpoint) {
    return buildUrl(player, endpoint);
  }

  /**
   * Construir datos de solicitud
   * @param {Array} board - Tablero de juego
   * @param {string} symbol - Símbolo del jugador
   * @param {Object} options - Opciones de solicitud
   * @returns {Object} Datos de solicitud
   */
  buildRequestData(board, symbol, options = {}) {
    return buildRequestData(board, symbol, options);
  }

  /**
   * Analizar respuesta de movimiento del jugador
   * @param {Object} response - Respuesta de Axios
   * @returns {number} Movimiento analizado
   */
  parseMoveResponse(response) {
    return parseMoveResponse(response);
  }

  /**
   * Validar movimiento
   * @param {number} move - Posición del movimiento
   * @param {number} boardSize - Tamaño del tablero
   * @throws {Error} Si el movimiento es inválido
   */
  validateMove(move, boardSize) {
    return validateMove(move, boardSize);
  }

  /**
   * Manejar errores HTTP
   * @param {Error} error - Objeto de error
   * @throws {Error} Error formateado
   */
  handleError(error) {
    return handleError(error);
  }

  /**
   * Solicitar un movimiento de un jugador
   * @param {Object} player - Objeto jugador con nombre, puerto, host, protocolo
   * @param {string} endpoint - Punto final de la API
   * @param {Object} options - Opciones de solicitud
   * @returns {Promise<Object>} Respuesta del jugador
   */
  async requestMove(player, endpoint, options) {
    try {
      const url = buildUrl(player, endpoint);

      this.logger.debug(
        'HTTP',
        'REQUEST',
        'MOVE',
        'Solicitando movimiento del jugador',
        {
          player: player.name,
          url,
          options,
        }
      );

      const response = await axios.get(url, {
        params: options.params,
        timeout: options.timeoutMs,
      });

      // Extraer movimiento de la respuesta usando función pura
      const result = extractMoveFromResponse(response.data);

      if (result.error) {
        return result;
      }

      // Validar movimiento contra el tamaño del tablero si se proporciona
      if (options.boardSize) {
        validateMove(result.move, options.boardSize);
      }

      return result;
    } catch (error) {
      this.logger.error('HTTP', 'REQUEST', 'FAILED', 'Solicitud HTTP falló', {
        player: player.name,
        error: error.message,
      });

      return handleRequestError(error);
    }
  }
}

/**
 * Crear instancia del adaptador HTTP
 * @param {Object} dependencies - Dependencias
 * @returns {HttpAdapter} Instancia del adaptador HTTP
 */
export function createHttpAdapter({ logger }) {
  return new HttpAdapter({ logger });
}
