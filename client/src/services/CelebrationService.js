/**
 * CelebrationService
 * Service for celebration screen business logic - countdown, statistics calculation
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

class CelebrationService {
  /**
   * Calculate game statistics from match or tournament result
   * @param {Object|null} matchResult - Match result object
   * @param {Object|null} tournamentResult - Tournament result object
   * @returns {Object} Formatted statistics object
   */
  static calculateGameStatistics(matchResult, tournamentResult) {
    const result = matchResult || tournamentResult;

    if (!result) {
      return this.getEmptyStatistics();
    }

    const winner = result.winner;
    const history = result.history || [];
    const movesCount = history.length;
    const gameTime = result.gameTime || 'N/A';

    // Per-player move counts
    const player1Moves = history.filter(h => h.playerId === 'player1').length;
    const player2Moves = history.filter(h => h.playerId === 'player2').length;

    // Tournament specific
    const totalRounds = tournamentResult?.totalRounds || 1;
    const totalMatches = tournamentResult?.totalMatches || 1;
    const averageTime = tournamentResult
      ? tournamentResult.averageTime || gameTime
      : gameTime;

    return {
      winner,
      movesCount,
      gameTime,
      player1Moves,
      player2Moves,
      totalRounds,
      totalMatches,
      averageTime,
    };
  }

  /**
   * Format player moves from history
   * @param {Array} history - Game history array
   * @returns {Object} Per-player move counts
   */
  static formatPlayerMoves(history) {
    if (!Array.isArray(history)) {
      return { player1Moves: 0, player2Moves: 0 };
    }

    return {
      player1Moves: history.filter(h => h.playerId === 'player1').length,
      player2Moves: history.filter(h => h.playerId === 'player2').length,
    };
  }

  /**
   * Get game metadata from result
   * @param {Object} result - Match or tournament result
   * @param {Object|null} tournamentResult - Tournament result (optional)
   * @returns {Object} Game metadata
   */
  static getGameMetadata(result, tournamentResult) {
    if (!result) {
      return {
        gameMode: 'Individual',
        boardSize: '3x3',
        speed: 'normal',
        noTie: false,
        winningLine: null,
      };
    }

    return {
      gameMode: result.gameMode || (tournamentResult ? 'Torneo' : 'Individual'),
      boardSize: result.boardSize || '3x3',
      speed: result.speed || 'normal',
      noTie: result.noTie || false,
      winningLine: result.winningLine || null,
    };
  }

  /**
   * Create countdown timer
   * @param {number} duration - Duration in seconds
   * @param {Function} onTick - Called every second with remaining time
   * @param {Function} onComplete - Called when countdown reaches 0
   * @returns {Function} Cleanup function to clear the timer
   */
  static createCountdownTimer(duration, onTick, onComplete) {
    let remaining = duration;

    const timer = setInterval(() => {
      remaining -= 1;

      // Always call onTick with the new remaining value (including 0)
      if (onTick) {
        onTick(remaining);
      }

      // Check if countdown is complete
      if (remaining <= 0) {
        clearInterval(timer);
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }

  /**
   * Get empty statistics object
   * @returns {Object} Empty statistics
   */
  static getEmptyStatistics() {
    return {
      winner: null,
      movesCount: 0,
      gameTime: 'N/A',
      player1Moves: 0,
      player2Moves: 0,
      totalRounds: 1,
      totalMatches: 1,
      averageTime: 'N/A',
    };
  }
}

export default CelebrationService;
