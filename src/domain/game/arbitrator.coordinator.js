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
  isBoardFull,
  isValidMove,
  createInitialBoard,
  processMove,
  createMatchResult,
  applyRollingWindow,
} from './arbitrator.core.js';
import { createHttpAdapter } from './http.adapter.js';
import { createEventsAdapter } from './events.adapter.js';
import logger from '../../app/logger.js';

/**
 * Coordinador del Árbitro usando Inyección de Dependencias
 * @lastModified 2025-10-03
 * @version 1.0.0
 */
export class ArbitratorCoordinator {
  constructor({ httpAdapter, eventsAdapter, clock = Date }) {
    this.httpAdapter = httpAdapter;
    this.eventsAdapter = eventsAdapter;
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

    // Validar jugadores usando función pura
    validatePlayers(players);

    // Normalizar jugadores usando función pura
    const normalizedPlayers = players.map((player, index) =>
      normalizePlayer(player, index + 1)
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

      // Solicitar movimiento usando adaptador HTTP
      const { move, error } = await this.requestMove(
        currentPlayer,
        board,
        currentPlayer.id,
        timeoutMs
      );

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

      // Procesar movimiento usando función pura
      const moveResult = processMove(board, move, currentPlayer.id, boardSize);
      if (!moveResult.success) {
        step.error = moveResult.error;
        history.push(step);
        winner = opponent;
        result = 'error';
        message = `${currentPlayer.name} eligió una casilla ocupada.`;

        logger.error(
          'ARBITRATOR',
          'MATCH',
          'OCCUPIED_CELL',
          'Casilla ocupada',
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

      // Emitir evento de movimiento usando adaptador de eventos
      this.eventsAdapter.broadcastMatchMove({
        player: currentPlayer,
        move: move,
        board: [...board],
        turn: turn + 1,
        timestamp: this.clock.now().toISOString(),
      });

      // Agregar movimiento al historial para ventana deslizante
      moveHistory.push({
        move,
        playerId: currentPlayer.id,
        turn: turn + 1,
        timestamp: this.clock.now(),
      });

      // Aplicar ventana deslizante para modo no-tie usando función pura
      if (noTie) {
        applyRollingWindow(board, moveHistory);
      }

      step.boardAfter = [...board];
      history.push(step);

      // Verificar victoria usando función pura
      const winCheck = checkWin(board, boardSize);
      if (winCheck) {
        winner = currentPlayer;
        winningLine = winCheck;
        result = 'win';
        message = `${currentPlayer.name} ganó.`;

        logger.info('ARBITRATOR', 'MATCH', 'WIN', 'Partida ganada', {
          winner: currentPlayer.name,
          winningLine: winCheck,
          turn: turn + 1,
        });

        // Emitir evento de victoria usando adaptador de eventos
        this.eventsAdapter.broadcastMatchWin({
          winner: currentPlayer,
          winningLine: winCheck,
          finalBoard: [...board],
          message: message,
          timestamp: this.clock.now().toISOString(),
        });

        break;
      }
    }

    // Manejar empate o juego incompleto
    if (!winner && result !== 'error') {
      if (noTie) {
        message = 'La partida no finalizó correctamente.';
        logger.warn(
          'ARBITRATOR',
          'MATCH',
          'INCOMPLETE',
          'Partida incompleta en modo no-tie',
          {
            turn: history.length,
          }
        );
      } else if (isBoardFull(board)) {
        result = 'draw';
        message = 'Empate.';
        logger.info('ARBITRATOR', 'MATCH', 'DRAW', 'Partida empatada', {
          turn: history.length,
        });

        // Emitir evento de empate usando adaptador de eventos
        this.eventsAdapter.broadcastMatchDraw({
          finalBoard: [...board],
          message: message,
          timestamp: this.clock.now().toISOString(),
        });
      } else {
        message = 'La partida no finalizó correctamente.';
        logger.warn('ARBITRATOR', 'MATCH', 'INCOMPLETE', 'Partida incompleta', {
          turn: history.length,
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
   * @param {number} playerId - ID del jugador
   * @param {number} timeoutMs - Tiempo de espera en milisegundos
   * @returns {Promise<Object>} Resultado del movimiento
   */
  async requestMove(player, board, playerId, timeoutMs) {
    return await this.httpAdapter.requestMove(player, '/move', {
      params: {
        board: JSON.stringify(board),
        player: playerId,
      },
      timeout: timeoutMs,
    });
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
