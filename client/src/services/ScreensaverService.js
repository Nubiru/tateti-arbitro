/**
 * ScreensaverService
 * Service for screensaver screen business logic - simulated games, cycling
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

class ScreensaverService {
  /**
   * Get simulated games for screensaver display
   * @returns {Array} Array of simulated game objects
   */
  static getSimulatedGames() {
    return [
      {
        player1: 'Bot Alpha',
        player2: 'Bot Beta',
        moves: 7,
        winner: 'Bot Alpha',
      },
      {
        player1: 'AI Master',
        player2: 'Code Warrior',
        moves: 5,
        winner: 'Code Warrior',
      },
      {
        player1: 'Logic King',
        player2: 'Strategy Pro',
        moves: 9,
        winner: 'Logic King',
      },
      {
        player1: 'Algorithm Ace',
        player2: 'Data Genius',
        moves: 6,
        winner: 'Data Genius',
      },
      {
        player1: 'Cyber Player',
        player2: 'Digital Mind',
        moves: 8,
        winner: 'Cyber Player',
      },
    ];
  }

  /**
   * Create game cycler that rotates through games
   * @param {Array} games - Array of game objects
   * @param {number} interval - Interval in milliseconds
   * @param {Function} onGameChange - Callback with new game index
   * @returns {Function} Cleanup function to clear the interval
   */
  static createGameCycler(games, interval, onGameChange) {
    if (!Array.isArray(games) || games.length === 0) {
      return () => {}; // No-op cleanup
    }

    let currentIndex = 0;

    const cycler = setInterval(() => {
      currentIndex = this.getNextGame(currentIndex, games.length);
      if (onGameChange) {
        onGameChange(currentIndex);
      }
    }, interval);

    return () => clearInterval(cycler);
  }

  /**
   * Get next game index with wraparound
   * @param {number} currentIndex - Current game index
   * @param {number} totalGames - Total number of games
   * @returns {number} Next game index
   */
  static getNextGame(currentIndex, totalGames) {
    if (totalGames === 0) {
      return 0;
    }
    return (currentIndex + 1) % totalGames;
  }
}

export default ScreensaverService;
