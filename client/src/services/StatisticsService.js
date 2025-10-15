/**
 * Servicio de Estadísticas (Frontend)
 * Agrega y formatea estadísticas de juego para visualización
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

class StatisticsService {
  /**
   * Agregar resultados de partida en formato de estadísticas
   * @param {Object} matchResult - Objeto resultado de partida
   * @param {Object|null} matchResult.winner - Objeto jugador ganador o null para empate
   * @param {Array} matchResult.players - Array de objetos jugador
   * @param {Array} matchResult.history - Array de historial de movimientos
   * @param {number} matchResult.boardSize - Tamaño de tablero (3 o 5)
   * @param {string} matchResult.gameMode - Modo de juego ('individual' o 'tournament')
   * @param {string} matchResult.startTime - Marca de tiempo ISO de inicio de juego
   * @param {string} matchResult.endTime - Marca de tiempo ISO de fin de juego
   * @returns {Object} Objeto de estadísticas agregadas
   */
  static aggregateMatchStats(matchResult) {
    if (!matchResult || typeof matchResult !== 'object') {
      return this.getEmptyStats();
    }

    // Extraer datos de forma segura con valores por defecto
    const winner = matchResult.winner || null;
    const players = Array.isArray(matchResult.players)
      ? matchResult.players
      : [];
    const history = Array.isArray(matchResult.history)
      ? matchResult.history
      : [];
    const boardSize =
      typeof matchResult.boardSize === 'number' ? matchResult.boardSize : 3;
    const gameMode =
      typeof matchResult.gameMode === 'string'
        ? matchResult.gameMode
        : 'individual';

    // Calcular duración
    let duration = 0;
    let timestamp = new Date().toISOString();

    if (matchResult.startTime && matchResult.endTime) {
      try {
        const startTime = new Date(matchResult.startTime);
        const endTime = new Date(matchResult.endTime);
        duration = endTime.getTime() - startTime.getTime();
        timestamp = matchResult.startTime;
      } catch (error) {
        // Marcas de tiempo inválidas, usar valores por defecto
        duration = 0;
        timestamp = new Date().toISOString();
      }
    }

    return {
      winner,
      players,
      moves: history.length,
      duration,
      boardSize,
      gameMode,
      timestamp,
    };
  }

  /**
   * Formatear estadísticas en bruto para visualización
   * @param {Object} rawStats - Objeto de estadísticas en bruto
   * @returns {Object} Estadísticas formateadas para visualización de UI
   */
  static formatStats(rawStats) {
    if (!rawStats || typeof rawStats !== 'object') {
      return this.getEmptyFormattedStats();
    }

    const totalGames =
      typeof rawStats.totalGames === 'number' ? rawStats.totalGames : 0;
    const winsByType = rawStats.winsByType || {
      algorithm: 0,
      random: 0,
      human: 0,
    };
    const draws = typeof rawStats.draws === 'number' ? rawStats.draws : 0;
    const averageMoves =
      typeof rawStats.averageMoves === 'number' ? rawStats.averageMoves : 0;
    const averageDuration =
      typeof rawStats.averageDuration === 'number'
        ? rawStats.averageDuration
        : 0;
    const totalDuration =
      typeof rawStats.totalDuration === 'number' ? rawStats.totalDuration : 0;
    const gamesByBoardSize = rawStats.gamesByBoardSize || {
      '3x3': 0,
      '5x5': 0,
    };
    const gamesByMode = rawStats.gamesByMode || {
      individual: 0,
      tournament: 0,
    };

    return {
      totalGames,
      winsByType,
      draws,
      averageMoves: averageMoves.toFixed(1),
      averageDuration: this.formatDuration(averageDuration),
      totalDuration: this.formatDuration(totalDuration),
      winRates: this.calculateWinRates({ totalGames, winsByType, draws }),
      drawRate:
        totalGames > 0 ? ((draws / totalGames) * 100).toFixed(1) + '%' : '0.0%',
      gamesByBoardSize,
      gamesByMode,
    };
  }

  /**
   * Calcular tasas de victoria para cada tipo de jugador
   * @param {Object} stats - Objeto de estadísticas con totalGames, winsByType, draws
   * @returns {Object} Tasas de victoria como porcentajes
   */
  static calculateWinRates(stats) {
    const { totalGames, winsByType } = stats;
    // const draws = stats.draws; // Actualmente no se usa en UI

    if (totalGames === 0) {
      return {
        algorithm: '0.0%',
        random: '0.0%',
        human: '0.0%',
      };
    }

    const algorithmWins = winsByType.algorithm || 0;
    const randomWins = winsByType.random || 0;
    const humanWins = winsByType.human || 0;

    return {
      algorithm: ((algorithmWins / totalGames) * 100).toFixed(1) + '%',
      random: ((randomWins / totalGames) * 100).toFixed(1) + '%',
      human: ((humanWins / totalGames) * 100).toFixed(1) + '%',
    };
  }

  /**
   * Formatear duración en milisegundos a cadena legible por humanos
   * @param {number} durationMs - Duración en milisegundos
   * @returns {string} Cadena de duración formateada
   */
  static formatDuration(durationMs) {
    if (typeof durationMs !== 'number' || durationMs < 0) {
      return '0ms';
    }

    if (durationMs < 1000) {
      return `${Math.round(durationMs)}ms`;
    } else if (durationMs < 60000) {
      return `${(durationMs / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Obtener objeto de estadísticas vacío
   * @returns {Object} Objeto de estadísticas vacío
   */
  static getEmptyStats() {
    return {
      winner: null,
      players: [],
      moves: 0,
      duration: 0,
      boardSize: 3,
      gameMode: 'individual',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtener objeto de estadísticas formateadas vacío
   * @returns {Object} Objeto de estadísticas formateadas vacío
   */
  static getEmptyFormattedStats() {
    return {
      totalGames: 0,
      winsByType: { algorithm: 0, random: 0, human: 0 },
      draws: 0,
      averageMoves: '0.0',
      averageDuration: '0ms',
      totalDuration: '0ms',
      winRates: { algorithm: '0.0%', random: '0.0%', human: '0.0%' },
      drawRate: '0.0%',
      gamesByBoardSize: { '3x3': 0, '5x5': 0 },
      gamesByMode: { individual: 0, tournament: 0 },
    };
  }

  /**
   * Obtener nombre de visualización de tipo de jugador
   * @param {string} type - Tipo de jugador ('algorithm', 'random', 'human')
   * @returns {string} Nombre de visualización para tipo de jugador
   */
  static getPlayerTypeDisplayName(type) {
    const typeMap = {
      algorithm: 'Algoritmo',
      random: 'Aleatorio',
      human: 'Humano',
    };
    return typeMap[type] || type;
  }

  /**
   * Obtener nombre de visualización de modo de juego
   * @param {string} mode - Modo de juego ('individual', 'tournament')
   * @returns {string} Nombre de visualización para modo de juego
   */
  static getGameModeDisplayName(mode) {
    const modeMap = {
      individual: 'Individual',
      tournament: 'Torneo',
    };
    return modeMap[mode] || mode;
  }

  /**
   * Obtener nombre de visualización de tamaño de tablero
   * @param {number} size - Tamaño de tablero (3 o 5)
   * @returns {string} Nombre de visualización para tamaño de tablero
   */
  static getBoardSizeDisplayName(size) {
    return `${size}x${size}`;
  }

  /**
   * Crear estadísticas de resumen para una sola partida
   * @param {Object} matchResult - Objeto resultado de partida
   * @returns {Object} Estadísticas de resumen para la partida
   */
  static createMatchSummary(matchResult) {
    const stats = this.aggregateMatchStats(matchResult);

    return {
      winner: stats.winner
        ? `${stats.winner.name} (${this.getPlayerTypeDisplayName(stats.winner.type)})`
        : 'Empate',
      moves: stats.moves,
      duration: this.formatDuration(stats.duration),
      boardSize: this.getBoardSizeDisplayName(stats.boardSize),
      gameMode: this.getGameModeDisplayName(stats.gameMode),
      timestamp: new Date(stats.timestamp).toLocaleString('es-ES'),
    };
  }
}

export default StatisticsService;
