/**
 * Statistics Service (Frontend)
 * Aggregates and formats game statistics for display
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

class StatisticsService {
  /**
   * Aggregate match results into statistics format
   * @param {Object} matchResult - Match result object
   * @param {Object|null} matchResult.winner - Winner player object or null for draw
   * @param {Array} matchResult.players - Array of player objects
   * @param {Array} matchResult.history - Array of move history
   * @param {number} matchResult.boardSize - Board size (3 or 5)
   * @param {string} matchResult.gameMode - Game mode ('individual' or 'tournament')
   * @param {string} matchResult.startTime - ISO timestamp of game start
   * @param {string} matchResult.endTime - ISO timestamp of game end
   * @returns {Object} Aggregated statistics object
   */
  static aggregateMatchStats(matchResult) {
    if (!matchResult || typeof matchResult !== 'object') {
      return this.getEmptyStats();
    }

    // Safely extract data with defaults
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

    // Calculate duration
    let duration = 0;
    let timestamp = new Date().toISOString();

    if (matchResult.startTime && matchResult.endTime) {
      try {
        const startTime = new Date(matchResult.startTime);
        const endTime = new Date(matchResult.endTime);
        duration = endTime.getTime() - startTime.getTime();
        timestamp = matchResult.startTime;
      } catch (error) {
        // Invalid timestamps, use defaults
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
   * Format raw statistics for display
   * @param {Object} rawStats - Raw statistics object
   * @returns {Object} Formatted statistics for UI display
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
   * Calculate win rates for each player type
   * @param {Object} stats - Statistics object with totalGames, winsByType, draws
   * @returns {Object} Win rates as percentages
   */
  static calculateWinRates(stats) {
    const { totalGames, winsByType } = stats;
    // const draws = stats.draws; // Currently not used in UI

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
   * Format duration in milliseconds to human readable string
   * @param {number} durationMs - Duration in milliseconds
   * @returns {string} Formatted duration string
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
   * Get empty statistics object
   * @returns {Object} Empty statistics object
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
   * Get empty formatted statistics object
   * @returns {Object} Empty formatted statistics object
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
   * Get player type display name
   * @param {string} type - Player type ('algorithm', 'random', 'human')
   * @returns {string} Display name for player type
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
   * Get game mode display name
   * @param {string} mode - Game mode ('individual', 'tournament')
   * @returns {string} Display name for game mode
   */
  static getGameModeDisplayName(mode) {
    const modeMap = {
      individual: 'Individual',
      tournament: 'Torneo',
    };
    return modeMap[mode] || mode;
  }

  /**
   * Get board size display name
   * @param {number} size - Board size (3 or 5)
   * @returns {string} Display name for board size
   */
  static getBoardSizeDisplayName(size) {
    return `${size}x${size}`;
  }

  /**
   * Create summary statistics for a single match
   * @param {Object} matchResult - Match result object
   * @returns {Object} Summary statistics for the match
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
