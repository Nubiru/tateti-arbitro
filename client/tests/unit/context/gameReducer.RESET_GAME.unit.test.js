/**
 * Unit Tests: gameReducer - RESET_GAME action
 * Pure function tests - synchronous, instant execution
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../../src/context/gameReducer';

describe('gameReducer - RESET_GAME', () => {
  test('should reset game to idle state', () => {
    const state = {
      ...initialState,
      gameState: 'completed',
      currentMatch: {
        player1: 'Player1',
        player2: 'Player2',
      },
      board: [1, 2, 1, 2, 1, 2, 1, 2, 1],
      history: [
        { move: 0, player: 1 },
        { move: 1, player: 2 },
      ],
      moveCount: 9,
      matchResult: {
        winner: 'Player1',
        reason: 'Win',
      },
    };

    const action = { type: 'RESET_GAME' };

    const result = gameReducer(state, action);

    expect(result.gameState).toBe('idle');
    expect(result.currentMatch).toBeNull();
    expect(result.board).toEqual(Array(9).fill(0));
    expect(result.history).toEqual([]);
    expect(result.moveCount).toBe(0);
    expect(result.matchResult).toBeNull();
  });

  test('should clear tournament data', () => {
    const state = {
      ...initialState,
      gameState: 'completed',
      tournament: {
        players: ['Player1', 'Player2', 'Player3', 'Player4'],
        rounds: [{ match1: { winner: 'Player1' } }],
      },
      tournamentResult: {
        winner: 'Player1',
      },
    };

    const action = { type: 'RESET_GAME' };

    const result = gameReducer(state, action);

    expect(result.tournament).toBeNull();
    expect(result.tournamentResult).toBeNull();
  });

  test('should clear error state', () => {
    const state = {
      ...initialState,
      gameState: 'error',
      error: {
        message: 'Connection failed',
        code: 'ERR_CONNECTION',
      },
    };

    const action = { type: 'RESET_GAME' };

    const result = gameReducer(state, action);

    expect(result.gameState).toBe('idle');
    expect(result.error).toBeNull();
  });

  test('should preserve config', () => {
    const state = {
      ...initialState,
      gameState: 'completed',
      config: { speed: 'fast', boardSize: '5x5', noTie: true },
      board: [1, 2, 1, 2, 1, 2, 1, 2, 1],
      moveCount: 9,
    };

    const action = { type: 'RESET_GAME' };

    const result = gameReducer(state, action);

    expect(result.config).toEqual(state.config);
    expect(result.board).toEqual(Array(9).fill(0));
  });

  test('should work from any game state', () => {
    const states = ['idle', 'playing', 'completed', 'tournament', 'error'];

    states.forEach(gameState => {
      const state = {
        ...initialState,
        gameState,
        board: [1, 2, 1, 0, 0, 0, 0, 0, 0],
        moveCount: 3,
      };

      const action = { type: 'RESET_GAME' };
      const result = gameReducer(state, action);

      expect(result.gameState).toBe('idle');
      expect(result.board).toEqual(Array(9).fill(0));
      expect(result.moveCount).toBe(0);
    });
  });

  test('should handle resetting a partially played game', () => {
    const state = {
      ...initialState,
      gameState: 'playing',
      currentMatch: {
        player1: 'Player1',
        player2: 'Player2',
        boardSize: 3,
      },
      board: [1, 2, 0, 2, 1, 0, 0, 0, 0],
      history: [
        { move: 0, player: 1 },
        { move: 1, player: 2 },
        { move: 3, player: 2 },
        { move: 4, player: 1 },
      ],
      moveCount: 4,
    };

    const action = { type: 'RESET_GAME' };

    const result = gameReducer(state, action);

    expect(result.gameState).toBe('idle');
    expect(result.currentMatch).toBeNull();
    expect(result.board).toEqual(Array(9).fill(0));
    expect(result.history).toEqual([]);
    expect(result.moveCount).toBe(0);
  });
});
