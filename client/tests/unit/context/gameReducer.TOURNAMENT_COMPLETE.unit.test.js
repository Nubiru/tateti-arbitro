/**
 * Unit Tests: gameReducer - TOURNAMENT_COMPLETE action
 * Pure function tests - synchronous, instant execution
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../../src/context/gameReducer';

describe('gameReducer - TOURNAMENT_COMPLETE', () => {
  test('should set gameState to completed and store tournament result', () => {
    const state = {
      ...initialState,
      gameState: 'tournament',
      tournament: {
        players: ['Player1', 'Player2', 'Player3', 'Player4'],
        rounds: [
          { match1: { winner: 'Player1' }, match2: { winner: 'Player3' } },
        ],
      },
    };

    const tournamentResult = {
      players: ['Player1', 'Player2', 'Player3', 'Player4'],
      rounds: [
        { match1: { winner: 'Player1' }, match2: { winner: 'Player3' } },
        { final: { winner: 'Player1' } },
      ],
      winner: 'Player1',
    };

    const action = {
      type: 'TOURNAMENT_COMPLETE',
      payload: tournamentResult,
    };

    const result = gameReducer(state, action);

    expect(result.gameState).toBe('completed');
    expect(result.tournament).toEqual(tournamentResult);
    expect(result.tournamentResult).toEqual(tournamentResult);
  });

  test('should preserve tournament data in both tournament and tournamentResult', () => {
    const state = {
      ...initialState,
      gameState: 'tournament',
      tournament: {
        players: ['Player1', 'Player2'],
      },
    };

    const tournamentResult = {
      players: ['Player1', 'Player2'],
      winner: 'Player1',
      totalMatches: 3,
    };

    const action = {
      type: 'TOURNAMENT_COMPLETE',
      payload: tournamentResult,
    };

    const result = gameReducer(state, action);

    expect(result.tournament).toEqual(tournamentResult);
    expect(result.tournamentResult).toEqual(tournamentResult);
    expect(result.tournament).toBe(result.tournamentResult);
  });

  test('should preserve other state properties', () => {
    const state = {
      ...initialState,
      gameState: 'tournament',
      config: { speed: 'slow', boardSize: '3x3', noTie: false },
      board: [1, 2, 1, 0, 0, 0, 0, 0, 0],
    };

    const action = {
      type: 'TOURNAMENT_COMPLETE',
      payload: {
        players: ['Player1', 'Player2'],
        winner: 'Player1',
      },
    };

    const result = gameReducer(state, action);

    expect(result.config).toEqual(state.config);
    expect(result.board).toEqual(state.board);
  });

  test('should handle 8-player tournament result', () => {
    const state = {
      ...initialState,
      gameState: 'tournament',
    };

    const tournamentResult = {
      players: [
        'Player1',
        'Player2',
        'Player3',
        'Player4',
        'Player5',
        'Player6',
        'Player7',
        'Player8',
      ],
      rounds: [
        {
          match1: { winner: 'Player1' },
          match2: { winner: 'Player3' },
          match3: { winner: 'Player5' },
          match4: { winner: 'Player7' },
        },
        {
          match1: { winner: 'Player1' },
          match2: { winner: 'Player5' },
        },
        {
          final: { winner: 'Player1' },
        },
      ],
      winner: 'Player1',
    };

    const action = {
      type: 'TOURNAMENT_COMPLETE',
      payload: tournamentResult,
    };

    const result = gameReducer(state, action);

    expect(result.gameState).toBe('completed');
    expect(result.tournamentResult.winner).toBe('Player1');
    expect(result.tournamentResult.players.length).toBe(8);
  });
});
