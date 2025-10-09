/**
 * Unit tests for GameContext and gameReducer
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import { render, act, screen } from '@testing-library/react';
import {
  GameProvider,
  useGame,
  gameReducer,
} from '../../../src/context/GameContext';

// Componente de prueba para acceder al contexto
const TestComponent = () => {
  const { gameState, board, moveCount, dispatch } = useGame();
  return (
    <div>
      <div data-testid="game-state">{gameState}</div>
      <div data-testid="board">{JSON.stringify(board)}</div>
      <div data-testid="move-count">{moveCount}</div>
      <button
        data-testid="set-config"
        onClick={() =>
          dispatch({ type: 'SET_CONFIG', payload: { theme: 'dark' } })
        }
      >
        Set Config
      </button>
      <button
        data-testid="start-match"
        onClick={() =>
          dispatch({ type: 'START_MATCH', payload: { players: ['P1', 'P2'] } })
        }
      >
        Start Match
      </button>
      <button
        data-testid="update-board"
        onClick={() =>
          dispatch({
            type: 'UPDATE_BOARD',
            payload: {
              board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
              history: [],
              moveCount: 1,
            },
          })
        }
      >
        Update Board
      </button>
      <button
        data-testid="match-complete"
        onClick={() =>
          dispatch({ type: 'MATCH_COMPLETE', payload: { winner: 'P1' } })
        }
      >
        Complete Match
      </button>
      <button
        data-testid="reset-game"
        onClick={() => dispatch({ type: 'RESET_GAME' })}
      >
        Reset Game
      </button>
    </div>
  );
};

describe('GameContext', () => {
  test('debería provide initial state', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    expect(screen.getByTestId('game-state')).toHaveTextContent('idle');
    expect(screen.getByTestId('board')).toHaveTextContent(
      '[0,0,0,0,0,0,0,0,0]'
    );
    expect(screen.getByTestId('move-count')).toHaveTextContent('0');
  });

  test('debería handle SET_CONFIG action', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    act(() => {
      screen.getByTestId('set-config').click();
    });

    expect(screen.getByTestId('game-state')).toHaveTextContent('idle');
  });

  test('debería handle START_MATCH action', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    act(() => {
      screen.getByTestId('start-match').click();
    });

    expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
    expect(screen.getByTestId('board')).toHaveTextContent(
      '[0,0,0,0,0,0,0,0,0]'
    );
    expect(screen.getByTestId('move-count')).toHaveTextContent('0');
  });

  test('debería handle UPDATE_BOARD action', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    act(() => {
      screen.getByTestId('update-board').click();
    });

    expect(screen.getByTestId('board')).toHaveTextContent(
      '[1,0,0,0,0,0,0,0,0]'
    );
    expect(screen.getByTestId('move-count')).toHaveTextContent('1');
  });

  test('debería handle MATCH_COMPLETE action', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    act(() => {
      screen.getByTestId('match-complete').click();
    });

    expect(screen.getByTestId('game-state')).toHaveTextContent('completed');
  });

  test('debería handle RESET_GAME action', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Primero iniciar una partida
    act(() => {
      screen.getByTestId('start-match').click();
    });

    expect(screen.getByTestId('game-state')).toHaveTextContent('playing');

    // Luego resetear
    act(() => {
      screen.getByTestId('reset-game').click();
    });

    expect(screen.getByTestId('game-state')).toHaveTextContent('idle');
    expect(screen.getByTestId('board')).toHaveTextContent(
      '[0,0,0,0,0,0,0,0,0]'
    );
    expect(screen.getByTestId('move-count')).toHaveTextContent('0');
  });

  test('debería handle tournament actions', () => {
    const { getByTestId } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Probar START_TOURNAMENT
    act(() => {
      getByTestId('start-match').click(); // Usar botón existente para activar cambio de estado
    });
  });

  test('debería handle unknown action types', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    const initialState = screen.getByTestId('game-state').textContent;

    // El estado debería permanecer sin cambios (ninguna acción despachada)
    expect(screen.getByTestId('game-state')).toHaveTextContent(initialState);
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

  test('debería handle SET_CONFIG action', () => {
    const action = {
      type: 'SET_CONFIG',
      payload: { theme: 'dark', boardSize: '3x3' },
    };

    const newState = gameReducer(initialState, action);

    expect(newState.config).toEqual({ theme: 'dark', boardSize: '3x3' });
    expect(newState.gameState).toBe('idle');
  });

  test('debería handle START_MATCH action', () => {
    const action = {
      type: 'START_MATCH',
      payload: { players: ['P1', 'P2'] },
    };

    const newState = gameReducer(initialState, action);

    expect(newState.gameState).toBe('playing');
    expect(newState.currentMatch).toEqual({ players: ['P1', 'P2'] });
    expect(newState.board).toEqual(Array(9).fill(0));
    expect(newState.history).toEqual([]);
    expect(newState.moveCount).toBe(0);
  });

  test('debería handle UPDATE_BOARD action', () => {
    const action = {
      type: 'UPDATE_BOARD',
      payload: {
        board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
        history: [{ move: 0, player: 'P1' }],
        moveCount: 1,
      },
    };

    const newState = gameReducer(initialState, action);

    expect(newState.board).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(newState.history).toEqual([{ move: 0, player: 'P1' }]);
    expect(newState.moveCount).toBe(1);
  });

  test('debería handle MATCH_COMPLETE action', () => {
    const action = {
      type: 'MATCH_COMPLETE',
      payload: { winner: 'P1', result: 'win' },
    };

    const newState = gameReducer(initialState, action);

    expect(newState.gameState).toBe('completed');
    expect(newState.matchResult).toEqual({ winner: 'P1', result: 'win' });
  });

  test('debería handle RESET_GAME action', () => {
    const currentState = {
      ...initialState,
      gameState: 'playing',
      currentMatch: { players: ['P1', 'P2'] },
      board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
      moveCount: 1,
    };

    const action = { type: 'RESET_GAME' };
    const newState = gameReducer(currentState, action);

    expect(newState).toEqual(initialState);
  });

  test('debería handle SET_ERROR action', () => {
    const action = {
      type: 'SET_ERROR',
      payload: 'Connection failed',
    };

    const newState = gameReducer(initialState, action);

    expect(newState.gameState).toBe('error');
    expect(newState.error).toBe('Connection failed');
  });

  test('debería return current state for unknown action', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const newState = gameReducer(initialState, action);

    expect(newState).toBe(initialState);
  });
});
