/**
 * Pruebas Unitarias: gameReducer - Acción SET_ERROR
 * Pruebas de función pura - ejecución síncrona e instantánea
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../../src/context/gameReducer';

describe('gameReducer - SET_ERROR', () => {
  test('debería establecer gameState a error y almacenar mensaje de error', () => {
    const state = {
      ...initialState,
      gameState: 'playing',
    };

    const errorPayload = {
      message: 'Connection failed',
      code: 'ERR_CONNECTION',
    };

    const action = {
      type: 'SET_ERROR',
      payload: errorPayload,
    };

    const result = gameReducer(state, action);

    expect(result.gameState).toBe('error');
    expect(result.error).toEqual(errorPayload);
  });

  test('debería manejar payload de error como string', () => {
    const state = { ...initialState };

    const action = {
      type: 'SET_ERROR',
      payload: 'Simple error message',
    };

    const result = gameReducer(state, action);

    expect(result.gameState).toBe('error');
    expect(result.error).toBe('Simple error message');
  });

  test('debería manejar objeto de error con stack trace', () => {
    const state = {
      ...initialState,
      gameState: 'playing',
    };

    const errorPayload = {
      message: 'Unexpected error',
      code: 'ERR_UNEXPECTED',
      stack: 'Error: Unexpected error\n    at GameContext.js:123',
    };

    const action = {
      type: 'SET_ERROR',
      payload: errorPayload,
    };

    const result = gameReducer(state, action);

    expect(result.error).toEqual(errorPayload);
    expect(result.error.stack).toBeDefined();
  });

  test('debería preservar otras propiedades del estado', () => {
    const state = {
      ...initialState,
      gameState: 'playing',
      config: { speed: 'normal', boardSize: '3x3', noTie: false },
      board: [1, 2, 0, 0, 0, 0, 0, 0, 0],
      moveCount: 2,
    };

    const action = {
      type: 'SET_ERROR',
      payload: {
        message: 'Player disconnected',
        code: 'ERR_PLAYER_DISCONNECT',
      },
    };

    const result = gameReducer(state, action);

    expect(result.config).toEqual(state.config);
    expect(result.board).toEqual(state.board);
    expect(result.moveCount).toBe(2);
  });

  test('debería sobrescribir error anterior', () => {
    const state = {
      ...initialState,
      gameState: 'error',
      error: {
        message: 'Old error',
        code: 'ERR_OLD',
      },
    };

    const action = {
      type: 'SET_ERROR',
      payload: {
        message: 'New error',
        code: 'ERR_NEW',
      },
    };

    const result = gameReducer(state, action);

    expect(result.error.message).toBe('New error');
    expect(result.error.code).toBe('ERR_NEW');
  });

  test('debería manejar errores de red', () => {
    const state = {
      ...initialState,
      gameState: 'playing',
    };

    const action = {
      type: 'SET_ERROR',
      payload: {
        message: 'Network error',
        code: 'ERR_NETWORK',
        status: 500,
        url: '/api/match',
      },
    };

    const result = gameReducer(state, action);

    expect(result.error.status).toBe(500);
    expect(result.error.url).toBe('/api/match');
  });

  test('debería manejar errores de validación', () => {
    const state = {
      ...initialState,
      gameState: 'idle',
    };

    const action = {
      type: 'SET_ERROR',
      payload: {
        message: 'Invalid board configuration',
        code: 'ERR_VALIDATION',
        field: 'boardSize',
        value: '7x7',
      },
    };

    const result = gameReducer(state, action);

    expect(result.error.field).toBe('boardSize');
    expect(result.error.value).toBe('7x7');
  });

  test('debería funcionar desde cualquier estado del juego', () => {
    const states = ['idle', 'playing', 'completed', 'tournament', 'error'];

    states.forEach(gameState => {
      const state = {
        ...initialState,
        gameState,
      };

      const action = {
        type: 'SET_ERROR',
        payload: {
          message: 'Test error',
          code: 'ERR_TEST',
        },
      };

      const result = gameReducer(state, action);

      expect(result.gameState).toBe('error');
      expect(result.error.message).toBe('Test error');
    });
  });
});
