/**
 * Statistics Service
 * Tracks match statistics and provides analytics
 * @lastModified 2025-10-08
 * @version 1.0.0
 */

class StatisticsService {
  constructor() {
    this.stats = {
      totalGames: 0,
      wins: {},
      winsByType: {
        algorithm: 0,
        human: 0,
        random: 0,
      },
      draws: 0,
      gamesByBoardSize: {
        '3x3': 0,
        '5x5': 0,
      },
      gamesByMode: {
        individual: 0,
        tournament: 0,
      },
      totalDuration: 0,
      averageDuration: 0,
      averageMoves: 0,
    };
  }

  /**
   * Record a match result
   * @param {Object} matchData - Match data to record
   */
  recordMatch(matchData) {
    if (
      !matchData ||
      typeof matchData !== 'object' ||
      Array.isArray(matchData)
    ) {
      return; // Gracefully handle invalid data
    }

    // Validate required fields before recording
    if (
      !matchData.players ||
      !Array.isArray(matchData.players) ||
      matchData.players.length === 0
    ) {
      return; // Don't record if players data is invalid
    }

    this.stats.totalGames++;

    // Record winner
    if (matchData.winner && matchData.winner.name) {
      const winnerName = matchData.winner.name;
      this.stats.wins[winnerName] = (this.stats.wins[winnerName] || 0) + 1;

      // Record by type
      const winnerType = matchData.winner.type || 'algorithm';
      if (
        Object.prototype.hasOwnProperty.call(this.stats.winsByType, winnerType)
      ) {
        this.stats.winsByType[winnerType]++;
      }
    } else {
      this.stats.draws++;
    }

    // Record by board size
    const boardSize = matchData.boardSize
      ? `${matchData.boardSize}x${matchData.boardSize}`
      : '3x3';
    if (
      Object.prototype.hasOwnProperty.call(
        this.stats.gamesByBoardSize,
        boardSize
      )
    ) {
      this.stats.gamesByBoardSize[boardSize]++;
    }

    // Record by mode
    const mode = matchData.gameMode || 'individual';
    if (Object.prototype.hasOwnProperty.call(this.stats.gamesByMode, mode)) {
      this.stats.gamesByMode[mode]++;
    }

    // Record duration and moves
    if (matchData.duration) {
      this.stats.totalDuration += matchData.duration;
      this.stats.averageDuration =
        this.stats.totalDuration / this.stats.totalGames;
    }

    if (matchData.moves) {
      this.stats.averageMoves =
        (this.stats.averageMoves * (this.stats.totalGames - 1) +
          matchData.moves) /
        this.stats.totalGames;
    }
  }

  /**
   * Get current statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      totalGames: this.stats.totalGames,
      wins: { ...this.stats.wins },
      winsByType: { ...this.stats.winsByType },
      draws: this.stats.draws,
      gamesByBoardSize: { ...this.stats.gamesByBoardSize },
      gamesByMode: { ...this.stats.gamesByMode },
      totalDuration: this.stats.totalDuration,
      averageDuration: this.stats.averageDuration,
      averageMoves: this.stats.averageMoves,
    };
  }

  /**
   * Reset all statistics
   */
  resetStats() {
    this.stats = {
      totalGames: 0,
      wins: {},
      winsByType: {
        algorithm: 0,
        human: 0,
        random: 0,
      },
      draws: 0,
      gamesByBoardSize: {
        '3x3': 0,
        '5x5': 0,
      },
      gamesByMode: {
        individual: 0,
        tournament: 0,
      },
      totalDuration: 0,
      averageDuration: 0,
      averageMoves: 0,
    };
  }
}

// Create singleton instance
const statisticsService = new StatisticsService();

export default statisticsService;
