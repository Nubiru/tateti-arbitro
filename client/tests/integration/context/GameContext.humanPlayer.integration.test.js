/**
 * Integration Tests: GameContext - Human Player Flow
 * Tests full human player move submission with React Context and SSE
 * @lastModified 2025-10-10
 * @version 1.1.0
 * @testType integration
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { GameProvider, useGame } from '../../../src/context/GameContext.jsx';

// Mock fetch
global.fetch = jest.fn();

// Mock EventSource
class MockEventSource {
  constructor(url) {
    this.url = url;
    this.listeners = {};
    this.readyState = 0; // CONNECTING
    MockEventSource.instances.push(this);

    // Simulate async connection
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) {
        this.onopen();
      }
    }, 0);
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  close() {
    this.readyState = 2; // CLOSED
    this.listeners = {};
  }

  // Helper to trigger events in tests
  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback({ data: JSON.stringify(data) });
      });
    }
  }

  static instances = [];
  static reset() {
    MockEventSource.instances = [];
  }
}

global.EventSource = MockEventSource;

describe('GameContext - Human Player Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockEventSource.reset();
    fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('submitMove - Human Player', () => {
    test('should submit human move without immediately updating board', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      // Setup: Start a match first
      act(() => {
        result.current.dispatch({
          type: 'START_MATCH',
          payload: {
            matchId: 'test-match-123',
            players: [
              { name: 'Human1', isHuman: true },
              { name: 'Bot1', isHuman: false },
            ],
            boardSize: 3,
          },
        });
      });

      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, move: 4 }),
      });

      // Act: Submit human move
      await act(async () => {
        await result.current.submitMove(4);
      });

      // Assert: API was called correctly
      expect(fetch).toHaveBeenCalledWith('/api/match/test-match-123/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player: 'player1',
          position: 4,
        }),
      });

      // Assert: Board was NOT updated immediately
      // (Board should only update via SSE events)
      expect(result.current.board).toEqual(Array(9).fill(0));
    });

    test('should handle API error when submitting move', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      act(() => {
        result.current.dispatch({
          type: 'START_MATCH',
          payload: {
            matchId: 'test-match-123',
            players: [{ name: 'Human1', isHuman: true }],
            boardSize: 3,
          },
        });
      });

      // Mock API error
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid move' }),
      });

      // Act & Assert: Should throw error
      await act(async () => {
        await expect(result.current.submitMove(10)).rejects.toThrow(
          'Invalid move'
        );
      });

      // Assert: Error state was set
      expect(result.current.gameState).toBe('error');
      expect(result.current.error).toBe('Invalid move');
    });

    test('should throw error if no active match', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      // Act & Assert: Should throw error without active match
      await act(async () => {
        await expect(result.current.submitMove(4)).rejects.toThrow(
          'No active match found'
        );
      });
    });

    test('should determine correct player ID based on move count', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      act(() => {
        result.current.dispatch({
          type: 'START_MATCH',
          payload: {
            matchId: 'test-match-123',
            players: [
              { name: 'Human1', isHuman: true },
              { name: 'Human2', isHuman: true },
            ],
            boardSize: 3,
          },
        });
      });

      // First move (moveCount = 0, should be player1)
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await act(async () => {
        await result.current.submitMove(0);
      });

      expect(fetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            player: 'player1',
            position: 0,
          }),
        })
      );

      // Simulate move count update
      act(() => {
        result.current.dispatch({
          type: 'UPDATE_BOARD',
          payload: {
            board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
            history: [],
            moveCount: 1,
          },
        });
      });

      // Second move (moveCount = 1, should be player2)
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await act(async () => {
        await result.current.submitMove(1);
      });

      expect(fetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            player: 'player2',
            position: 1,
          }),
        })
      );
    });
  });

  describe('SSE Event Integration - Human Moves', () => {
    test('should update board when SSE match:move event is received', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      // Wait for EventSource to be created
      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      // Initialize game state with config for moveQueue processor
      act(() => {
        result.current.dispatch({
          type: 'SET_CONFIG',
          payload: { speed: 'fast', boardSize: '3x3', noTie: false },
        });
        result.current.dispatch({
          type: 'START_MATCH',
          payload: {
            matchId: 'test-match-sse',
            players: [{ name: 'Human1' }, { name: 'Bot1' }],
            boardSize: 3,
          },
        });
      });

      const eventSource = MockEventSource.instances[0];

      // Trigger match:move event
      act(() => {
        eventSource.trigger('match:move', {
          player: { name: 'Human1', id: 1 },
          move: 4,
          board: [0, 0, 0, 0, 1, 0, 0, 0, 0],
          turn: 1,
        });
      });

      // Wait for moveQueue to be processed (with speed delay)
      // Fast speed = 200ms, so 1000ms should be plenty
      await waitFor(
        () => {
          expect(result.current.board[4]).toBe(1);
        },
        { timeout: 3000 }
      );
    });
  });
});
