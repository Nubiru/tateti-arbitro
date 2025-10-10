/**
 * Unit Tests: gameReducer - MATCH_COMPLETE action
 * Pure function tests - synchronous, instant execution
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../../src/context/gameReducer';

describe('gameReducer - MATCH_COMPLETE', () => {
  test('should set gameState to completed and store match result', () => {
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

  test('should preserve current board if finalBoard not provided', () => {
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

  test('should handle draw result', () => {
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

  test('should preserve other state properties', () => {
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
