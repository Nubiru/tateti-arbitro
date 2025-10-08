import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from 'react';

/**
 * Contexto de Juego para gestión centralizada de estado
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const GameContext = createContext();

// Reductor de estado del juego
const gameReducer = (state, action) => {
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

    default:
      return state;
  }
};

// Estado inicial
const initialState = {
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

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [sseConnection, setSseConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'disconnected', 'error'

  // manejo de conexión SSE con el servidor
  useEffect(() => {
    let eventSource = null;
    let reconnectTimeout = null;
    let isConnecting = false;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;

    const connectSSE = () => {
      if (isConnecting) return;
      isConnecting = true;

      // Clean up any existing connection
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }

      eventSource = new EventSource('/api/stream');

      eventSource.onopen = () => {
        setSseConnection(eventSource);
        setConnectionStatus('connected');
        isConnecting = false;
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      };

      eventSource.onmessage = () => {
        try {
          // const data = JSON.parse(event.data);
          // handleSSEEvent(data);
        } catch (error) {
          // Error parsing SSE message - could be logged in development
        }
      };

      eventSource.addEventListener('match:start', event => {
        const data = JSON.parse(event.data);
        dispatch({
          type: 'START_MATCH',
          payload: {
            matchId: data.matchId,
            players: data.players,
            boardSize: data.boardSize,
            timestamp: data.timestamp,
          },
        });
      });

      eventSource.addEventListener('match:move', event => {
        const data = JSON.parse(event.data);
        dispatch({
          type: 'UPDATE_BOARD',
          payload: {
            board: data.board,
            history: data.history || [],
            moveCount: data.turn || 0,
            currentPlayer: data.player,
            move: data.move,
          },
        });
      });

      eventSource.addEventListener('match:win', event => {
        const data = JSON.parse(event.data);
        dispatch({
          type: 'MATCH_COMPLETE',
          payload: {
            winner: data.winner,
            winningLine: data.winningLine,
            finalBoard: data.finalBoard,
            message: data.message,
            timestamp: data.timestamp,
          },
        });
      });

      eventSource.addEventListener('match:error', event => {
        const data = JSON.parse(event.data);
        dispatch({
          type: 'SET_ERROR',
          payload: data.message || 'Error en la partida',
        });
      });

      eventSource.addEventListener('match:draw', event => {
        const data = JSON.parse(event.data);
        dispatch({
          type: 'MATCH_COMPLETE',
          payload: {
            winner: null,
            winningLine: null,
            finalBoard: data.finalBoard,
            message: data.message,
            timestamp: data.timestamp,
          },
        });
      });

      eventSource.addEventListener('tournament:start', event => {
        const data = JSON.parse(event.data);
        dispatch({
          type: 'START_TOURNAMENT',
          payload: {
            players: data.players,
            boardSize: data.boardSize,
            rounds: data.rounds,
            timestamp: data.timestamp,
          },
        });
      });

      eventSource.addEventListener('tournament:complete', event => {
        const data = JSON.parse(event.data);
        dispatch({
          type: 'TOURNAMENT_COMPLETE',
          payload: {
            winner: data.winner,
            runnerUp: data.runnerUp,
            rounds: data.rounds,
            message: data.message,
            timestamp: data.timestamp,
          },
        });
      });

      eventSource.onerror = _error => {
        // SSE connection error - could be logged in development
        setSseConnection(null);
        isConnecting = false;

        // Show user-friendly retry message with exponential backoff
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          setConnectionStatus('connecting');
          reconnectAttempts++;
          reconnectTimeout = setTimeout(
            () => {
              reconnectTimeout = null;
              connectSSE();
            },
            Math.min(1000 * reconnectAttempts, 5000)
          ); // Exponential backoff: 1s, 2s, 3s, 4s, 5s max
        } else {
          setConnectionStatus('error');
        }
      };
    };

    // Handle page unload/refresh
    const handleBeforeUnload = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    // Add cleanup listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleBeforeUnload);

    connectSSE();

    return () => {
      // Clean up listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleBeforeUnload);

      // Clean up connection
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      setSseConnection(null);
    };
  }, []); // Empty dependency array - only run once

  // Acciones del juego
  const startMatch = async (player1, player2, options = {}) => {
    try {
      const requestBody = {
        player1,
        player2,
        ...options,
      };

      // Dispatch START_MATCH immediately to set state to 'playing'
      // This ensures the ProgressScreen is shown while the API call is in progress
      dispatch({
        type: 'START_MATCH',
        payload: {
          matchId: `temp-${Date.now()}`, // Temporary ID until we get the real one
          players: [player1, player2],
          boardSize: options.boardSize || 3,
          currentPlayer: player1,
          waitingForHuman: player1.type === 'human' || player2.type === 'human',
        },
      });

      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response || !response.ok) {
        const errorMessage = `Error HTTP! estado: ${
          response?.status || 'Sin respuesta'
        }`;
        // API Error - could be logged in development
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return { error: errorMessage };
      }

      const result = await response.json();

      // Update the match data with the real matchId and other details from the server
      if (result.matchId) {
        dispatch({
          type: 'UPDATE_MATCH_DATA',
          payload: {
            matchId: result.matchId,
            players: result.players || [player1, player2],
            boardSize: result.boardSize || options.boardSize || 3,
            currentPlayer: result.currentPlayer || player1,
            waitingForHuman:
              result.waitingForHuman ||
              player1.type === 'human' ||
              player2.type === 'human',
          },
        });
      }

      return result;
    } catch (error) {
      // Error al iniciar partida - será manejado por el límite de error
      // startMatch error - could be logged in development
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { error: error.message };
    }
  };

  const startTournament = async (players, options = {}) => {
    try {
      const requestBody = {
        players,
        ...options,
      };

      const response = await fetch('/api/tournament', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response || !response.ok) {
        const errorMessage = `Error HTTP! estado: ${
          response?.status || 'Sin respuesta'
        }`;
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return { error: errorMessage };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      // Error al iniciar torneo - será manejado por el límite de error
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { error: error.message };
    }
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const submitMove = async position => {
    try {
      if (!state.currentMatch || !state.currentMatch.matchId) {
        throw new Error('No active match found');
      }

      // Determine which player is human and should make the move
      const currentPlayer = state.currentMatch.players[state.moveCount % 2];
      const playerId = state.moveCount % 2 === 0 ? 'player1' : 'player2';

      const response = await fetch(
        `/api/match/${state.currentMatch.matchId}/move`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            player: playerId,
            position: position,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit move');
      }

      const result = await response.json();

      // Update game state with the move result
      dispatch({
        type: 'UPDATE_BOARD',
        payload: {
          board: result.board,
          history: result.history || [],
          moveCount: state.moveCount + 1,
          currentPlayer: currentPlayer,
          move: position,
        },
      });

      return result;
    } catch (error) {
      // Error submitting move - dispatch to error state
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const value = {
    ...state,
    startMatch,
    startTournament,
    resetGame,
    submitMove,
    dispatch,
    connectionStatus,
    sseConnection,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe ser usado dentro de un GameProvider');
  }
  return context;
};

export { GameContext, gameReducer };
