/**
 * Game Options Service
 * Centralized service for handling game configuration, speed calculations, and state management
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

class GameOptionsService {
  // Speed configuration constants
  static SPEED_DELAYS = {
    slow: 2000,
    normal: 1000,
    fast: 200,
  };

  // Default configuration
  static DEFAULT_CONFIG = {
    boardSize: '3x3',
    speed: 'normal',
    gameMode: 'individual',
    noTie: false,
  };

  // Valid board sizes
  static VALID_BOARD_SIZES = ['3x3', '5x5'];

  // Valid speed settings
  static VALID_SPEEDS = ['slow', 'normal', 'fast'];

  // Valid game modes
  static VALID_GAME_MODES = ['individual', 'tournament'];

  // Game status text mappings
  static GAME_STATUS_TEXT = {
    playing: 'Partida en Progreso',
    completed: 'Partida Completada',
    waiting: 'Esperando...',
    error: 'Error en la Partida',
  };

  // Game rules configuration (Factory Pattern)
  static GAME_RULES = {
    infinity: {
      enabled: true,
      boardSizes: [3], // Only 3x3 for now
      description:
        'No draws - rolling window removes oldest move after 6 moves',
    },
    infinity5x5: {
      enabled: false, // Placeholder for future
      boardSizes: [5],
      description: 'Infinity mode for 5x5 boards (NOT IMPLEMENTED)',
    },
  };

  /**
   * Get speed delay in milliseconds
   * @param {string} speed - Speed setting ('slow', 'normal', 'fast')
   * @returns {number} Delay in milliseconds
   */
  static getSpeedDelay(speed) {
    if (!speed || typeof speed !== 'string') {
      return this.SPEED_DELAYS.normal;
    }
    return this.SPEED_DELAYS[speed] || this.SPEED_DELAYS.normal;
  }

  /**
   * Validate board size
   * @param {string} boardSize - Board size to validate
   * @returns {boolean} True if valid
   */
  static isValidBoardSize(boardSize) {
    return this.VALID_BOARD_SIZES.includes(boardSize);
  }

  /**
   * Validate speed setting
   * @param {string} speed - Speed setting to validate
   * @returns {boolean} True if valid
   */
  static isValidSpeed(speed) {
    return this.VALID_SPEEDS.includes(speed);
  }

  /**
   * Validate game mode
   * @param {string} gameMode - Game mode to validate
   * @returns {boolean} True if valid
   */
  static isValidGameMode(gameMode) {
    return this.VALID_GAME_MODES.includes(gameMode);
  }

  /**
   * Normalize configuration with defaults and validation
   * @param {Object} config - Configuration object
   * @returns {Object} Normalized configuration
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
   * Check if infinity mode can be enabled for given board size
   * @param {number} boardSize - Board size (3 or 5)
   * @returns {boolean} True if infinity mode supported
   */
  static canEnableInfinity(boardSize) {
    const size =
      typeof boardSize === 'number' ? boardSize : parseInt(boardSize);
    return size === 3; // Only 3x3 for now
  }

  /**
   * Get game rule configuration based on noTie setting and board size
   * @param {boolean} noTie - Whether no-tie mode is enabled
   * @param {number|string} boardSize - Board size (3 or 5)
   * @returns {Object} Game rule config with rule name and enabled status
   */
  static getGameRuleConfig(noTie, boardSize) {
    if (!noTie) return { rule: 'classic', enabled: false };

    const size =
      typeof boardSize === 'string' ? parseInt(boardSize) : boardSize;
    if (size === 3) return { rule: 'infinity', enabled: true };

    return { rule: 'classic', enabled: false }; // 5x5 infinity not ready
  }

  /**
   * Determine if speed throttling is needed
   * @param {string} speed - Speed setting
   * @returns {boolean} True if throttling needed
   */
  static shouldThrottle(speed) {
    return speed !== 'fast';
  }

  /**
   * Create throttle configuration object
   * @param {string} speed - Speed setting
   * @returns {Object} Throttle configuration
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
   * Check if game is in progress
   * @param {string} gameState - Current game state
   * @returns {boolean} True if game is playing
   */
  static isGameInProgress(gameState) {
    return gameState === 'playing';
  }

  /**
   * Check if game is completed
   * @param {string} gameState - Current game state
   * @returns {boolean} True if game is completed
   */
  static isGameCompleted(gameState) {
    return gameState === 'completed';
  }

  /**
   * Get game status display text
   * @param {string} gameState - Current game state
   * @returns {string} Display text for game status
   */
  static getGameStatusText(gameState) {
    return this.GAME_STATUS_TEXT[gameState] || 'Estado Desconocido';
  }

  /**
   * Format winning line for display
   * @param {Array|boolean|null|undefined} winningLine - Winning line data
   * @returns {string} Formatted winning line text
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

    // Handle other types (strings, numbers, etc.)
    return 'Línea ganadora';
  }

  /**
   * Extract player name safely
   * @param {Object|null|undefined} player - Player object
   * @returns {string} Player name or 'Unknown'
   */
  static getPlayerName(player) {
    if (!player || typeof player !== 'object') {
      return 'Unknown';
    }
    return player.name || 'Unknown';
  }

  /**
   * Check if player is human
   * @param {Object|null|undefined} player - Player object
   * @returns {boolean} True if player is human
   */
  static isHumanPlayer(player) {
    if (!player || typeof player !== 'object') {
      return false;
    }
    return Boolean(player.isHuman);
  }

  /**
   * Create game configuration for API calls
   * @param {Object} config - Configuration object
   * @returns {Object} API-ready configuration
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
   * Validate complete game setup
   * @param {Object} config - Game configuration
   * @param {Array} players - Players array
   * @returns {Object} Validation result
   */
  static validateGameSetup(config, players) {
    const normalizedConfig = this.normalizeConfig(config);
    const errors = [];

    if (!this.isValidBoardSize(normalizedConfig.boardSize)) {
      errors.push('Invalid board size');
    }

    if (!this.isValidSpeed(normalizedConfig.speed)) {
      errors.push('Invalid speed setting');
    }

    if (!this.isValidGameMode(normalizedConfig.gameMode)) {
      errors.push('Invalid game mode');
    }

    if (!Array.isArray(players) || players.length < 2) {
      errors.push('Invalid players configuration');
    }

    return {
      isValid: errors.length === 0,
      errors,
      config: normalizedConfig,
    };
  }

  /**
   * Create display configuration for UI components
   * @param {Object} config - Raw configuration
   * @returns {Object} UI-ready configuration
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
   * Get speed display text
   * @param {string} speed - Speed setting
   * @returns {string} Display text
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
   * Get board size display text
   * @param {string} boardSize - Board size
   * @returns {string} Display text
   */
  static getBoardSizeDisplayText(boardSize) {
    return boardSize.toUpperCase();
  }

  /**
   * Get game mode display text
   * @param {string} gameMode - Game mode
   * @returns {string} Display text
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
