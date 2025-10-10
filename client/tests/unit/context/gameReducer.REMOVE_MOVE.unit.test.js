/**
 * Unit Tests: gameReducer - REMOVE_MOVE action (Infinity Mode)
 * Pure function tests - synchronous, instant execution
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../../src/context/gameReducer';

describe('gameReducer - REMOVE_MOVE (Infinity Mode)', () => {
  test('should clear board position', () => {
    const state = {
      ...initialState,
      board: [1, 2, 1, 2, 0, 0, 0, 0, 0],
      moveCount: 4,
    };

    const action = {
      type: 'REMOVE_MOVE',
      payload: { position: 0 },
    };

    const result = gameReducer(state, action);

    expect(result.board[0]).toBe(0);
    expect(result.board[1]).toBe(2); // Other positions unchanged
    expect(result.board[2]).toBe(1);
  });

  test('should set nextRemovalPosition when moveCount >= 5', () => {
    const state = {
      ...initialState,
      board: [1, 2, 1, 2, 1, 0, 0, 0, 0],
      moveCount: 5,
      history: [
        { move: 1, player: 2 },
        { move: 2, player: 1 },
      ],
    };

    const action = {
      type: 'REMOVE_MOVE',
      payload: { position: 0 },
    };

    const result = gameReducer(state, action);

    expect(result.nextRemovalPosition).toBe(1);
  });

  test('should not set nextRemovalPosition when moveCount < 5', () => {
    const state = {
      ...initialState,
      board: [1, 2, 1, 0, 0, 0, 0, 0, 0],
      moveCount: 3,
      history: [{ move: 0, player: 1 }],
    };

    const action = {
      type: 'REMOVE_MOVE',
      payload: { position: 0 },
    };

    const result = gameReducer(state, action);

    expect(result.nextRemovalPosition).toBeNull();
  });

  test('should handle removal from any position', () => {
    const state = {
      ...initialState,
      board: [1, 2, 1, 2, 1, 2, 0, 0, 0],
      moveCount: 6,
    };

    const action = {
      type: 'REMOVE_MOVE',
      payload: { position: 4 },
    };

    const result = gameReducer(state, action);

    expect(result.board[4]).toBe(0);
    expect(result.board[0]).toBe(1); // Others unchanged
    expect(result.board[5]).toBe(2);
  });

  test('should not mutate original board', () => {
    const state = {
      ...initialState,
      board: [1, 2, 1, 2, 0, 0, 0, 0, 0],
    };

    const originalBoard = [...state.board];

    const action = {
      type: 'REMOVE_MOVE',
      payload: { position: 0 },
    };

    gameReducer(state, action);

    expect(state.board).toEqual(originalBoard);
  });
});
