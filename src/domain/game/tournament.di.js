/**
 * Coordinador DI del Torneo
 * Coordina la gestión de torneos con inyección de dependencias
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import * as core from './tournament.core.js';

export class TournamentCoordinator {
  constructor(dependencies) {
    if (!dependencies.arbitrator) {
      throw new Error('arbitrator es requerido');
    }
    if (!dependencies.eventsAdapter) {
      throw new Error('eventsAdapter es requerido');
    }
    if (!dependencies.logger) {
      throw new Error('logger es requerido');
    }

    this.arbitrator = dependencies.arbitrator;
    this.eventsAdapter = dependencies.eventsAdapter;
    this.logger = dependencies.logger;
    this.clock = dependencies.clock || {
      now: () => Date.now(),
      toISOString: () => new Date().toISOString(),
    };
  }

  // Wrappers de funciones puras
  validatePlayers(players) {
    return core.validateTournamentPlayers(players);
  }

  /**
   * Construir lista de jugadores desde configuración
   * @param {Object} config - Configuración del torneo
   * @param {number} config.totalPlayers - Número total de jugadores
   * @param {boolean} config.includeRandom - Si incluir jugador Random
   * @param {string} config.humanName - Nombre del jugador humano
   * @returns {Array} Array de objetos jugador
   */
  buildPlayerList(config) {
    const { totalPlayers, includeRandom = false, humanName = null } = config;

    // Validar configuración
    if (totalPlayers < 2 || totalPlayers > 12) {
      throw new Error('totalPlayers debe ser entre 2-12');
    }

    const players = [];

    // Agregar jugador humano si se especifica
    if (humanName) {
      players.push({
        name: humanName,
        port: 3000, // Puerto del jugador humano - será manejado por el frontend
      });
    }

    // Agregar jugador Random si se solicita
    if (includeRandom) {
      players.push({
        name: 'Random',
        port: 3001, // Puerto del jugador Random
      });
    }

    // Agregar jugadores bot para llenar espacios restantes
    const remainingSlots = totalPlayers - players.length;
    const botNames = [
      'Bot1',
      'Bot2',
      'Bot3',
      'Bot4',
      'Bot5',
      'Bot6',
      'Bot7',
      'Bot8',
      'Bot9',
      'Bot10',
    ];

    for (let i = 0; i < remainingSlots && i < botNames.length; i++) {
      players.push({
        name: botNames[i],
        port: 3002 + i, // Los puertos de bot comienzan desde 3002
      });
    }

    // Si aún necesitamos más jugadores, agregar bots genéricos
    while (players.length < totalPlayers) {
      const botNumber =
        players.length - (humanName ? 1 : 0) - (includeRandom ? 1 : 0) + 1;
      players.push({
        name: `Bot${botNumber}`,
        port:
          3002 + players.length - (humanName ? 1 : 0) - (includeRandom ? 1 : 0),
      });
    }

    return players;
  }

  createBracket(players) {
    return core.createBracket(players);
  }

  createBracketWithByes(players) {
    return core.createBracketWithByes(players);
  }

  getTournamentWinners(players, bracket) {
    return core.getTournamentWinners(players, bracket);
  }

  calculateTotalMatches(playerCount) {
    return core.calculateTotalMatches(playerCount);
  }

  isPowerOfTwo(n) {
    return core.isPowerOfTwo(n);
  }

  executeRound(round, matchFunction) {
    return core.executeRound(round, matchFunction);
  }

  isTournamentComplete(bracket) {
    return core.isTournamentComplete(bracket);
  }

  shufflePlayers(players) {
    return core.shufflePlayers(players);
  }

  getRoundInfo(roundNumber, totalRounds) {
    return core.getRoundInfo(roundNumber, totalRounds);
  }

  calculateProgress(bracket, completedMatches) {
    return core.calculateProgress(bracket, completedMatches);
  }

  /**
   * Ejecutar un torneo con múltiples jugadores
   * @param {Array} players - Array de objetos jugador
   * @param {Object} options - Opciones del torneo
   * @returns {Promise<Object>} Resultado del torneo
   */
  async runTournament(players, options = {}) {
    const timeoutMs = options.timeoutMs ?? 3000;
    const noTie = options.noTie ?? false;
    const boardSize = options.boardSize === 5 ? 5 : 3;

    // Validar jugadores
    this.validatePlayers(players);

    // Mezclar jugadores
    const shuffledPlayers = this.shufflePlayers(players);

    // Crear llave
    const bracket = this.createBracket(shuffledPlayers);

    this.logger.info('TOURNAMENT', 'START', 'Iniciando torneo', {
      players: shuffledPlayers.map(p => p.name),
      boardSize: `${boardSize}x${boardSize}`,
      noTie: noTie,
      timeoutMs: timeoutMs,
    });

    // Emitir evento de inicio de torneo
    this.eventsAdapter.broadcastTournamentStart({
      players: shuffledPlayers,
      bracket: bracket,
      timestamp: this.clock.toISOString(),
    });

    const results = [];
    let currentRound = 1;

    // Ejecutar cada ronda
    while (currentRound <= bracket.length) {
      const round = bracket[currentRound - 1];
      const roundResults = [];

      this.logger.info(
        'TOURNAMENT',
        'ROUND',
        `Ejecutando ronda ${currentRound}`,
        {
          round: currentRound,
          matches: round.matches.length,
        }
      );

      // Ejecutar partidas en esta ronda
      for (const match of round.matches) {
        if (match.player1 && match.player2) {
          try {
            const matchResult = await this.arbitrator.runMatch(
              [match.player1, match.player2],
              {
                timeoutMs,
                boardSize,
                noTie,
              }
            );

            roundResults.push({
              match,
              result: matchResult,
              winner: matchResult.winner,
            });

            this.logger.info('TOURNAMENT', 'MATCH', 'Partida completada', {
              player1: match.player1.name,
              player2: match.player2.name,
              winner: matchResult.winner?.name || 'Empate',
              result: matchResult.result,
            });
          } catch (error) {
            this.logger.error('TOURNAMENT', 'MATCH', 'Error en partida', {
              player1: match.player1.name,
              player2: match.player2.name,
              error: error.message,
            });

            roundResults.push({
              match,
              result: { error: error.message },
              winner: match.player1, // Por defecto jugador1 en error
            });
          }
        }
      }

      results.push({
        round: currentRound,
        matches: roundResults,
      });

      // Mover a la siguiente ronda
      currentRound++;

      // Actualizar llave con ganadores para la siguiente ronda
      if (currentRound <= bracket.length) {
        const nextRound = bracket[currentRound - 1];
        let matchIndex = 0;

        for (let i = 0; i < roundResults.length; i += 2) {
          if (matchIndex < nextRound.matches.length) {
            nextRound.matches[matchIndex].player1 = roundResults[i].winner;
            if (i + 1 < roundResults.length) {
              nextRound.matches[matchIndex].player2 =
                roundResults[i + 1].winner;
            }
            matchIndex++;
          }
        }
      }

      // Verificar si hemos completado todas las rondas
      if (currentRound > bracket.length) {
        break;
      }
    }

    // Obtener ganadores del torneo
    const winners = this.getTournamentWinners(shuffledPlayers, bracket);

    this.logger.info('TOURNAMENT', 'COMPLETE', 'Torneo completado', {
      winner: winners.winner?.name || 'N/A',
      runnerUp: winners.runnerUp?.name || 'N/A',
      totalRounds: currentRound - 1,
    });

    // Emitir evento de finalización de torneo
    this.eventsAdapter.broadcastTournamentComplete({
      winners,
      bracket,
      results,
      timestamp: this.clock.toISOString(),
    });

    return {
      bracket,
      results,
      winners,
      totalRounds: currentRound - 1,
      completed: this.isTournamentComplete(bracket),
    };
  }
}
