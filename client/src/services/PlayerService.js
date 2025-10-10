/**
 * PlayerService
 * Service for bot discovery, player generation, and player selection management
 * @lastModified 2025-10-09
 * @version 2.0.0
 */

export class PlayerService {
  /**
   * Discover available bots from the API
   * @returns {Promise<{success: boolean, bots: Array, error: string|null}>}
   */
  async discoverBots() {
    try {
      // DEBUG: Log bot discovery attempt
      if (process.env.LOG_LEVEL === 'debug') {
        console.log('[DEBUG][PlayerService][discoverBots] Discovering bots...');
      }

      const response = await fetch('/api/bots/available');

      if (!response.ok) {
        // DEBUG: Log discovery failure
        if (process.env.LOG_LEVEL === 'debug') {
          console.log(
            '[DEBUG][PlayerService][discoverBots] Discovery failed:',
            response.status
          );
        }

        return {
          success: false,
          bots: [],
          error: `Failed to discover bots: ${response.status}`,
        };
      }

      const data = await response.json();

      // DEBUG: Log discovered bots
      if (process.env.LOG_LEVEL === 'debug') {
        console.log('[DEBUG][PlayerService][discoverBots] Discovered bots:', {
          count: data.bots?.length || 0,
          bots: data.bots?.map(b => ({
            name: b.name,
            port: b.port,
            status: b.status,
          })),
        });
      }

      return {
        success: true,
        bots: data.bots || [],
        error: null,
      };
    } catch (error) {
      // DEBUG: Log discovery error
      if (process.env.LOG_LEVEL === 'debug') {
        console.log(
          '[DEBUG][PlayerService][discoverBots] Discovery error:',
          error.message
        );
      }

      return {
        success: false,
        bots: [],
        error: error.message,
      };
    }
  }

  /**
   * Get player count for game mode
   * @param {string} gameMode - Game mode ('single' or 'tournament')
   * @param {Object} config - Game configuration
   * @returns {number} Number of players needed
   */
  getPlayerCountForMode(gameMode, config = {}) {
    if (gameMode === 'single') {
      return 2;
    }
    // Tournament mode: use configured player count
    return config.playerCount || 4;
  }

  /**
   * Populate players for a specific game mode
   * @param {string} gameMode - Game mode ('single' or 'tournament')
   * @param {Array} availableBots - Array of available bots
   * @param {Object} config - Game configuration
   * @returns {Array} Array of player objects
   */
  populatePlayersForMode(gameMode, availableBots = [], config = {}) {
    const targetCount = this.getPlayerCountForMode(gameMode, config);
    const healthyBots = this.getHealthyBots(availableBots);

    // Sort bots by port for consistent ordering
    healthyBots.sort((a, b) => a.port - b.port);

    const players = [];

    for (let i = 0; i < targetCount; i++) {
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
        players.push(this.createFallbackPlayer(i + 1));
      }
    }

    return players;
  }

  /**
   * Create a fallback player when no bot is available
   * @param {number} playerNumber - Player number (1-indexed)
   * @returns {Object} Fallback player object
   */
  createFallbackPlayer(playerNumber) {
    return {
      name: `Bot${playerNumber}`,
      port: 3000 + playerNumber,
      isHuman: false,
      status: 'unknown',
    };
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
        players.push(this.createFallbackPlayer(i + 1));
      }
    }

    return players;
  }

  /**
   * Validate player selection for game mode
   * @param {Array} players - Array of player objects
   * @param {string} gameMode - Game mode ('single' or 'tournament')
   * @returns {Object} Validation result with isValid and errors
   */
  validatePlayerSelection(players, gameMode) {
    const errors = [];

    if (!Array.isArray(players)) {
      errors.push('Players must be an array');
      return { isValid: false, errors };
    }

    if (gameMode === 'single') {
      if (players.length !== 2) {
        errors.push('Individual mode requires exactly 2 players');
      }
    } else if (gameMode === 'tournament') {
      const validSizes = [2, 4, 8, 16];
      if (!validSizes.includes(players.length)) {
        errors.push(
          `Tournament mode requires ${validSizes.join(', ')} players`
        );
      }
    }

    // Validate each player has required fields
    players.forEach((player, index) => {
      if (!player.name || typeof player.name !== 'string') {
        errors.push(`Player ${index + 1} must have a valid name`);
      }
      if (!player.port || typeof player.port !== 'number') {
        errors.push(`Player ${index + 1} must have a valid port`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
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
    if (!Array.isArray(bots)) {
      return [];
    }
    return bots.filter(bot => bot && bot.status === 'healthy');
  }

  /**
   * Update a specific player field
   * @param {Array} players - Current players array
   * @param {number} index - Player index to update
   * @param {string} field - Field to update
   * @param {*} value - New value
   * @returns {Array} New players array with update applied
   */
  updatePlayer(players, index, field, value) {
    if (!Array.isArray(players) || index < 0 || index >= players.length) {
      return players;
    }

    const newPlayers = [...players];
    newPlayers[index] = {
      ...newPlayers[index],
      [field]: value,
    };

    return newPlayers;
  }
}
