/**
 * Game State Reducer - Pure Function
 * Handles all game state transitions
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

/**
 * Initial game state
 */
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
  nextRemovalPosition: null, // For infinity mode pulsating animation
};

/**
 * Game reducer - handles all state transitions
 * Pure function: same input always produces same output
 * @param {Object} state - Current state
 * @param {Object} action - Action with type and payload
 * @returns {Object} New state
 */
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

    case 'REMOVE_MOVE': {
      // Infinity mode: Remove oldest move from board
      const newBoard = [...state.board];
      newBoard[action.payload.position] = 0;
      return {
        ...state,
        board: newBoard,
        // Track next removal position for pulsating effect
        nextRemovalPosition:
          state.moveCount >= 5 ? state.history?.[0]?.move || null : null,
      };
    }

    default:
      return state;
  }
};
