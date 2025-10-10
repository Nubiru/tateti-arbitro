/**
 * Unit Tests: gameReducer - SET_CONFIG action
 * Pure function tests - synchronous, instant execution
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../../src/context/gameReducer';

describe('gameReducer - SET_CONFIG', () => {
  test('should set config and reset game state to idle', () => {
    const state = {
      ...initialState,
      gameState: 'playing',
      config: null,
    };

    const action = {
      type: 'SET_CONFIG',
      payload: {
        speed: 'slow',
        boardSize: '3x3',
        noTie: true,
      },
    };

    const result = gameReducer(state, action);

    expect(result.config).toEqual({
      speed: 'slow',
      boardSize: '3x3',
      noTie: true,
    });
    expect(result.gameState).toBe('idle');
  });

  test('should preserve other state properties', () => {
    const state = {
      ...initialState,
      board: [1, 2, 0, 0, 0, 0, 0, 0, 0],
      moveCount: 2,
    };

    const action = {
      type: 'SET_CONFIG',
      payload: { speed: 'fast', boardSize: '3x3', noTie: false },
    };

    const result = gameReducer(state, action);

    expect(result.board).toEqual(state.board);
    expect(result.moveCount).toBe(2);
  });

  test('should handle empty config', () => {
    const state = { ...initialState };
    const action = {
      type: 'SET_CONFIG',
      payload: {},
    };

    const result = gameReducer(state, action);

    expect(result.config).toEqual({});
    expect(result.gameState).toBe('idle');
  });

  test('should overwrite previous config', () => {
    const state = {
      ...initialState,
      config: { speed: 'normal', boardSize: '3x3', noTie: false },
    };

    const action = {
      type: 'SET_CONFIG',
      payload: { speed: 'fast', boardSize: '5x5', noTie: true },
    };

    const result = gameReducer(state, action);

    expect(result.config.speed).toBe('fast');
    expect(result.config.boardSize).toBe('5x5');
    expect(result.config.noTie).toBe(true);
  });
});
