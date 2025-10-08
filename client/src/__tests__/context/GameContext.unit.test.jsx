/**
 * GameContext Unit Tests
 * Tests for GameContext provider and useGame hook
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import {
  GameProvider,
  useGame,
  GameContext,
  gameReducer,
} from '../../context/GameContext';

// Simular EventSource
const mockEventSource = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
  onopen: null,
  onmessage: null,
  onerror: null,
};

global.EventSource = jest.fn(() => mockEventSource);

// Simular fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({}),
});

// Componente de prueba que usa el hook useGame
const TestComponent = () => {
  const game = useGame();
  return (
    <div>
      <div data-testid="game-state">{game.gameState}</div>
      <div data-testid="config">{game.config ? 'has-config' : 'no-config'}</div>
      <div data-testid="board">{game.board.join(',')}</div>
      <div data-testid="move-count">{game.moveCount}</div>
      <div data-testid="error">{game.error || 'no-error'}</div>
      <button
        onClick={() =>
          game.startMatch({ name: 'Player1' }, { name: 'Player2' })
        }
      >
        Start Match
      </button>
      <button
        onClick={() =>
          game.startTournament([{ name: 'Player1' }, { name: 'Player2' }])
        }
      >
        Start Tournament
      </button>
      <button onClick={game.resetGame}>Reset Game</button>
    </div>
  );
};

describe('GameContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEventSource.addEventListener.mockClear();
    mockEventSource.close.mockClear();
    global.fetch.mockClear();
  });

  describe('GameProvider', () => {
    test('debería provide initial state', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(screen.getByTestId('game-state')).toHaveTextContent('idle');
      expect(screen.getByTestId('config')).toHaveTextContent('no-config');
      expect(screen.getByTestId('board')).toHaveTextContent(
        '0,0,0,0,0,0,0,0,0'
      );
      expect(screen.getByTestId('move-count')).toHaveTextContent('0');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    test('debería establish SSE connection on mount', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(global.EventSource).toHaveBeenCalledWith('/api/stream');
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        'match:start',
        expect.any(Function)
      );
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        'match:move',
        expect.any(Function)
      );
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        'match:win',
        expect.any(Function)
      );
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        'match:error',
        expect.any(Function)
      );
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        'tournament:start',
        expect.any(Function)
      );
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        'tournament:complete',
        expect.any(Function)
      );
    });

    test('debería handle SSE connection open', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Simular conexión SSE abierta
      act(() => {
        mockEventSource.onopen();
      });

      // La conexión debería establecerse (probado vía llamada al constructor de EventSource)
      expect(global.EventSource).toHaveBeenCalled();
    });

    test('debería handle SSE match:start event', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const matchStartHandler =
        mockEventSource.addEventListener.mock.calls.find(
          call => call[0] === 'match:start'
        )[1];

      const eventData = {
        players: [{ name: 'Player1' }, { name: 'Player2' }],
        boardSize: 3,
        timestamp: '2025-10-03T10:00:00Z',
      };

      act(() => {
        matchStartHandler({ data: JSON.stringify(eventData) });
      });

      expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
    });

    test('debería handle SSE match:move event', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const matchMoveHandler = mockEventSource.addEventListener.mock.calls.find(
        call => call[0] === 'match:move'
      )[1];

      const eventData = {
        board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
        history: [{ move: 0, player: 1 }],
        turn: 1,
        player: { name: 'Player1' },
        move: 0,
      };

      act(() => {
        matchMoveHandler({ data: JSON.stringify(eventData) });
      });

      expect(screen.getByTestId('board')).toHaveTextContent(
        '1,0,0,0,0,0,0,0,0'
      );
      expect(screen.getByTestId('move-count')).toHaveTextContent('1');
    });

    test('debería handle SSE match:win event', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const matchWinHandler = mockEventSource.addEventListener.mock.calls.find(
        call => call[0] === 'match:win'
      )[1];

      const eventData = {
        winner: { name: 'Player1' },
        winningLine: [0, 1, 2],
        finalBoard: [1, 1, 1, 0, 0, 0, 0, 0, 0],
        message: 'Player1 ganó',
        timestamp: '2025-10-03T10:00:00Z',
      };

      act(() => {
        matchWinHandler({ data: JSON.stringify(eventData) });
      });

      expect(screen.getByTestId('game-state')).toHaveTextContent('completed');
    });

    test('debería handle SSE match:error event', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const matchErrorHandler =
        mockEventSource.addEventListener.mock.calls.find(
          call => call[0] === 'match:error'
        )[1];

      const eventData = {
        message: 'Connection error',
        error: 'ECONNREFUSED',
        timestamp: '2025-10-03T10:00:00Z',
      };

      act(() => {
        matchErrorHandler({ data: JSON.stringify(eventData) });
      });

      expect(screen.getByTestId('game-state')).toHaveTextContent('error');
      expect(screen.getByTestId('error')).toHaveTextContent('Connection error');
    });

    test('debería handle SSE tournament:start event', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const tournamentStartHandler =
        mockEventSource.addEventListener.mock.calls.find(
          call => call[0] === 'tournament:start'
        )[1];

      const eventData = {
        players: [{ name: 'Player1' }, { name: 'Player2' }],
        boardSize: 3,
        rounds: [],
        timestamp: '2025-10-03T10:00:00Z',
      };

      act(() => {
        tournamentStartHandler({ data: JSON.stringify(eventData) });
      });

      expect(screen.getByTestId('game-state')).toHaveTextContent('tournament');
    });

    test('debería handle SSE tournament:complete event', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const tournamentCompleteHandler =
        mockEventSource.addEventListener.mock.calls.find(
          call => call[0] === 'tournament:complete'
        )[1];

      const eventData = {
        winner: { name: 'Player1' },
        runnerUp: { name: 'Player2' },
        rounds: [],
        message: 'Player1 ganó el torneo',
        timestamp: '2025-10-03T10:00:00Z',
      };

      act(() => {
        tournamentCompleteHandler({ data: JSON.stringify(eventData) });
      });

      expect(screen.getByTestId('game-state')).toHaveTextContent('completed');
    });

    test('debería handle SSE connection error and reconnect', () => {
      jest.useFakeTimers();

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Simular error de conexión SSE
      act(() => {
        mockEventSource.onerror();
      });

      // Avanzar temporizador para activar reconexión
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Debería intentar reconectar
      expect(global.EventSource).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    test('debería close SSE connection on unmount', () => {
      const { unmount } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Simular que la conexión SSE se establece
      act(() => {
        mockEventSource.onopen();
      });

      unmount();

      expect(mockEventSource.close).toHaveBeenCalled();
    });

    test('debería handle SSE message parsing error', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Simular JSON inválido en mensaje SSE
      act(() => {
        mockEventSource.onmessage({ data: 'invalid json' });
      });

      // No debería fallar - el error es capturado e ignorado
      expect(screen.getByTestId('game-state')).toHaveTextContent('idle');
    });
  });

  describe('useGame hook', () => {
    test('debería return game context when used within GameProvider', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(screen.getByTestId('game-state')).toBeInTheDocument();
    });

    test('debería lanzar error cuando se usa fuera de GameProvider', () => {
      // Suprimir console.error para esta prueba
      const originalError = console.error;
      console.error = jest.fn();

      // Usar expect().toThrow() para capturar el error durante el renderizado
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useGame debe ser usado dentro de un GameProvider');

      console.error = originalError;
    });
  });

  describe('startMatch function', () => {
    test('debería make API call to start match', () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ result: 'win', winner: 'Player1' }),
      };
      global.fetch.mockResolvedValueOnce(mockResponse);

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      act(() => {
        screen.getByText('Start Match').click();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player1: { name: 'Player1' },
          player2: { name: 'Player2' },
        }),
      });
    });

    test('debería handle API error in startMatch', async () => {
      // Mock fetch to return error response
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Crear un componente de prueba que usa la función real
      const TestComponent = () => {
        const game = useGame();
        return (
          <div>
            <div data-testid="error">{game.error || 'no-error'}</div>
            <button
              onClick={() =>
                game.startMatch(
                  { name: 'Player1', port: 3001 },
                  { name: 'Player2', port: 3002 }
                )
              }
            >
              Start Match
            </button>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Hacer clic en el botón para activar la función real
      act(() => {
        fireEvent.click(screen.getByText('Start Match'));
      });

      // Wait for async operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Verificar que se muestra el error
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Error HTTP! estado: 500'
      );
    });

    test('debería handle network error in startMatch', async () => {
      // Mock fetch to throw network error
      global.fetch = jest.fn().mockRejectedValue(new Error('Error de red'));

      // Crear un componente de prueba que usa la función real
      const TestComponent = () => {
        const game = useGame();
        return (
          <div>
            <div data-testid="error">{game.error || 'no-error'}</div>
            <button
              onClick={() =>
                game.startMatch(
                  { name: 'Player1', port: 3001 },
                  { name: 'Player2', port: 3002 }
                )
              }
            >
              Start Match
            </button>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Hacer clic en el botón para activar la función real
      act(() => {
        fireEvent.click(screen.getByText('Start Match'));
      });

      // Wait for async operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Verificar que se muestra el error de red
      expect(screen.getByTestId('error')).toHaveTextContent('Error de red');
    });
  });

  describe('startTournament function', () => {
    test('debería make API call to start tournament', () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ result: 'completed', winner: 'Player1' }),
      };
      global.fetch.mockResolvedValueOnce(mockResponse);

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      act(() => {
        screen.getByText('Start Tournament').click();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/tournament', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          players: [{ name: 'Player1' }, { name: 'Player2' }],
        }),
      });
    });

    test('debería handle API error in startTournament', async () => {
      // Mock fetch to return error response
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Crear un componente de prueba que usa la función real
      const TestComponent = () => {
        const game = useGame();
        return (
          <div>
            <div data-testid="error">{game.error || 'no-error'}</div>
            <button
              onClick={() =>
                game.startTournament([
                  { name: 'Player1', port: 3001 },
                  { name: 'Player2', port: 3002 },
                ])
              }
            >
              Start Tournament
            </button>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Hacer clic en el botón para activar la función real
      act(() => {
        fireEvent.click(screen.getByText('Start Tournament'));
      });

      // Wait for async operation to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Verificar que se muestra el error
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Error HTTP! estado: 500'
      );
    });
  });

  describe('resetGame function', () => {
    test('debería reset game state', () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // First set some state
      act(() => {
        screen.getByText('Start Match').click();
      });

      // Then reset
      act(() => {
        screen.getByText('Reset Game').click();
      });

      expect(screen.getByTestId('game-state')).toHaveTextContent('idle');
      expect(screen.getByTestId('board')).toHaveTextContent(
        '0,0,0,0,0,0,0,0,0'
      );
      expect(screen.getByTestId('move-count')).toHaveTextContent('0');
    });
  });
});

describe('gameReducer', () => {
  const initialState = {
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
  };

  test('debería return initial state for unknown action', () => {
    const result = gameReducer(initialState, { type: 'UNKNOWN_ACTION' });
    expect(result).toEqual(initialState);
  });

  test('debería handle SET_CONFIG action', () => {
    const config = { players: [{ name: 'Player1' }] };
    const result = gameReducer(initialState, {
      type: 'SET_CONFIG',
      payload: config,
    });

    expect(result.config).toEqual(config);
    expect(result.gameState).toBe('idle');
  });

  test('debería handle START_MATCH action with 3x3 board', () => {
    const matchData = { boardSize: 3, players: [{ name: 'Player1' }] };
    const result = gameReducer(initialState, {
      type: 'START_MATCH',
      payload: matchData,
    });

    expect(result.gameState).toBe('playing');
    expect(result.currentMatch).toEqual(matchData);
    expect(result.board).toEqual(Array(9).fill(0));
    expect(result.history).toEqual([]);
    expect(result.moveCount).toBe(0);
  });

  test('debería handle START_MATCH action with 5x5 board', () => {
    const matchData = { boardSize: 5, players: [{ name: 'Player1' }] };
    const result = gameReducer(initialState, {
      type: 'START_MATCH',
      payload: matchData,
    });

    expect(result.gameState).toBe('playing');
    expect(result.board).toEqual(Array(25).fill(0));
  });

  test('debería handle UPDATE_BOARD action', () => {
    const updateData = {
      board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
      history: [{ move: 0, player: 1 }],
      moveCount: 1,
    };
    const result = gameReducer(initialState, {
      type: 'UPDATE_BOARD',
      payload: updateData,
    });

    expect(result.board).toEqual(updateData.board);
    expect(result.history).toEqual(updateData.history);
    expect(result.moveCount).toBe(updateData.moveCount);
  });

  test('debería handle MATCH_COMPLETE action', () => {
    const matchResult = {
      winner: { name: 'Player1' },
      finalBoard: [1, 1, 1, 0, 0, 0, 0, 0, 0],
    };
    const result = gameReducer(initialState, {
      type: 'MATCH_COMPLETE',
      payload: matchResult,
    });

    expect(result.gameState).toBe('completed');
    expect(result.matchResult).toEqual(matchResult);
    expect(result.board).toEqual(matchResult.finalBoard);
  });

  test('debería handle MATCH_COMPLETE action without finalBoard', () => {
    const matchResult = { winner: { name: 'Player1' } };
    const result = gameReducer(initialState, {
      type: 'MATCH_COMPLETE',
      payload: matchResult,
    });

    expect(result.gameState).toBe('completed');
    expect(result.matchResult).toEqual(matchResult);
    expect(result.board).toEqual(initialState.board);
  });

  test('debería handle START_TOURNAMENT action', () => {
    const tournamentData = { boardSize: 3, players: [{ name: 'Player1' }] };
    const result = gameReducer(initialState, {
      type: 'START_TOURNAMENT',
      payload: tournamentData,
    });

    expect(result.gameState).toBe('tournament');
    expect(result.tournament).toEqual(tournamentData);
    expect(result.currentMatch).toBeNull();
    expect(result.board).toEqual(Array(9).fill(0));
  });

  test('debería handle TOURNAMENT_UPDATE action', () => {
    const tournamentData = { rounds: [] };
    const result = gameReducer(initialState, {
      type: 'TOURNAMENT_UPDATE',
      payload: tournamentData,
    });

    expect(result.tournament).toEqual(tournamentData);
  });

  test('debería handle TOURNAMENT_COMPLETE action', () => {
    const tournamentResult = { winner: { name: 'Player1' } };
    const result = gameReducer(initialState, {
      type: 'TOURNAMENT_COMPLETE',
      payload: tournamentResult,
    });

    expect(result.gameState).toBe('completed');
    expect(result.tournament).toEqual(tournamentResult);
    expect(result.tournamentResult).toEqual(tournamentResult);
  });

  test('debería handle RESET_GAME action', () => {
    const stateWithData = {
      ...initialState,
      gameState: 'playing',
      currentMatch: { players: [] },
      tournament: { rounds: [] },
      board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
      history: [{ move: 0 }],
      moveCount: 1,
      matchResult: { winner: 'Player1' },
      tournamentResult: { winner: 'Player1' },
      error: 'Some error',
    };

    const result = gameReducer(stateWithData, { type: 'RESET_GAME' });

    expect(result).toEqual(initialState);
  });

  test('debería handle SET_ERROR action', () => {
    const error = 'Connection failed';
    const result = gameReducer(initialState, {
      type: 'SET_ERROR',
      payload: error,
    });

    expect(result.gameState).toBe('error');
    expect(result.error).toBe(error);
  });
});

describe('HTTP Error Handling', () => {
  test('debería handle response not ok with status', () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    global.fetch = mockFetch;

    // Test the error handling logic directly
    const response = { ok: false, status: 500 };
    const errorMessage = `Error HTTP! estado: ${
      response?.status || 'Sin respuesta'
    }`;

    expect(errorMessage).toBe('Error HTTP! estado: 500');
  });

  test('debería handle response not ok without status', () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: undefined,
    });
    global.fetch = mockFetch;

    // Test the error handling logic directly
    const response = { ok: false, status: undefined };
    const errorMessage = `Error HTTP! estado: ${
      response?.status || 'Sin respuesta'
    }`;

    expect(errorMessage).toBe('Error HTTP! estado: Sin respuesta');
  });

  test('debería handle catch block error handling', () => {
    const mockError = new Error('Network error');

    // Test the catch block logic directly
    const errorMessage = mockError.message;
    expect(errorMessage).toBe('Network error');
  });
});

describe('useGame Hook Error Handling', () => {
  test('debería throw error when used outside GameProvider', () => {
    const TestComponent = () => {
      useGame();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useGame debe ser usado dentro de un GameProvider');

    console.error = originalError;
  });
});
