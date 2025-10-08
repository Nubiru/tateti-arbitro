/**
 * Pruebas unitarias para GameReducer
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { gameReducer, initialState } from '../../context/gameReducer';

describe('Pruebas Unitarias de GameReducer', () => {
  describe('Estado Inicial', () => {
    test('debería tener el estado inicial correcto', () => {
      expect(initialState).toEqual({
        config: null,
        gameState: 'idle',
        currentMatch: null,
        tournament: null,
        board: Array(9).fill(0),
        history: [],
        moveCount: 0,
        matchResult: null,
        tournamentResult: null,
        error: null,
      });
    });

    test('debería retornar estado inicial para acción desconocida', () => {
      const action = { type: 'UNKNOWN_ACTION' };
      const result = gameReducer(initialState, action);

      expect(result).toEqual(initialState);
    });
  });

  describe('SET_CONFIG', () => {
    test('debería establecer config y resetear estado del juego a idle', () => {
      const config = {
        gameMode: 'single',
        boardSize: '3x3',
        players: [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ],
      };

      const action = {
        type: 'SET_CONFIG',
        payload: config,
      };

      const result = gameReducer(initialState, action);

      expect(result.config).toEqual(config);
      expect(result.gameState).toBe('idle');
      expect(result).toEqual({
        ...initialState,
        config,
        gameState: 'idle',
      });
    });

    test('debería manejar config nulo', () => {
      const action = {
        type: 'SET_CONFIG',
        payload: null,
      };

      const result = gameReducer(initialState, action);

      expect(result.config).toBeNull();
      expect(result.gameState).toBe('idle');
    });
  });

  describe('START_MATCH', () => {
    test('debería iniciar partida con tablero 3x3', () => {
      const matchData = {
        players: [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ],
        boardSize: 3,
        timestamp: '2025-10-03T10:00:00.000Z',
      };

      const action = {
        type: 'START_MATCH',
        payload: matchData,
      };

      const result = gameReducer(initialState, action);

      expect(result.gameState).toBe('playing');
      expect(result.currentMatch).toEqual(matchData);
      expect(result.board).toEqual(Array(9).fill(0));
      expect(result.history).toEqual([]);
      expect(result.moveCount).toBe(0);
    });

    test('debería iniciar partida con tablero 5x5', () => {
      const matchData = {
        players: [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ],
        boardSize: 5,
        timestamp: '2025-10-03T10:00:00.000Z',
      };

      const action = {
        type: 'START_MATCH',
        payload: matchData,
      };

      const result = gameReducer(initialState, action);

      expect(result.gameState).toBe('playing');
      expect(result.currentMatch).toEqual(matchData);
      expect(result.board).toEqual(Array(25).fill(0));
      expect(result.history).toEqual([]);
      expect(result.moveCount).toBe(0);
    });

    test('debería preservar otras propiedades del estado', () => {
      const stateWithConfig = {
        ...initialState,
        config: { gameMode: 'single' },
        tournament: { id: 'test' },
      };

      const matchData = {
        players: [{ name: 'Player1', port: 3001 }],
        boardSize: 3,
        timestamp: '2025-10-03T10:00:00.000Z',
      };

      const action = {
        type: 'START_MATCH',
        payload: matchData,
      };

      const result = gameReducer(stateWithConfig, action);

      expect(result.config).toEqual({ gameMode: 'single' });
      expect(result.tournament).toEqual({ id: 'test' });
    });
  });

  describe('UPDATE_BOARD', () => {
    test('debería actualizar tablero, historial y conteo de movimientos', () => {
      const boardUpdate = {
        board: [1, 0, 0, 0, 2, 0, 0, 0, 0],
        history: [
          {
            player: 'Player1',
            position: 0,
            timestamp: '2025-10-03T10:00:00.000Z',
          },
          {
            player: 'Player2',
            position: 4,
            timestamp: '2025-10-03T10:00:01.000Z',
          },
        ],
        moveCount: 2,
      };

      const action = {
        type: 'UPDATE_BOARD',
        payload: boardUpdate,
      };

      const result = gameReducer(initialState, action);

      expect(result.board).toEqual(boardUpdate.board);
      expect(result.history).toEqual(boardUpdate.history);
      expect(result.moveCount).toBe(boardUpdate.moveCount);
    });

    test('debería preservar otras propiedades del estado', () => {
      const stateWithMatch = {
        ...initialState,
        gameState: 'playing',
        currentMatch: { id: 'test' },
      };

      const boardUpdate = {
        board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
        history: [
          {
            player: 'Player1',
            position: 0,
            timestamp: '2025-10-03T10:00:00.000Z',
          },
        ],
        moveCount: 1,
      };

      const action = {
        type: 'UPDATE_BOARD',
        payload: boardUpdate,
      };

      const result = gameReducer(stateWithMatch, action);

      expect(result.gameState).toBe('playing');
      expect(result.currentMatch).toEqual({ id: 'test' });
    });
  });

  describe('MATCH_COMPLETE', () => {
    test('debería completar partida con resultado', () => {
      const matchResult = {
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        finalBoard: [1, 1, 1, 0, 2, 0, 0, 2, 0],
        message: 'Player1 gano la partida',
      };

      const action = {
        type: 'MATCH_COMPLETE',
        payload: matchResult,
      };

      const result = gameReducer(initialState, action);

      expect(result.gameState).toBe('completed');
      expect(result.matchResult).toEqual(matchResult);
      expect(result.board).toEqual(matchResult.finalBoard);
    });

    test('debería completar partida sin finalBoard', () => {
      const stateWithBoard = {
        ...initialState,
        board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
      };

      const matchResult = {
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        message: 'Player1 gano la partida',
      };

      const action = {
        type: 'MATCH_COMPLETE',
        payload: matchResult,
      };

      const result = gameReducer(stateWithBoard, action);

      expect(result.gameState).toBe('completed');
      expect(result.matchResult).toEqual(matchResult);
      expect(result.board).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0]); // Preservado del estado
    });
  });

  describe('START_TOURNAMENT', () => {
    test('debería iniciar torneo con tablero 3x3', () => {
      const tournamentData = {
        id: 'tournament-1',
        players: [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          { name: 'Player3', port: 3003 },
          { name: 'Player4', port: 3004 },
        ],
        boardSize: 3,
        rounds: [],
      };

      const action = {
        type: 'START_TOURNAMENT',
        payload: tournamentData,
      };

      const result = gameReducer(initialState, action);

      expect(result.gameState).toBe('tournament');
      expect(result.tournament).toEqual(tournamentData);
      expect(result.currentMatch).toBeNull();
      expect(result.board).toEqual(Array(9).fill(0));
      expect(result.history).toEqual([]);
      expect(result.moveCount).toBe(0);
    });

    test('debería iniciar torneo con tablero 5x5', () => {
      const tournamentData = {
        id: 'tournament-1',
        players: [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ],
        boardSize: 5,
        rounds: [],
      };

      const action = {
        type: 'START_TOURNAMENT',
        payload: tournamentData,
      };

      const result = gameReducer(initialState, action);

      expect(result.gameState).toBe('tournament');
      expect(result.tournament).toEqual(tournamentData);
      expect(result.board).toEqual(Array(25).fill(0));
    });
  });

  describe('TOURNAMENT_UPDATE', () => {
    test('debería actualizar datos del torneo', () => {
      const stateWithTournament = {
        ...initialState,
        gameState: 'tournament',
        tournament: { id: 'tournament-1', rounds: [] },
      };

      const updatedTournament = {
        id: 'tournament-1',
        rounds: [
          {
            matchId: 'match-1',
            player1: 'Player1',
            player2: 'Player2',
            winner: 'Player1',
          },
        ],
      };

      const action = {
        type: 'TOURNAMENT_UPDATE',
        payload: updatedTournament,
      };

      const result = gameReducer(stateWithTournament, action);

      expect(result.tournament).toEqual(updatedTournament);
      expect(result.gameState).toBe('tournament'); // Preservado
    });
  });

  describe('TOURNAMENT_COMPLETE', () => {
    test('debería completar torneo con resultado', () => {
      const tournamentResult = {
        id: 'tournament-1',
        winner: { name: 'Player1', port: 3001 },
        rounds: [
          {
            matchId: 'match-1',
            player1: 'Player1',
            player2: 'Player2',
            winner: 'Player1',
          },
        ],
        completedAt: '2025-10-03T10:00:00.000Z',
      };

      const action = {
        type: 'TOURNAMENT_COMPLETE',
        payload: tournamentResult,
      };

      const result = gameReducer(initialState, action);

      expect(result.gameState).toBe('completed');
      expect(result.tournament).toEqual(tournamentResult);
      expect(result.tournamentResult).toEqual(tournamentResult);
    });
  });

  describe('RESET_GAME', () => {
    test('debería resetear juego al estado inicial', () => {
      const stateWithData = {
        config: { gameMode: 'single' },
        gameState: 'completed',
        currentMatch: { id: 'match-1' },
        tournament: { id: 'tournament-1' },
        board: [1, 1, 1, 0, 0, 0, 0, 0, 0],
        history: [{ player: 'Player1', position: 0 }],
        moveCount: 3,
        matchResult: { winner: 'Player1' },
        tournamentResult: { winner: 'Player1' },
        error: null,
      };

      const action = {
        type: 'RESET_GAME',
      };

      const result = gameReducer(stateWithData, action);

      expect(result).toEqual({
        ...initialState,
        config: { gameMode: 'single' }, // Config es preservado
      });
    });

    test('debería resetear desde cualquier estado', () => {
      const stateWithError = {
        ...initialState,
        gameState: 'error',
        error: 'Error de prueba',
      };

      const action = {
        type: 'RESET_GAME',
      };

      const result = gameReducer(stateWithError, action);

      expect(result.gameState).toBe('idle');
      expect(result.error).toBeNull();
      expect(result.currentMatch).toBeNull();
      expect(result.tournament).toBeNull();
    });
  });

  describe('SET_ERROR', () => {
    test('debería establecer estado de error', () => {
      const error = 'Conexión fallida';

      const action = {
        type: 'SET_ERROR',
        payload: error,
      };

      const result = gameReducer(initialState, action);

      expect(result.gameState).toBe('error');
      expect(result.error).toBe(error);
    });

    test('debería establecer error desde cualquier estado', () => {
      const stateWithMatch = {
        ...initialState,
        gameState: 'playing',
        currentMatch: { id: 'match-1' },
      };

      const error = 'Partida fallida';

      const action = {
        type: 'SET_ERROR',
        payload: error,
      };

      const result = gameReducer(stateWithMatch, action);

      expect(result.gameState).toBe('error');
      expect(result.error).toBe(error);
      expect(result.currentMatch).toEqual({ id: 'match-1' }); // Preservado
    });
  });

  describe('Inmutabilidad', () => {
    test('no debería mutar el estado original', () => {
      const originalState = { ...initialState };
      const action = {
        type: 'SET_CONFIG',
        payload: { gameMode: 'single' },
      };

      gameReducer(originalState, action);

      expect(originalState).toEqual(initialState);
    });

    test('debería crear nuevo objeto de estado', () => {
      const action = {
        type: 'SET_CONFIG',
        payload: { gameMode: 'single' },
      };

      const result = gameReducer(initialState, action);

      expect(result).not.toBe(initialState);
      expect(result).toEqual({
        ...initialState,
        config: { gameMode: 'single' },
        gameState: 'idle',
      });
    });

    test('debería crear nuevo array de tablero', () => {
      const action = {
        type: 'UPDATE_BOARD',
        payload: {
          board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
          history: [],
          moveCount: 1,
        },
      };

      const result = gameReducer(initialState, action);

      expect(result.board).not.toBe(initialState.board);
      expect(result.board).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0]);
    });
  });
});
