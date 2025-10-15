import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { gameReducer, initialState } from './gameReducer';
import {
  getDelayForSpeed,
  getPlayerIdForTurn,
  formatGameConfig,
} from './gameHelpers';
import { PlayerService } from '../services/PlayerService';

/**
 * Contexto de Juego para gestión centralizada de estado
 * @lastModified 2025-10-10
 * @version 1.1.0
 */

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [sseConnection, setSseConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'disconnected', 'error'

  // Player management
  const playerService = useRef(new PlayerService());

  // State refs for accessing current state in callbacks
  const stateRef = useRef(state);
  const playersRef = useRef(state.players);
  const availableBotsRef = useRef(state.availableBots);

  // Move queue for animation
  const [moveQueue, setMoveQueue] = useState([]);
  const [isProcessingMoves, setIsProcessingMoves] = useState(false);
  const moveQueueRef = useRef(moveQueue);
  const processingRef = useRef(isProcessingMoves);

  // Removal queue for pulsating animation (infinity mode)
  const [removalQueue, setRemovalQueue] = useState([]);
  const [nextRemovalPosition, setNextRemovalPosition] = useState(null);
  const removalQueueRef = useRef(removalQueue);

  // Keep refs in sync
  useEffect(() => {
    stateRef.current = state;
    playersRef.current = state.players;
    availableBotsRef.current = state.availableBots;
    moveQueueRef.current = moveQueue;
    processingRef.current = isProcessingMoves;
    removalQueueRef.current = removalQueue;
  }, [state, moveQueue, isProcessingMoves, removalQueue]);

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

      eventSource.onmessage = _event => {
        // SSE events are handled by specific addEventListener calls below
      };

      eventSource.onerror = _error => {
        setConnectionStatus('error');
        isConnecting = false;
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

        // DEBUG: Log move event received
        console.log(
          '[DEBUG][GameContext][SSE:match:move] Received move event:',
          {
            player: data.player?.name,
            move: data.move,
            turn: data.turn,
            queueLength: moveQueueRef.current.length,
          }
        );

        // Queue moves for delayed animation instead of instant dispatch
        setMoveQueue(prev => [
          ...prev,
          {
            type: 'move',
            data: data,
            timestamp: Date.now(),
          },
        ]);
      });

      eventSource.addEventListener('match:win', event => {
        const data = JSON.parse(event.data);

        // DEBUG: Log match completion
        if (process.env.LOG_LEVEL === 'debug') {
          console.log('[DEBUG][GameContext][SSE:match:win] Match completed:', {
            winner: data.winner?.name,
            result: data.result,
            finalBoard: data.finalBoard,
            winningLine: data.winningLine,
          });
        }

        dispatch({
          type: 'MATCH_COMPLETE',
          payload: {
            winner: data.winner,
            winningLine: data.winningLine,
            finalBoard: data.finalBoard,
            message: data.message,
            timestamp: data.timestamp,
            history: data.history || [],
            result: data.result || 'win',
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

      eventSource.addEventListener('move:removed', event => {
        const data = JSON.parse(event.data);

        // DEBUG: Log infinity mode removal
        if (process.env.LOG_LEVEL === 'debug') {
          console.log(
            '[DEBUG][GameContext][SSE:move:removed] Infinity mode removal:',
            {
              position: data.position,
              player: data.player?.name,
            }
          );
        }

        // Add to removal queue for pulsating animation
        setRemovalQueue(prev => [
          ...prev,
          {
            position: data.position,
            player: data.player,
            timestamp: Date.now(),
          },
        ]);
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

  // Process move queue with configurable delay
  useEffect(() => {
    if (moveQueue.length === 0 || isProcessingMoves) return;

    setIsProcessingMoves(true);

    const nextMove = moveQueueRef.current[0];
    if (!nextMove) {
      setIsProcessingMoves(false);
      return;
    }

    // Get delay from game config (default: normal = 1000ms)
    const speed = state.config?.speed || 'normal';
    const delayMs = getDelayForSpeed(speed);

    // DEBUG: Log move processing
    console.log('[DEBUG][GameContext][moveQueue] Processing move:', {
      queueLength: moveQueueRef.current.length,
      configSpeed: state.config?.speed,
      effectiveSpeed: speed,
      delayMs: delayMs,
      moveType: nextMove.type,
    });

    const timeoutId = setTimeout(() => {
      dispatch({
        type: 'UPDATE_BOARD',
        payload: {
          board: nextMove.data?.board || [],
          history: nextMove.data?.history || [],
          moveCount: nextMove.data?.turn || 0,
          currentPlayer: nextMove.data?.player,
          move: nextMove.data?.move,
        },
      });

      setMoveQueue(prev => {
        const newQueue = prev.slice(1);
        return newQueue;
      });

      setIsProcessingMoves(false);
    }, delayMs);

    // Cleanup timeout on unmount or dependency change
    return () => clearTimeout(timeoutId);
  }, [moveQueue.length, isProcessingMoves, state.config?.speed]);

  // Process removal queue (infinity mode)
  useEffect(() => {
    if (removalQueue.length === 0) return;

    const processRemoval = () => {
      const removal = removalQueueRef.current[0];
      if (!removal) return;

      // Update board state to clear position
      dispatch({
        type: 'REMOVE_MOVE',
        payload: {
          position: removal.position,
          player: removal.player,
        },
      });

      // Remove from queue after processing
      setRemovalQueue(prev => prev.slice(1));

      // Update next removal position for pulsating effect
      // Calculate oldest move position from current move history
      if (state.moveCount >= 5) {
        setNextRemovalPosition(state.history?.[0]?.move || null);
      }

      // Note: Don't call processRemoval() recursively here
      // The useEffect will automatically trigger again when removalQueue.length changes
    };

    // Add a small delay to allow tests to observe the queue state
    const timeoutId = setTimeout(processRemoval, 0);
    return () => clearTimeout(timeoutId);
  }, [removalQueue.length, state.moveCount, state.history]);

  // Acciones del juego
  const startMatch = async (player1, player2, options = {}) => {
    try {
      // DEBUG: Log game configuration
      console.log(
        '[DEBUG][GameContext][startMatch] Starting match with config:',
        {
          player1: player1.name,
          player2: player2.name,
          speed: options.speed,
          boardSize: options.boardSize,
          noTie: options.noTie,
        }
      );

      // Store config FIRST before starting match
      dispatch({
        type: 'SET_CONFIG',
        payload: formatGameConfig(options),
      });

      const requestBody = {
        player1,
        player2,
        ...options,
      };

      // DEBUG: Log the exact request body being sent
      console.log(
        '[DEBUG][GameContext][startMatch] Request body:',
        JSON.stringify(requestBody, null, 2)
      );

      // Dispatch START_MATCH immediately to set state to 'playing'
      // This ensures the ProgressScreen is shown while the API call is in progress
      dispatch({
        type: 'START_MATCH',
        payload: {
          matchId: `temp-${Date.now()}`, // Temporary ID until we get the real one
          players: [player1, player2],
          boardSize: options.boardSize || 3,
          currentPlayer: player1,
          waitingForHuman: player1.isHuman || player2.isHuman,
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
              result.waitingForHuman || player1.isHuman || player2.isHuman,
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
      // DEBUG: Log tournament configuration
      console.log(
        '[DEBUG][GameContext][startTournament] Starting tournament with config:',
        {
          players: players.map(p => ({
            name: p.name,
            port: p.port,
            isHuman: p.isHuman,
          })),
          speed: options.speed,
          boardSize: options.boardSize,
          noTie: options.noTie,
        }
      );

      // Store config FIRST before starting tournament
      dispatch({
        type: 'SET_CONFIG',
        payload: formatGameConfig(options),
      });

      // Dispatch START_TOURNAMENT immediately to set state to 'tournament'
      // This ensures the tournament state is set before individual matches start
      dispatch({
        type: 'START_TOURNAMENT',
        payload: {
          players,
          boardSize: options.boardSize || 3,
          rounds: [], // Will be populated by SSE events
          timestamp: Date.now(),
        },
      });

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
    setMoveQueue([]);
    setIsProcessingMoves(false);
    dispatch({ type: 'RESET_GAME' });
  };

  const submitMove = async position => {
    try {
      if (!state.currentMatch || !state.currentMatch.matchId) {
        throw new Error('No active match found');
      }

      // Determine player ID for the move
      const playerId = getPlayerIdForTurn(state.moveCount);

      // DEBUG: Log human move submission
      if (process.env.LOG_LEVEL === 'debug') {
        console.log('[DEBUG][GameContext][submitMove] Submitting human move:', {
          matchId: state.currentMatch.matchId,
          playerId,
          position,
          currentMoveCount: state.moveCount,
        });
      }

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

        // DEBUG: Log submission error
        if (process.env.LOG_LEVEL === 'debug') {
          console.log(
            '[DEBUG][GameContext][submitMove] Submission failed:',
            errorData
          );
        }

        throw new Error(errorData.error || 'Failed to submit move');
      }

      const result = await response.json();

      // DEBUG: Log successful submission
      if (process.env.LOG_LEVEL === 'debug') {
        console.log(
          '[DEBUG][GameContext][submitMove] Move accepted by server:',
          result
        );
      }

      // DON'T update board immediately - let SSE event handle it!
      // The backend will broadcast match:move via SSE after processing
      // This prevents race conditions and ensures proper game flow

      return result;
    } catch (error) {
      // DEBUG: Log error
      if (process.env.LOG_LEVEL === 'debug') {
        console.log('[DEBUG][GameContext][submitMove] Error:', error.message);
      }

      // Error submitting move - dispatch to error state
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Player management functions
  const discoverBots = useCallback(async () => {
    try {
      dispatch({ type: 'SET_BOT_DISCOVERY_STATUS', payload: 'discovering' });
      const response = await fetch('/api/bots/available');
      const data = await response.json();

      if (data.bots) {
        dispatch({ type: 'SET_AVAILABLE_BOTS', payload: data.bots });
        dispatch({ type: 'SET_BOT_DISCOVERY_STATUS', payload: 'success' });
      } else {
        dispatch({ type: 'SET_BOT_DISCOVERY_STATUS', payload: 'error' });
      }
    } catch (error) {
      console.error('[DEBUG][GameContext] Bot discovery failed:', error);
      dispatch({ type: 'SET_BOT_DISCOVERY_STATUS', payload: 'error' });
    }
  }, []);

  const populatePlayersForMode = useCallback((gameMode, config) => {
    // Use refs to access current state, not stale closure values
    const currentPlayers = playersRef.current;
    const currentAvailableBots = availableBotsRef.current;

    // Only populate if no human players are currently set
    const hasHumanPlayers = currentPlayers.some(player => player.isHuman);

    if (!hasHumanPlayers) {
      console.log(
        '[DEBUG][GameContext] populatePlayersForMode called - no human players detected'
      );
      const newPlayers = playerService.current.populatePlayersForMode(
        gameMode,
        currentAvailableBots,
        config,
        currentPlayers // Pass current players to preserve human settings
      );
      console.log(
        '[DEBUG][GameContext] newPlayers after populatePlayersForMode:',
        newPlayers
      );
      dispatch({ type: 'SET_PLAYERS', payload: newPlayers });
    } else {
      console.log(
        '[DEBUG][GameContext] Skipping populatePlayersForMode - human players detected:',
        currentPlayers
      );
    }
  }, []); // Empty dependencies - using refs for current state

  const updatePlayer = useCallback((index, field, value) => {
    console.log('[DEBUG][GameContext] updatePlayer called:', {
      index,
      field,
      value,
    });
    dispatch({ type: 'UPDATE_PLAYER', payload: { index, field, value } });
  }, []);

  const value = {
    ...state,
    startMatch,
    startTournament,
    resetGame,
    submitMove,
    dispatch,
    connectionStatus,
    sseConnection,
    moveQueue,
    isProcessingMoves,
    removalQueue, // Infinity mode removal queue
    nextRemovalPosition, // Infinity mode pulsating effect
    // Player management functions
    discoverBots,
    populatePlayersForMode,
    updatePlayer,
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
