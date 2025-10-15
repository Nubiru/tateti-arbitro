/**
 * PlayerService
 * Service for bot discovery, player generation, and player selection management
 * @lastModified 2025-01-27
 * @version 2.1.0
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
            url: b.url,
            source: b.source,
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
   * @param {Array} existingPlayers - Optional existing players to preserve settings
   * @returns {Array} Array of player objects
   */
  populatePlayersForMode(
    gameMode,
    availableBots = [],
    config = {},
    existingPlayers = []
  ) {
    const targetCount = this.getPlayerCountForMode(gameMode, config);
    const healthyBots = this.getHealthyBots(availableBots);

    // DEBUG: Log bot discovery data
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(
        '[DEBUG][PlayerService][populatePlayersForMode] Bot discovery data:',
        {
          availableBots: availableBots.length,
          healthyBots: healthyBots.length,
          targetCount,
          gameMode,
          existingPlayers: existingPlayers.length,
          healthyBotsData: healthyBots.map(b => ({
            name: b.name,
            type: b.type,
            status: b.status,
          })),
        }
      );
    }

    // Sort bots by port for consistent ordering
    healthyBots.sort((a, b) => a.port - b.port);

    const players = [];

    for (let i = 0; i < targetCount; i++) {
      // Check if we have an existing player to preserve settings
      const existingPlayer = existingPlayers[i];

      if (i < healthyBots.length) {
        // Use discovered bot but fix port numbers for 4-player tournament
        const bot = healthyBots[i];
        const correctedPort = this.getCorrectPortForPlayer(i + 1, bot.port);
        players.push({
          name: bot.name,
          port: correctedPort,
          isHuman: existingPlayer?.isHuman || false, // Preserve human setting
          status: bot.status,
          type: bot.type,
          capabilities: bot.capabilities,
        });

        // DEBUG: Log discovered bot usage
        if (process.env.LOG_LEVEL === 'debug') {
          console.log(
            '[DEBUG][PlayerService][populatePlayersForMode] Using discovered bot:',
            {
              index: i,
              name: bot.name,
              type: bot.type,
              port: bot.port,
              isHuman: existingPlayer?.isHuman || false,
            }
          );
        }
      } else {
        // Fallback to generic bot
        const fallbackPlayer = this.createFallbackPlayer(i + 1);
        // Preserve human setting if existing player was human
        if (existingPlayer?.isHuman) {
          fallbackPlayer.isHuman = true;
        }
        players.push(fallbackPlayer);

        // DEBUG: Log fallback usage
        if (process.env.LOG_LEVEL === 'debug') {
          console.log(
            '[DEBUG][PlayerService][populatePlayersForMode] Using fallback player:',
            {
              index: i,
              name: fallbackPlayer.name,
              type: fallbackPlayer.type,
              port: fallbackPlayer.port,
              isHuman: fallbackPlayer.isHuman,
            }
          );
        }
      }
    }

    return players;
  }

  /**
   * Get the correct port number for a player in 4-player tournament
   * @param {number} playerNumber - Player number (1-indexed)
   * @param {number} originalPort - Original port from bot discovery
   * @returns {number} Corrected port number
   */
  getCorrectPortForPlayer(playerNumber, originalPort) {
    // Map player numbers to correct Docker container ports for 4-player tournament
    const portMapping = {
      1: 3001, // RandomBot1
      2: 3002, // RandomBot2
      3: 3005, // RandomBot3
      4: 3006, // SmartBot2
    };

    return portMapping[playerNumber] || originalPort;
  }

  /**
   * Create a fallback player when no bot is available
   * @param {number} playerNumber - Player number (1-indexed)
   * @returns {Object} Fallback player object
   */
  createFallbackPlayer(playerNumber) {
    // Map player numbers to correct Docker container ports for 4-player tournament
    const portMapping = {
      1: 3001, // RandomBot1
      2: 3002, // RandomBot2
      3: 3005, // RandomBot3
      4: 3006, // SmartBot2
    };

    const nameMapping = {
      1: 'RandomBot1',
      2: 'RandomBot2',
      3: 'RandomBot3',
      4: 'SmartBot2',
    };

    return {
      name: nameMapping[playerNumber] || `Bot${playerNumber}`,
      port: portMapping[playerNumber] || 3000 + playerNumber,
      isHuman: false,
      status: 'unknown',
      type: 'bot',
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
      errors.push('Los jugadores deben ser un array');
      return { isValid: false, errors };
    }

    if (gameMode === 'single') {
      if (players.length !== 2) {
        errors.push('El modo individual requiere exactamente 2 jugadores');
      }
    } else if (gameMode === 'tournament') {
      const validSizes = [2, 4, 8, 16];
      if (!validSizes.includes(players.length)) {
        errors.push(
          `El modo torneo requiere ${validSizes.join(', ')} jugadores`
        );
      }
    }

    // Validate each player has required fields
    players.forEach((player, index) => {
      if (!player.name || typeof player.name !== 'string') {
        errors.push(`El jugador ${index + 1} debe tener un nombre válido`);
      }

      // Human players don't need port or url (they have port: 0)
      if (!player.isHuman) {
        if (!player.port && !player.url) {
          errors.push(`El jugador ${index + 1} debe tener un puerto o url`);
        }
        if (player.port && typeof player.port !== 'number') {
          errors.push(`El puerto del jugador ${index + 1} debe ser un número`);
        }
        if (player.url && typeof player.url !== 'string') {
          errors.push(`La url del jugador ${index + 1} debe ser una cadena`);
        }
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
      {
        name: 'Bot1',
        port: 3001,
        isHuman: false,
        status: 'unknown',
        type: 'bot',
      },
      {
        name: 'Bot2',
        port: 3002,
        isHuman: false,
        status: 'unknown',
        type: 'bot',
      },
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
    // For now, include bots with 'offline' status to work around backend issues
    return bots.filter(
      bot => bot && (bot.status === 'healthy' || bot.status === 'offline')
    );
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
