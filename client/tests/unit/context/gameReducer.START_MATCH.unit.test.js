/**
 * Pruebas Unitarias: gameReducer - Acción START_MATCH
 * Pruebas de función pura - ejecución síncrona e instantánea
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../../src/context/gameReducer';

describe('gameReducer - START_MATCH', () => {
  test('debería inicializar tablero 3x3 y establecer estado playing', () => {
    const state = { ...initialState };
    const action = {
      type: 'START_MATCH',
      payload: {
        matchId: 'match-123',
        players: [{ name: 'Player1' }, { name: 'Player2' }],
        boardSize: 3,
      },
    };

    const result = gameReducer(state, action);

    expect(result.gameState).toBe('playing');
    expect(result.board).toEqual(Array(9).fill(0));
    expect(result.currentMatch).toEqual(action.payload);
    expect(result.history).toEqual([]);
    expect(result.moveCount).toBe(0);
  });

  test('debería inicializar tablero 5x5', () => {
    const state = { ...initialState };
    const action = {
      type: 'START_MATCH',
      payload: {
        matchId: 'match-456',
        players: [{ name: 'Player1' }, { name: 'Player2' }],
        boardSize: 5,
      },
    };

    const result = gameReducer(state, action);

    expect(result.board).toEqual(Array(25).fill(0));
    expect(result.board.length).toBe(25);
  });

  test('debería reiniciar history y moveCount', () => {
    const state = {
      ...initialState,
      history: [{ move: 0, player: 1 }],
      moveCount: 5,
    };

    const action = {
      type: 'START_MATCH',
      payload: {
        matchId: 'match-789',
        players: [{ name: 'P1' }, { name: 'P2' }],
        boardSize: 3,
      },
    };

    const result = gameReducer(state, action);

    expect(result.history).toEqual([]);
    expect(result.moveCount).toBe(0);
  });

  test('debería almacenar todos los datos del payload de partida', () => {
    const state = { ...initialState };
    const matchData = {
      matchId: 'match-abc',
      players: [{ name: 'Alice' }, { name: 'Bob' }],
      boardSize: 3,
      speed: 'fast',
      noTie: true,
    };

    const action = {
      type: 'START_MATCH',
      payload: matchData,
    };

    const result = gameReducer(state, action);

    expect(result.currentMatch).toEqual(matchData);
  });
});
