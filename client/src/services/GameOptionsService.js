/**
 * Servicio de Opciones de Juego
 * Servicio centralizado para manejar configuración de juego, cálculos de velocidad y gestión de estado
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

class GameOptionsService {
  // Constantes de configuración de velocidad
  static SPEED_DELAYS = {
    slow: 2000,
    normal: 1000,
    fast: 200,
  };

  // Configuración por defecto
  static DEFAULT_CONFIG = {
    boardSize: '3x3',
    speed: 'normal',
    gameMode: 'individual',
    noTie: false,
  };

  // Tamaños de tablero válidos
  static VALID_BOARD_SIZES = ['3x3', '5x5'];

  // Configuraciones de velocidad válidas
  static VALID_SPEEDS = ['slow', 'normal', 'fast'];

  // Modos de juego válidos
  static VALID_GAME_MODES = ['individual', 'tournament'];

  // Mapeo de textos de estado del juego
  static GAME_STATUS_TEXT = {
    playing: 'Partida en Progreso',
    completed: 'Partida Completada',
    waiting: 'Esperando...',
    error: 'Error en la Partida',
  };

  // Configuración de reglas de juego (Patrón Factory)
  static GAME_RULES = {
    infinity: {
      enabled: true,
      boardSizes: [3], // Solo 3x3 por ahora
      description:
        'Sin empates - ventana deslizante elimina el movimiento más antiguo después de 6 movimientos',
    },
    infinity5x5: {
      enabled: false, // Marcador de posición para el futuro
      boardSizes: [5],
      description: 'Modo infinito para tableros 5x5 (NO IMPLEMENTADO)',
    },
  };

  /**
   * Obtener retraso de velocidad en milisegundos
   * @param {string} speed - Configuración de velocidad ('slow', 'normal', 'fast')
   * @returns {number} Retraso en milisegundos
   */
  static getSpeedDelay(speed) {
    if (!speed || typeof speed !== 'string') {
      return this.SPEED_DELAYS.normal;
    }
    return this.SPEED_DELAYS[speed] || this.SPEED_DELAYS.normal;
  }

  /**
   * Validar tamaño de tablero
   * @param {string} boardSize - Tamaño de tablero a validar
   * @returns {boolean} Verdadero si es válido
   */
  static isValidBoardSize(boardSize) {
    return this.VALID_BOARD_SIZES.includes(boardSize);
  }

  /**
   * Validar configuración de velocidad
   * @param {string} speed - Configuración de velocidad a validar
   * @returns {boolean} Verdadero si es válido
   */
  static isValidSpeed(speed) {
    return this.VALID_SPEEDS.includes(speed);
  }

  /**
   * Validar modo de juego
   * @param {string} gameMode - Modo de juego a validar
   * @returns {boolean} Verdadero si es válido
   */
  static isValidGameMode(gameMode) {
    return this.VALID_GAME_MODES.includes(gameMode);
  }

  /**
   * Normalizar configuración con valores por defecto y validación
   * @param {Object} config - Objeto de configuración
   * @returns {Object} Configuración normalizada
   */
  static normalizeConfig(config = {}) {
    return {
      boardSize: this.isValidBoardSize(config.boardSize)
        ? config.boardSize
        : this.DEFAULT_CONFIG.boardSize,
      speed: this.isValidSpeed(config.speed)
        ? config.speed
        : this.DEFAULT_CONFIG.speed,
      gameMode: this.isValidGameMode(config.gameMode)
        ? config.gameMode
        : this.DEFAULT_CONFIG.gameMode,
      noTie:
        config.noTie === true || config.noTie === 'true' || config.noTie === 1,
    };
  }

  /**
   * Verificar si el modo infinito puede ser habilitado para el tamaño de tablero dado
   * @param {number} boardSize - Tamaño de tablero (3 o 5)
   * @returns {boolean} Verdadero si el modo infinito es soportado
   */
  static canEnableInfinity(boardSize) {
    const size =
      typeof boardSize === 'number' ? boardSize : parseInt(boardSize);
    return size === 3; // Solo 3x3 por ahora
  }

  /**
   * Obtener configuración de reglas de juego basada en configuración noTie y tamaño de tablero
   * @param {boolean} noTie - Si el modo sin empates está habilitado
   * @param {number|string} boardSize - Tamaño de tablero (3 o 5)
   * @returns {Object} Configuración de reglas de juego con nombre de regla y estado habilitado
   */
  static getGameRuleConfig(noTie, boardSize) {
    if (!noTie) return { rule: 'classic', enabled: false };

    const size =
      typeof boardSize === 'string' ? parseInt(boardSize) : boardSize;
    if (size === 3) return { rule: 'infinity', enabled: true };

    return { rule: 'classic', enabled: false }; // 5x5 infinito no está listo
  }

  /**
   * Determinar si se necesita limitación de velocidad
   * @param {string} speed - Configuración de velocidad
   * @returns {boolean} Verdadero si se necesita limitación
   */
  static shouldThrottle(speed) {
    return speed !== 'fast';
  }

  /**
   * Crear objeto de configuración de limitación
   * @param {string} speed - Configuración de velocidad
   * @returns {Object} Configuración de limitación
   */
  static createThrottleConfig(speed) {
    const delay = this.getSpeedDelay(speed);
    const shouldThrottle = this.shouldThrottle(speed);

    return {
      delay,
      shouldThrottle,
      showIndicator: shouldThrottle,
    };
  }

  /**
   * Verificar si el juego está en progreso
   * @param {string} gameState - Estado actual del juego
   * @returns {boolean} Verdadero si el juego está en progreso
   */
  static isGameInProgress(gameState) {
    return gameState === 'playing';
  }

  /**
   * Verificar si el juego está completado
   * @param {string} gameState - Estado actual del juego
   * @returns {boolean} Verdadero si el juego está completado
   */
  static isGameCompleted(gameState) {
    return gameState === 'completed';
  }

  /**
   * Obtener texto de visualización del estado del juego
   * @param {string} gameState - Estado actual del juego
   * @returns {string} Texto de visualización para el estado del juego
   */
  static getGameStatusText(gameState) {
    return this.GAME_STATUS_TEXT[gameState] || 'Estado Desconocido';
  }

  /**
   * Formatear línea ganadora para visualización
   * @param {Array|boolean|null|undefined} winningLine - Datos de línea ganadora
   * @returns {string} Texto de línea ganadora formateado
   */
  static formatWinningLine(winningLine) {
    if (Array.isArray(winningLine)) {
      if (winningLine.length === 0) {
        return 'Línea ganadora';
      }
      return `Línea ${winningLine.join('-')}`;
    }

    if (winningLine === true) {
      return 'Línea ganadora';
    }

    if (
      winningLine === false ||
      winningLine === null ||
      winningLine === undefined
    ) {
      return 'N/A';
    }

    // Manejar otros tipos (cadenas, números, etc.)
    return 'Línea ganadora';
  }

  /**
   * Extraer nombre del jugador de forma segura
   * @param {Object|null|undefined} player - Objeto jugador
   * @returns {string} Nombre del jugador o 'Desconocido'
   */
  static getPlayerName(player) {
    if (!player || typeof player !== 'object') {
      return 'Desconocido';
    }
    return player.name || 'Desconocido';
  }

  /**
   * Verificar si el jugador es humano
   * @param {Object|null|undefined} player - Objeto jugador
   * @returns {boolean} Verdadero si el jugador es humano
   */
  static isHumanPlayer(player) {
    if (!player || typeof player !== 'object') {
      return false;
    }
    return Boolean(player.isHuman);
  }

  /**
   * Crear configuración de juego para llamadas API
   * @param {Object} config - Objeto de configuración
   * @returns {Object} Configuración lista para API
   */
  static createApiConfig(config) {
    const normalized = this.normalizeConfig(config);
    return {
      boardSize: parseInt(normalized.boardSize.split('x')[0]),
      speed: normalized.speed,
      gameMode: normalized.gameMode,
      noTie: normalized.noTie,
    };
  }

  /**
   * Validar configuración completa del juego
   * @param {Object} config - Configuración del juego
   * @param {Array} players - Array de jugadores
   * @returns {Object} Resultado de validación
   */
  static validateGameSetup(config, players) {
    const normalizedConfig = this.normalizeConfig(config);
    const errors = [];

    if (!this.isValidBoardSize(normalizedConfig.boardSize)) {
      errors.push('Tamaño de tablero inválido');
    }

    if (!this.isValidSpeed(normalizedConfig.speed)) {
      errors.push('Configuración de velocidad inválida');
    }

    if (!this.isValidGameMode(normalizedConfig.gameMode)) {
      errors.push('Modo de juego inválido');
    }

    if (!Array.isArray(players) || players.length < 2) {
      errors.push('Configuración de jugadores inválida');
    }

    return {
      isValid: errors.length === 0,
      errors,
      config: normalizedConfig,
    };
  }

  /**
   * Crear configuración de visualización para componentes UI
   * @param {Object} config - Configuración cruda
   * @returns {Object} Configuración lista para UI
   */
  static createDisplayConfig(config) {
    const normalized = this.normalizeConfig(config);
    const throttleConfig = this.createThrottleConfig(normalized.speed);

    return {
      ...normalized,
      throttle: throttleConfig,
      displayText: {
        speed: this.getSpeedDisplayText(normalized.speed),
        boardSize: this.getBoardSizeDisplayText(normalized.boardSize),
        gameMode: this.getGameModeDisplayText(normalized.gameMode),
      },
    };
  }

  /**
   * Obtener texto de visualización de velocidad
   * @param {string} speed - Configuración de velocidad
   * @returns {string} Texto de visualización
   */
  static getSpeedDisplayText(speed) {
    const speedTexts = {
      slow: 'Lento',
      normal: 'Normal',
      fast: 'Rápido',
    };
    return speedTexts[speed] || 'Normal';
  }

  /**
   * Obtener texto de visualización del tamaño de tablero
   * @param {string} boardSize - Tamaño de tablero
   * @returns {string} Texto de visualización
   */
  static getBoardSizeDisplayText(boardSize) {
    return boardSize.toUpperCase();
  }

  /**
   * Obtener texto de visualización del modo de juego
   * @param {string} gameMode - Modo de juego
   * @returns {string} Texto de visualización
   */
  static getGameModeDisplayText(gameMode) {
    const modeTexts = {
      individual: 'Individual',
      tournament: 'Torneo',
    };
    return modeTexts[gameMode] || 'Individual';
  }
}

export default GameOptionsService;
