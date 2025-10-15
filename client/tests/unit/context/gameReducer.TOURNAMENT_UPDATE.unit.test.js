/**
 * Pruebas Unitarias: gameReducer - Acción TOURNAMENT_UPDATE
 * Pruebas de funciones puras - ejecución síncrona e instantánea
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../../src/context/gameReducer';

describe('gameReducer - TOURNAMENT_UPDATE', () => {
  test('debería actualizar datos del torneo', () => {
    const state = {
      ...initialState,
      gameState: 'tournament',
      tournament: {
        players: ['Player1', 'Player2', 'Player3', 'Player4'],
        rounds: [],
        currentRound: 1,
      },
    };

    const updatedTournament = {
      players: ['Player1', 'Player2', 'Player3', 'Player4'],
      rounds: [
        { match1: { winner: 'Player1' }, match2: { winner: 'Player3' } },
      ],
      currentRound: 2,
    };

    const action = {
      type: 'TOURNAMENT_UPDATE',
      payload: updatedTournament,
    };

    const result = gameReducer(state, action);

    expect(result.tournament).toEqual(updatedTournament);
    expect(result.tournament.currentRound).toBe(2);
    expect(result.tournament.rounds.length).toBe(1);
  });

  test('debería preservar otras propiedades del estado', () => {
    const state = {
      ...initialState,
      gameState: 'tournament',
      tournament: {
        players: ['Player1', 'Player2'],
        rounds: [],
      },
      config: { speed: 'normal', boardSize: '3x3', noTie: false },
      board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    const action = {
      type: 'TOURNAMENT_UPDATE',
      payload: {
        players: ['Player1', 'Player2'],
        rounds: [{ match1: { winner: 'Player1' } }],
      },
    };

    const result = gameReducer(state, action);

    expect(result.config).toEqual(state.config);
    expect(result.board).toEqual(state.board);
    expect(result.gameState).toBe('tournament');
  });

  test('debería manejar actualizaciones parciales del torneo', () => {
    const state = {
      ...initialState,
      tournament: {
        players: ['Player1', 'Player2'],
        rounds: [],
        currentRound: 1,
      },
    };

    const action = {
      type: 'TOURNAMENT_UPDATE',
      payload: {
        players: ['Player1', 'Player2'],
        rounds: [],
        currentRound: 1,
        bracket: {
          semifinals: [{ player1: 'Player1', player2: 'Player2' }],
        },
      },
    };

    const result = gameReducer(state, action);

    expect(result.tournament.bracket).toBeDefined();
    expect(result.tournament.bracket.semifinals.length).toBe(1);
  });

  test('debería reemplazar completamente los datos del torneo', () => {
    const state = {
      ...initialState,
      tournament: {
        players: ['Player1', 'Player2'],
        rounds: [{ match1: { winner: 'Player1' } }],
        oldData: 'should be removed',
      },
    };

    const action = {
      type: 'TOURNAMENT_UPDATE',
      payload: {
        players: ['Player3', 'Player4'],
        rounds: [{ match1: { winner: 'Player3' } }],
      },
    };

    const result = gameReducer(state, action);

    expect(result.tournament.players).toEqual(['Player3', 'Player4']);
    expect(result.tournament.oldData).toBeUndefined();
  });
});
