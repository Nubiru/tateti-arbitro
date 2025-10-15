/**
 * Servicio de Jugadores
 * Servicio para descubrimiento de bots, generación de jugadores y gestión de selección de jugadores
 * @lastModified 2025-01-27
 * @version 2.1.0
 */

export class PlayerService {
  /**
   * Descubrir bots disponibles desde la API
   * @returns {Promise<{success: boolean, bots: Array, error: string|null}>}
   */
  async discoverBots() {
    try {
      // DEBUG: Registrar intento de descubrimiento de bots
      if (process.env.LOG_LEVEL === 'debug') {
        console.log(
          '[DEBUG][PlayerService][discoverBots] Descubriendo bots...'
        );
      }

      const response = await fetch('/api/bots/available');

      if (!response.ok) {
        // DEBUG: Registrar fallo en descubrimiento
        if (process.env.LOG_LEVEL === 'debug') {
          console.log(
            '[DEBUG][PlayerService][discoverBots] Fallo en descubrimiento:',
            response.status
          );
        }

        return {
          success: false,
          bots: [],
          error: `Error al descubrir bots: ${response.status}`,
        };
      }

      const data = await response.json();

      // DEBUG: Registrar bots descubiertos
      if (process.env.LOG_LEVEL === 'debug') {
        console.log('[DEBUG][PlayerService][discoverBots] Bots descubiertos:', {
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
      // DEBUG: Registrar error de descubrimiento
      if (process.env.LOG_LEVEL === 'debug') {
        console.log(
          '[DEBUG][PlayerService][discoverBots] Error de descubrimiento:',
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
   * Obtener número de jugadores para modo de juego
   * @param {string} gameMode - Modo de juego ('single' o 'tournament')
   * @param {Object} config - Configuración del juego
   * @returns {number} Número de jugadores necesarios
   */
  getPlayerCountForMode(gameMode, config = {}) {
    if (gameMode === 'single') {
      return 2;
    }
    // Modo torneo: usar número de jugadores configurado
    return config.playerCount || 4;
  }

  /**
   * Poblar jugadores para un modo de juego específico
   * @param {string} gameMode - Modo de juego ('single' o 'tournament')
   * @param {Array} availableBots - Array de bots disponibles
   * @param {Object} config - Configuración del juego
   * @param {Array} existingPlayers - Jugadores existentes opcionales para preservar configuraciones
   * @returns {Array} Array de objetos jugador
   */
  populatePlayersForMode(
    gameMode,
    availableBots = [],
    config = {},
    existingPlayers = []
  ) {
    const targetCount = this.getPlayerCountForMode(gameMode, config);
    const healthyBots = this.getHealthyBots(availableBots);

    // DEBUG: Registrar datos de descubrimiento de bots
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(
        '[DEBUG][PlayerService][populatePlayersForMode] Datos de descubrimiento de bots:',
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

    // Ordenar bots por puerto para orden consistente (bots Docker) o por nombre (bots Vercel)
    healthyBots.sort((a, b) => {
      // Los bots Docker tienen puertos, los bots Vercel tienen URLs
      if (a.port && b.port) {
        return a.port - b.port;
      } else if (a.url && b.url) {
        return a.name.localeCompare(b.name);
      } else if (a.port) {
        return -1; // Bots Docker primero
      } else {
        return 1; // Bots Vercel después
      }
    });

    const players = [];

    for (let i = 0; i < targetCount; i++) {
      // Verificar si tenemos un jugador existente para preservar configuraciones
      const existingPlayer = existingPlayers[i];

      if (i < healthyBots.length) {
        // Usar bot descubierto
        const bot = healthyBots[i];

        // Manejar bots Vercel (con URLs) vs bots Docker (con puertos)
        if (bot.url) {
          // Bot Vercel - usar URL
          players.push({
            name: bot.name,
            url: bot.url,
            port: null,
            isHuman: existingPlayer?.isHuman || false, // Preservar configuración humana
            status: bot.status,
            type: bot.type,
            capabilities: bot.capabilities,
            source: bot.source,
          });
        } else {
          // Bot Docker - corregir números de puerto para torneo de 4 jugadores
          const correctedPort = this.getCorrectPortForPlayer(i + 1, bot.port);
          players.push({
            name: bot.name,
            port: correctedPort,
            // Don't set url for Docker bots - only set port
            isHuman: existingPlayer?.isHuman || false, // Preservar configuración humana
            status: bot.status,
            type: bot.type,
            capabilities: bot.capabilities,
            source: bot.source,
          });
        }

        // DEBUG: Registrar uso de bot descubierto
        if (process.env.LOG_LEVEL === 'debug') {
          console.log(
            '[DEBUG][PlayerService][populatePlayersForMode] Usando bot descubierto:',
            {
              index: i,
              name: bot.name,
              type: bot.type,
              port: bot.port,
              url: bot.url,
              source: bot.source,
              isHuman: existingPlayer?.isHuman || false,
            }
          );
        }
      } else {
        // Respaldo a bot genérico
        const fallbackPlayer = this.createFallbackPlayer(i + 1);
        // Preservar configuración humana si el jugador existente era humano
        if (existingPlayer?.isHuman) {
          fallbackPlayer.isHuman = true;
        }
        players.push(fallbackPlayer);

        // DEBUG: Registrar uso de respaldo
        if (process.env.LOG_LEVEL === 'debug') {
          console.log(
            '[DEBUG][PlayerService][populatePlayersForMode] Usando jugador de respaldo:',
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
   * Obtener el número de puerto correcto para un jugador en torneo de 4 jugadores
   * @param {number} playerNumber - Número de jugador (indexado desde 1)
   * @param {number} originalPort - Puerto original del descubrimiento de bot
   * @returns {number} Número de puerto corregido
   */
  getCorrectPortForPlayer(playerNumber, originalPort) {
    // Mapear números de jugador a puertos correctos de contenedores Docker para torneo de 4 jugadores
    const portMapping = {
      1: 3001, // RandomBot1
      2: 3002, // RandomBot2
      3: 3005, // RandomBot3
      4: 3006, // SmartBot2
    };

    return portMapping[playerNumber] || originalPort;
  }

  /**
   * Crear un jugador de respaldo cuando no hay bot disponible
   * @param {number} playerNumber - Número de jugador (indexado desde 1)
   * @returns {Object} Objeto jugador de respaldo
   */
  createFallbackPlayer(playerNumber) {
    // Mapear números de jugador a puertos correctos de contenedores Docker para torneo de 4 jugadores
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
   * Generar jugadores basado en conteo y bots disponibles
   * @param {number} count - Número de jugadores a generar
   * @param {Array} availableBots - Array de bots disponibles
   * @returns {Array} Array de objetos jugador
   */
  generatePlayers(count, availableBots = []) {
    const healthyBots = this.getHealthyBots(availableBots);
    const players = [];

    for (let i = 0; i < count; i++) {
      if (i < healthyBots.length) {
        // Usar bot descubierto
        players.push({
          name: healthyBots[i].name,
          port: healthyBots[i].port,
          isHuman: false,
          status: healthyBots[i].status,
          type: healthyBots[i].type,
          capabilities: healthyBots[i].capabilities,
        });
      } else {
        // Respaldo a bot genérico
        players.push(this.createFallbackPlayer(i + 1));
      }
    }

    return players;
  }

  /**
   * Validar selección de jugadores para modo de juego
   * @param {Array} players - Array de objetos jugador
   * @param {string} gameMode - Modo de juego ('single' o 'tournament')
   * @returns {Object} Resultado de validación con isValid y errors
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

    // Validar que cada jugador tenga campos requeridos
    players.forEach((player, index) => {
      if (!player.name || typeof player.name !== 'string') {
        errors.push(`El jugador ${index + 1} debe tener un nombre válido`);
      }

      // Los jugadores humanos no necesitan puerto o url (tienen port: 0)
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
   * Validar número de jugadores
   * @param {number} count - Número de jugadores a validar
   * @returns {boolean} Verdadero si es válido, falso en caso contrario
   */
  validatePlayerCount(count) {
    return Number.isInteger(count) && count >= 2 && count <= 16;
  }

  /**
   * Obtener configuración de jugadores por defecto
   * @returns {Array} Array de objetos jugador por defecto
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
   * Filtrar bots saludables de bots disponibles
   * @param {Array} bots - Array de objetos bot
   * @returns {Array} Array de bots saludables
   */
  getHealthyBots(bots) {
    if (!Array.isArray(bots)) {
      return [];
    }
    // Por ahora, incluir bots con estado 'offline' para solucionar problemas del backend
    return bots.filter(
      bot => bot && (bot.status === 'healthy' || bot.status === 'offline')
    );
  }

  /**
   * Actualizar un campo específico de jugador
   * @param {Array} players - Array actual de jugadores
   * @param {number} index - Índice de jugador a actualizar
   * @param {string} field - Campo a actualizar
   * @param {*} value - Nuevo valor
   * @returns {Array} Nuevo array de jugadores con actualización aplicada
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
