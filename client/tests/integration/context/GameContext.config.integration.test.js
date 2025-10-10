/**
 * Integration Tests: GameContext - Config & Speed
 * Tests config storage and game speed delays with full Context
 * @lastModified 2025-10-10
 * @version 1.1.0
 * @testType integration
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { GameProvider, useGame } from '../../../src/context/GameContext.jsx';

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
global.fetch = jest.fn();

describe('GameContext - Config Storage and Speed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockEventSource.reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Config Storage', () => {
    test('should store config before starting match', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Advance fake timers to allow EventSource connection
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matchId: 'test-123' }),
      });

      // Act: Start match with config
      await act(async () => {
        await result.current.startMatch(
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          {
            speed: 'slow',
            boardSize: '3x3',
            noTie: true,
          }
        );
      });

      // Assert: Config should be stored in state
      expect(result.current.config).toEqual({
        speed: 'slow',
        boardSize: '3x3',
        noTie: true,
      });
    });

    test('should use default config values if not provided', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Advance fake timers to allow EventSource connection
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matchId: 'test-123' }),
      });

      await act(async () => {
        await result.current.startMatch(
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          {} // Empty options
        );
      });

      // Assert: Should have default values
      expect(result.current.config).toEqual({
        speed: 'normal',
        boardSize: '3x3',
        noTie: false,
      });
    });

    test('should have config available when processing move queue', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Advance fake timers to allow EventSource connection
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matchId: 'test-123' }),
      });

      // Start match with specific speed
      await act(async () => {
        await result.current.startMatch(
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          { speed: 'fast' }
        );
      });

      // Wait for EventSource
      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Trigger a move event
      act(() => {
        eventSource.trigger('match:move', {
          player: { name: 'Player1' },
          move: 0,
          board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
          turn: 1,
        });
      });

      // Assert: Config should be accessible during queue processing
      expect(result.current.config.speed).toBe('fast');
    });
  });

  describe('Game Speed Delays', () => {
    test('should apply slow speed delay (2000ms)', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Advance fake timers to allow EventSource connection
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matchId: 'test-123' }),
      });

      // Start with slow speed
      await act(async () => {
        await result.current.startMatch(
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          { speed: 'slow' }
        );
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Trigger move event
      act(() => {
        eventSource.trigger('match:move', {
          move: 0,
          board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
        });
      });

      // Assert: Board should NOT update immediately
      expect(result.current.board).toEqual(Array(9).fill(0));

      // Fast-forward 1999ms - should still not update
      act(() => {
        jest.advanceTimersByTime(1999);
      });
      expect(result.current.board).toEqual(Array(9).fill(0));

      // Fast-forward 1ms more (total 2000ms) - should now update
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current.board).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    test('should apply normal speed delay (1000ms)', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Advance fake timers to allow EventSource connection
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matchId: 'test-123' }),
      });

      await act(async () => {
        await result.current.startMatch(
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          { speed: 'normal' }
        );
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      act(() => {
        eventSource.trigger('match:move', {
          move: 0,
          board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
        });
      });

      // Fast-forward 1000ms
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(result.current.board).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    test('should apply fast speed delay (200ms)', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Advance fake timers to allow EventSource connection
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matchId: 'test-123' }),
      });

      await act(async () => {
        await result.current.startMatch(
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          { speed: 'fast' }
        );
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      act(() => {
        eventSource.trigger('match:move', {
          move: 0,
          board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
        });
      });

      // Fast-forward 200ms
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(result.current.board).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0]);
    });
  });
});
