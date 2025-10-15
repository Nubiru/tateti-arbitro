/**
 * Coordinador del Árbitro - Orquestador basado en DI
 * Coordina el flujo del juego usando lógica central pura y adaptadores inyectados
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import {
  validatePlayers,
  normalizePlayer,
  checkWin,
  getWinningLine,
  isBoardFull,
  isValidMove,
  createInitialBoard,
  createMatchResult,
} from './arbitrator.core.js';
import { createHttpAdapter } from './http.adapter.js';
import { createEventsAdapter } from './events.adapter.js';
import {
  shouldRemoveOldestMove,
  getRemovalPosition,
  getRemovalPlayer,
} from './rules/infinity.js';
import logger from '../../app/logger.js';

/**
 * Coordinador del Árbitro usando Inyección de Dependencias
 * @lastModified 2025-10-03
 * @version 1.0.0
 */
export class ArbitratorCoordinator {
  constructor({
    httpAdapter,
    eventsAdapter,
    logger: injectedLogger,
    clock = Date,
  }) {
    this.httpAdapter = httpAdapter;
    this.eventsAdapter = eventsAdapter;
    this.logger = injectedLogger || logger; // Use injected logger or fall back to imported logger
    this.clock = clock;
  }

  /**
   * Ejecutar una sola partida entre dos jugadores
   * @param {Array} players - Array de dos objetos jugador
   * @param {Object} options - Opciones de la partida
   * @returns {Promise<Object>} Resultado de la partida
   */
  async runMatch(players, options = {}) {
    const timeoutMs = options.timeoutMs ?? 3000;
    const noTie = options.noTie ?? false;
    const boardSize = options.boardSize === '5x5' ? 5 : 3;

    // Generate unique matchId for this match
    const matchId = `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.currentMatchId = matchId;

    // Initialize pending human moves map
    if (!this.pendingHumanMoves) {
      this.pendingHumanMoves = new Map();
    }

    // Validar jugadores usando función pura
    validatePlayers(players);

    // Normalizar jugadores usando función pura
    const normalizedPlayers = players.map((player, index) =>
      normalizePlayer(player, index === 0 ? 'X' : 'O')
    );

    const board = createInitialBoard(boardSize);
    const history = [];
    const moveHistory = [];

    let winner = null;
    let winningLine = null;
    let result = 'incomplete';
    let message = '';

    logger.info('ARBITRATOR', 'MATCH', 'START', 'Iniciando partida', {
      players: normalizedPlayers.map(p => p.name),
      boardSize: `${boardSize}x${boardSize}`,
      noTie: noTie,
      timeoutMs: timeoutMs,
    });

    // Emitir evento de inicio de partida usando adaptador de eventos
    this.eventsAdapter.broadcastMatchStart({
      matchId: matchId,
      players: normalizedPlayers,
      boardSize: boardSize,
      timestamp: this.clock.now().toISOString(),
    });

    const maxTurns = noTie ? Infinity : boardSize * boardSize;
    for (let turn = 0; turn < maxTurns; turn += 1) {
      const playerIndex = turn % 2;
      const currentPlayer = normalizedPlayers[playerIndex];
      const opponent = normalizedPlayers[(playerIndex + 1) % 2];

      const step = {
        turn: turn + 1,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        boardBefore: [...board],
      };

      // Solicitar movimiento - diferente para humanos vs bots
      let move, error;

      if (currentPlayer.isHuman) {
        // Human player - wait for move submission via HTTP endpoint
        const humanMoveResult = await this.waitForHumanMove(
          currentPlayer,
          board,
          timeoutMs
        );
        move = humanMoveResult.move;
        error = humanMoveResult.error;
      } else {
        // Bot player - request from bot service
        const botMoveResult = await this.requestMove(
          currentPlayer,
          board,
          currentPlayer.id,
          timeoutMs
        );
        move = botMoveResult.move;
        error = botMoveResult.error;
      }

      if (error) {
        step.error = error;
        history.push(step);
        winner = opponent;
        result = 'error';
        message = `${currentPlayer.name} no pudo realizar un movimiento: ${error}`;

        logger.error(
          'ARBITRATOR',
          'MATCH',
          'MOVE_ERROR',
          'Error en movimiento',
          {
            player: currentPlayer.name,
            error: error,
            turn: turn + 1,
          }
        );

        // Emitir evento de error usando adaptador de eventos
        this.eventsAdapter.broadcastMatchError({
          matchId: matchId,
          error: error,
          player: currentPlayer,
          message: message,
          timestamp: this.clock.now().toISOString(),
        });

        break;
      }

      step.move = move;

      // Validar movimiento usando función pura
      if (!isValidMove(board, move)) {
        step.error = 'Movimiento inválido.';
        history.push(step);
        winner = opponent;
        result = 'error';
        message = `${currentPlayer.name} devolvió un movimiento inválido.`;

        logger.error(
          'ARBITRATOR',
          'MATCH',
          'INVALID_MOVE',
          'Movimiento inválido',
          {
            player: currentPlayer.name,
            move: move,
            turn: turn + 1,
          }
        );

        break;
      }

      // Actualizar tablero
      board[move] = currentPlayer.id;

      logger.debug('ARBITRATOR', 'MATCH', 'MOVE', 'Movimiento realizado', {
        player: currentPlayer.name,
        move: move,
        turn: turn + 1,
      });

      // Agregar movimiento al historial para ventana deslizante
      moveHistory.push({
        move,
        playerId: currentPlayer.id,
        turn: turn + 1,
        timestamp: this.clock.now(),
      });

      // ROLLING WINDOW: Infinity Mode - Remove oldest move if threshold reached
      // Check AFTER adding the current move to history
      if (noTie && shouldRemoveOldestMove(moveHistory)) {
        const removalPosition = getRemovalPosition(moveHistory);
        const removalPlayer = getRemovalPlayer(moveHistory, normalizedPlayers);

        moveHistory.shift(); // Remove from history
        board[removalPosition] = 0; // Clear from board

        // Emit removal event for frontend visualization
        this.eventsAdapter.broadcastMoveRemoval({
          matchId: matchId,
          position: removalPosition,
          player: removalPlayer,
          timestamp: this.clock.now().toISOString(),
        });

        logger.debug(
          'ARBITRATOR',
          'MATCH',
          'MOVE_REMOVED',
          'Infinity mode: Oldest move removed',
          {
            position: removalPosition,
            playerId: removalPlayer.id,
            turn: turn + 1,
            historyLength: moveHistory.length,
          }
        );
      }

      // Emitir evento de movimiento usando adaptador de eventos

      if (this.eventsAdapter) {
        this.eventsAdapter.broadcastMatchMove({
          matchId: matchId,
          player: currentPlayer,
          move: move,
          board: [...board],
          turn: turn + 1,
          timestamp: this.clock.now().toISOString(),
        });
        // Event emission completed
      } else {
        console.error(
          '🎮 ArbitratorCoordinator: ¡EventsAdapter es null o undefined!'
        );
      }

      step.boardAfter = [...board];
      history.push(step);

      // Verificar victoria usando función pura
      const winCheck = checkWin(board, boardSize, currentPlayer.id);
      if (winCheck) {
        winner = currentPlayer;
        winningLine = getWinningLine(board, boardSize, currentPlayer.id);
        result = 'win';
        message = `${currentPlayer.name} ganó.`;

        logger.info('ARBITRATOR', 'MATCH', 'WIN', 'Partida ganada', {
          winner: currentPlayer.name,
          winningLine: winCheck,
          turn: turn + 1,
        });

        // Emitir evento de victoria usando adaptador de eventos
        this.eventsAdapter.broadcastMatchWin({
          matchId: matchId,
          winner: currentPlayer,
          winningLine: winCheck,
          finalBoard: [...board],
          message: message,
          timestamp: this.clock.now().toISOString(),
        });

        break;
      }
    }

    // Manejar empate (solo en modo normal, no-tie nunca tiene empate)
    if (!winner && result !== 'error') {
      if (isBoardFull(board) && !noTie) {
        result = 'draw';
        message = 'Empate.';
        logger.info('ARBITRATOR', 'MATCH', 'DRAW', 'Partida empatada', {
          turn: history.length,
        });

        // Emitir evento de empate usando adaptador de eventos
        this.eventsAdapter.broadcastMatchDraw({
          matchId: matchId,
          finalBoard: [...board],
          message: message,
          timestamp: this.clock.now().toISOString(),
        });
      } else {
        // Esto nunca debería suceder en juegos implementados correctamente
        message = 'La partida no finalizó correctamente.';
        logger.warn('ARBITRATOR', 'MATCH', 'INCOMPLETE', 'Partida incompleta', {
          turn: history.length,
          noTie: noTie,
        });
      }
    }

    logger.info('ARBITRATOR', 'MATCH', 'COMPLETE', 'Partida completada', {
      result: result,
      winner: winner?.name || 'N/A',
      turns: history.length,
    });

    // Crear resultado de la partida usando función pura
    return createMatchResult({
      players: normalizedPlayers,
      history,
      winner,
      winningLine,
      result,
      message,
      finalBoard: [...board],
    });
  }

  /**
   * Solicitar un movimiento de un jugador usando adaptador HTTP
   * @param {Object} player - Objeto jugador
   * @param {Array} board - Estado actual del tablero
   * @param {number} playerId - ID del jugador (NOT sent to player - internal use only)
   * @param {number} timeoutMs - Tiempo de espera en milisegundos
   * @returns {Promise<Object>} Resultado del movimiento
   */
  async requestMove(player, board, playerId, timeoutMs) {
    // NOTE: We only send the board to the player.
    // Player apps are stateless and don't need to know their symbol.
    // The arbitrator tracks which player is which and places the correct symbol.

    // Create a copy of the player with the correct host for Docker containers
    const playerWithCorrectHost = this.getPlayerWithCorrectHost(player);
    return await this.httpAdapter.requestMove(playerWithCorrectHost, '/move', {
      params: {
        board: JSON.stringify(board),
      },
      timeout: timeoutMs,
    });
  }

  /**
   * Get player with correct host for Docker containers
   * @param {Object} player - Player object
   * @returns {Object} Player with correct host
   */
  getPlayerWithCorrectHost(player) {
    // If DOCKER_DISCOVERY is enabled, use Docker service names
    if (process.env.DOCKER_DISCOVERY === 'true') {
      const portToService = {
        3001: 'random-bot-1',
        3002: 'random-bot-2',
        3005: 'random-bot-3',
        3006: 'smart-bot-2',
        3007: 'algo-bot-1',
        3008: 'algo-bot-2',
        3009: 'algo-bot-3',
        3010: 'algo-bot-4',
      };

      const serviceName = portToService[player.port];
      if (serviceName) {
        return {
          ...player,
          host: serviceName,
        };
      }
    }

    // Fallback to original player
    return player;
  }

  /**
   * Wait for human move submission via HTTP endpoint
   * @param {Object} player - Player object
   * @param {Array} board - Current board state
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise<Object>} Move result {move, error}
   */
  async waitForHumanMove(player, board, timeoutMs) {
    return new Promise(resolve => {
      const matchId = this.currentMatchId;

      // Initialize pending moves map if not exists
      if (!this.pendingHumanMoves) {
        this.pendingHumanMoves = new Map();
      }

      this.pendingHumanMoves.set(matchId, {
        player,
        board,
        resolve,
        timeout: setTimeout(() => {
          this.pendingHumanMoves.delete(matchId);
          resolve({ move: null, error: 'Timeout waiting for human move' });
        }, timeoutMs),
      });

      this.logger.debug(
        'ARBITRATOR',
        'MATCH',
        'WAIT_HUMAN',
        'Esperando movimiento humano',
        {
          player: player.name,
          matchId: matchId,
          timeoutMs: timeoutMs,
        }
      );
    });
  }

  /**
   * Submit human move (called by HTTP endpoint)
   * @param {string} matchId - Match identifier
   * @param {string} player - Player identifier
   * @param {number} position - Move position
   * @returns {Object} Move result
   */
  submitHumanMove(matchId, player, position) {
    if (!this.pendingHumanMoves || !this.pendingHumanMoves.has(matchId)) {
      throw new Error('No pending move for this match');
    }

    const pending = this.pendingHumanMoves.get(matchId);
    clearTimeout(pending.timeout);
    this.pendingHumanMoves.delete(matchId);

    // Validate move
    if (!isValidMove(pending.board, position)) {
      throw new Error('Invalid move position');
    }

    this.logger.info(
      'ARBITRATOR',
      'MATCH',
      'HUMAN_MOVE',
      'Movimiento humano recibido',
      {
        player: player,
        position: position,
        matchId: matchId,
      }
    );

    pending.resolve({ move: position, error: null });

    return { success: true, move: position };
  }
}

/**
 * Crear coordinador del árbitro con dependencias por defecto
 * @param {Object} dependencies - Dependencias opcionales
 * @returns {ArbitratorCoordinator} Instancia del coordinador
 */
export function createArbitratorCoordinator(dependencies = {}) {
  const {
    httpAdapter = createHttpAdapter({ logger }),
    eventsAdapter = createEventsAdapter({
      eventBus: require('../../app/event-bus.js').default,
      logger,
    }),
    clock = Date,
  } = dependencies;

  return new ArbitratorCoordinator({
    httpAdapter,
    eventsAdapter,
    clock,
  });
}
