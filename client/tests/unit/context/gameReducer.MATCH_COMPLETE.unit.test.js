/**
 * Pruebas Unitarias: gameReducer - Acción MATCH_COMPLETE
 * Pruebas de funciones puras - ejecución síncrona e instantánea
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../../src/context/gameReducer';

describe('gameReducer - MATCH_COMPLETE', () => {
  test('debería establecer gameState a completed y almacenar resultado de partida', () => {
    const state = {
      ...initialState,
      gameState: 'playing',
      board: [1, 2, 1, 2, 1, 2, 1, 0, 0],
      moveCount: 7,
    };

    const matchResult = {
      winner: 'Player1',
      reason: 'Three in a row',
      moves: 7,
      finalBoard: [1, 2, 1, 2, 1, 2, 1, 0, 2],
    };

    const action = {
      type: 'MATCH_COMPLETE',
      payload: matchResult,
    };

    const result = gameReducer(state, action);

    expect(result.gameState).toBe('completed');
    expect(result.matchResult).toEqual(matchResult);
    expect(result.board).toEqual(matchResult.finalBoard);
  });

  test('debería preservar tablero actual si finalBoard no se proporciona', () => {
    const state = {
      ...initialState,
      gameState: 'playing',
      board: [1, 2, 1, 2, 1, 2, 1, 0, 0],
    };

    const matchResult = {
      winner: 'Player2',
      reason: 'Opponent disconnected',
      moves: 7,
    };

    const action = {
      type: 'MATCH_COMPLETE',
      payload: matchResult,
    };

    const result = gameReducer(state, action);

    expect(result.board).toEqual(state.board);
    expect(result.matchResult).toEqual(matchResult);
  });

  test('debería manejar resultado de empate', () => {
    const state = {
      ...initialState,
      gameState: 'playing',
    };

    const matchResult = {
      winner: null,
      reason: 'Draw',
      moves: 9,
      finalBoard: [1, 2, 1, 2, 1, 2, 2, 1, 2],
    };

    const action = {
      type: 'MATCH_COMPLETE',
      payload: matchResult,
    };

    const result = gameReducer(state, action);

    expect(result.gameState).toBe('completed');
    expect(result.matchResult.winner).toBeNull();
    expect(result.matchResult.reason).toBe('Draw');
  });

  test('debería preservar otras propiedades del estado', () => {
    const state = {
      ...initialState,
      gameState: 'playing',
      config: { speed: 'normal', boardSize: '3x3', noTie: false },
      moveCount: 5,
    };

    const action = {
      type: 'MATCH_COMPLETE',
      payload: {
        winner: 'Player1',
        reason: 'Win',
        moves: 5,
      },
    };

    const result = gameReducer(state, action);

    expect(result.config).toEqual(state.config);
    expect(result.moveCount).toBe(5);
  });
});
