/**
 * Pruebas Unitarias: gameReducer - Acción UPDATE_BOARD
 * Pruebas de funciones puras - ejecución síncrona e instantánea
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../../src/context/gameReducer';

describe('gameReducer - UPDATE_BOARD', () => {
  test('debería actualizar tablero con nuevo estado', () => {
    const state = {
      ...initialState,
      board: Array(9).fill(0),
      moveCount: 0,
      history: [],
    };

    const action = {
      type: 'UPDATE_BOARD',
      payload: {
        board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
        history: [{ move: 0, player: 1 }],
        moveCount: 1,
      },
    };

    const result = gameReducer(state, action);

    expect(result.board).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(result.history).toHaveLength(1);
    expect(result.moveCount).toBe(1);
  });

  test('debería manejar múltiples movimientos', () => {
    const state = {
      ...initialState,
      board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
      moveCount: 1,
      history: [{ move: 0, player: 1 }],
    };

    const action = {
      type: 'UPDATE_BOARD',
      payload: {
        board: [1, 2, 0, 0, 0, 0, 0, 0, 0],
        history: [
          { move: 0, player: 1 },
          { move: 1, player: 2 },
        ],
        moveCount: 2,
      },
    };

    const result = gameReducer(state, action);

    expect(result.board).toEqual([1, 2, 0, 0, 0, 0, 0, 0, 0]);
    expect(result.history).toHaveLength(2);
    expect(result.moveCount).toBe(2);
  });

  test('debería preservar otras propiedades del estado', () => {
    const state = {
      ...initialState,
      gameState: 'playing',
      currentMatch: { matchId: 'test-123' },
    };

    const action = {
      type: 'UPDATE_BOARD',
      payload: {
        board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
        history: [],
        moveCount: 1,
      },
    };

    const result = gameReducer(state, action);

    expect(result.gameState).toBe('playing');
    expect(result.currentMatch).toEqual({ matchId: 'test-123' });
  });
});
