/**
 * Game state reducer - pure function for state management
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

// Estado inicial
export const initialState = {
  config: null,
  gameState: 'idle', // 'idle', 'playing', 'completed', 'tournament', 'tournament_completed', 'error'
  currentMatch: null,
  tournament: null,
  board: Array(9).fill(0),
  history: [],
  moveCount: 0,
  matchResult: null,
  tournamentResult: null,
  error: null,
};

// Reductor de estado del juego
export const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        config: action.payload,
        gameState: 'idle',
      };

    case 'START_MATCH':
      return {
        ...state,
        gameState: 'playing',
        currentMatch: action.payload,
        board:
          action.payload.boardSize === 5 ? Array(25).fill(0) : Array(9).fill(0),
        history: [],
        moveCount: 0,
      };

    case 'UPDATE_BOARD':
      return {
        ...state,
        board: action.payload.board,
        history: action.payload.history,
        moveCount: action.payload.moveCount,
      };

    case 'UPDATE_MATCH_DATA':
      return {
        ...state,
        currentMatch: {
          ...state.currentMatch,
          ...action.payload,
        },
      };

    case 'MATCH_COMPLETE':
      return {
        ...state,
        gameState: 'completed',
        matchResult: action.payload,
        board: action.payload.finalBoard || state.board,
      };

    case 'START_TOURNAMENT':
      return {
        ...state,
        gameState: 'tournament',
        tournament: action.payload,
        currentMatch: null,
        board:
          action.payload.boardSize === 5 ? Array(25).fill(0) : Array(9).fill(0),
        history: [],
        moveCount: 0,
      };

    case 'TOURNAMENT_UPDATE':
      return {
        ...state,
        tournament: action.payload,
      };

    case 'TOURNAMENT_COMPLETE':
      return {
        ...state,
        gameState: 'completed',
        tournament: action.payload,
        tournamentResult: action.payload,
      };

    case 'RESET_GAME':
      return {
        ...state,
        gameState: 'idle',
        currentMatch: null,
        tournament: null,
        board: Array(9).fill(0),
        history: [],
        moveCount: 0,
        matchResult: null,
        tournamentResult: null,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        gameState: 'error',
        error: action.payload,
      };

    default:
      return state;
  }
};
