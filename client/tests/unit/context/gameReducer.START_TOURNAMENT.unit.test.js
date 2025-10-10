/**
 * Unit Tests: gameReducer - START_TOURNAMENT action
 * Pure function tests - synchronous, instant execution
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../../src/context/gameReducer';

describe('gameReducer - START_TOURNAMENT', () => {
  test('should set gameState to tournament and initialize tournament data', () => {
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

  test('should initialize 5x5 board when boardSize is 5', () => {
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

  test('should initialize 3x3 board when boardSize is 3', () => {
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

  test('should clear previous match data', () => {
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

  test('should preserve config when starting tournament', () => {
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
