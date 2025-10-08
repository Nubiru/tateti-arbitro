/**
 * PlayerService
 * Service for bot discovery, player generation, and player management
 * @lastModified 2025-10-06
 * @version 1.0.0
 */

export class PlayerService {
  /**
   * Discover available bots from the API
   * @returns {Promise<{success: boolean, bots: Array, error: string|null}>}
   */
  async discoverBots() {
    try {
      const response = await fetch('/api/bots/available');

      if (!response.ok) {
        return {
          success: false,
          bots: [],
          error: `Failed to discover bots: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        bots: data.bots || [],
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        bots: [],
        error: error.message,
      };
    }
  }

  /**
   * Generate players based on count and available bots
   * @param {number} count - Number of players to generate
   * @param {Array} availableBots - Array of available bots
   * @returns {Array} Array of player objects
   */
  generatePlayers(count, availableBots = []) {
    const healthyBots = this.getHealthyBots(availableBots);
    const players = [];

    for (let i = 0; i < count; i++) {
      if (i < healthyBots.length) {
        // Use discovered bot
        players.push({
          name: healthyBots[i].name,
          port: healthyBots[i].port,
          isHuman: false,
          status: healthyBots[i].status,
          type: healthyBots[i].type,
          capabilities: healthyBots[i].capabilities,
        });
      } else {
        // Fallback to generic bot
        const playerNumber = i + 1;
        players.push({
          name: `Bot${playerNumber}`,
          port: 3000 + playerNumber,
          isHuman: false,
          status: 'unknown',
        });
      }
    }

    return players;
  }

  /**
   * Validate player count
   * @param {number} count - Player count to validate
   * @returns {boolean} True if valid, false otherwise
   */
  validatePlayerCount(count) {
    return Number.isInteger(count) && count >= 2 && count <= 16;
  }

  /**
   * Get default players configuration
   * @returns {Array} Array of default player objects
   */
  getDefaultPlayers() {
    return [
      { name: 'Bot1', port: 3001, isHuman: false, status: 'unknown' },
      { name: 'Bot2', port: 3002, isHuman: false, status: 'unknown' },
    ];
  }

  /**
   * Filter healthy bots from available bots
   * @param {Array} bots - Array of bot objects
   * @returns {Array} Array of healthy bots
   */
  getHealthyBots(bots) {
    return bots.filter(bot => bot.status === 'healthy');
  }
}
