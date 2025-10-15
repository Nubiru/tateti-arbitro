/**
 * Pruebas Unitarias: gameReducer - Acción START_TOURNAMENT
 * Pruebas de funciones puras - ejecución síncrona e instantánea
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../../src/context/gameReducer';

describe('gameReducer - START_TOURNAMENT', () => {
  test('debería establecer gameState a tournament e inicializar datos del torneo', () => {
    const state = { ...initialState };

    const tournamentData = {
      players: ['Player1', 'Player2', 'Player3', 'Player4'],
      boardSize: 3,
      rounds: [],
    };

    const action = {
      type: 'START_TOURNAMENT',
      payload: tournamentData,
    };

    const result = gameReducer(state, action);

    expect(result.gameState).toBe('tournament');
    expect(result.tournament).toEqual(tournamentData);
    expect(result.currentMatch).toBeNull();
    expect(result.board).toEqual(Array(9).fill(0));
    expect(result.history).toEqual([]);
    expect(result.moveCount).toBe(0);
  });

  test('debería inicializar tablero 5x5 cuando boardSize es 5', () => {
    const state = { ...initialState };

    const action = {
      type: 'START_TOURNAMENT',
      payload: {
        players: ['Player1', 'Player2'],
        boardSize: 5,
        rounds: [],
      },
    };

    const result = gameReducer(state, action);

    expect(result.board).toEqual(Array(25).fill(0));
    expect(result.board.length).toBe(25);
  });

  test('debería inicializar tablero 3x3 cuando boardSize es 3', () => {
    const state = { ...initialState };

    const action = {
      type: 'START_TOURNAMENT',
      payload: {
        players: ['Player1', 'Player2'],
        boardSize: 3,
        rounds: [],
      },
    };

    const result = gameReducer(state, action);

    expect(result.board).toEqual(Array(9).fill(0));
    expect(result.board.length).toBe(9);
  });

  test('debería limpiar datos de partida anterior', () => {
    const state = {
      ...initialState,
      currentMatch: {
        player1: 'OldPlayer1',
        player2: 'OldPlayer2',
      },
      board: [1, 2, 1, 0, 0, 0, 0, 0, 0],
      moveCount: 3,
    };

    const action = {
      type: 'START_TOURNAMENT',
      payload: {
        players: ['NewPlayer1', 'NewPlayer2'],
        boardSize: 3,
        rounds: [],
      },
    };

    const result = gameReducer(state, action);

    expect(result.currentMatch).toBeNull();
    expect(result.board).toEqual(Array(9).fill(0));
    expect(result.moveCount).toBe(0);
  });

  test('debería preservar configuración al iniciar torneo', () => {
    const state = {
      ...initialState,
      config: { speed: 'fast', boardSize: '3x3', noTie: true },
    };

    const action = {
      type: 'START_TOURNAMENT',
      payload: {
        players: ['Player1', 'Player2'],
        boardSize: 3,
        rounds: [],
      },
    };

    const result = gameReducer(state, action);

    expect(result.config).toEqual(state.config);
  });
});
