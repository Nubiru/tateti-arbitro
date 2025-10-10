/**
 * Integration Tests: GameContext - SSE Events
 * Tests Server-Sent Events handling with full Context (move:removed, etc.)
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

describe('GameContext - SSE Events', () => {
  beforeEach(() => {
    MockEventSource.reset();
  });

  describe('move:removed Event (Infinity Mode)', () => {
    test('should listen for move:removed event (not match:remove)', async () => {
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

      const eventSource = MockEventSource.instances[0];

      // Assert: Should have listener for 'move:removed'
      expect(eventSource.listeners['move:removed']).toBeDefined();
      expect(eventSource.listeners['move:removed'].length).toBeGreaterThan(0);
    });

    test.skip('should add removal to removalQueue when move:removed event is received', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Trigger move:removed event (infinity mode)
      act(() => {
        eventSource.trigger('move:removed', {
          position: 0,
          player: { name: 'Player1', id: 1 },
          timestamp: new Date().toISOString(),
        });
      });

      // Assert: Removal should be added to removalQueue
      // Increase timeout as state updates may take longer
      await waitFor(
        () => {
          expect(result.current.removalQueue.length).toBeGreaterThanOrEqual(1);
        },
        { timeout: 3000 }
      );

      expect(result.current.removalQueue[0].position).toBe(0);
    });

    test.skip('should process multiple removals in sequence', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Trigger multiple removal events
      act(() => {
        eventSource.trigger('move:removed', {
          position: 0,
          player: { name: 'Player1' },
        });
      });

      act(() => {
        eventSource.trigger('move:removed', {
          position: 1,
          player: { name: 'Player2' },
        });
      });

      // Assert: Both removals should be queued
      await waitFor(() => {
        expect(result.current.removalQueue.length).toBeGreaterThan(0);
      });
    });
  });

  describe('match:move Event', () => {
    test('should queue moves for delayed processing', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Trigger match:move event
      act(() => {
        eventSource.trigger('match:move', {
          player: { name: 'Player1', id: 1 },
          move: 4,
          board: [0, 0, 0, 0, 1, 0, 0, 0, 0],
          turn: 1,
        });
      });

      // Assert: Move should be queued (not immediately applied)
      expect(result.current.moveQueue.length).toBeGreaterThan(0);
    });
  });

  describe('match:win Event', () => {
    test('should dispatch MATCH_COMPLETE with full data', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Trigger match:win event
      act(() => {
        eventSource.trigger('match:win', {
          winner: { name: 'Player1', id: 1 },
          winningLine: [0, 1, 2],
          finalBoard: [1, 1, 1, 2, 2, 0, 0, 0, 0],
          message: 'Player1 ganó!',
          result: 'win',
          history: [
            { move: 0, playerId: 1 },
            { move: 3, playerId: 2 },
            { move: 1, playerId: 1 },
            { move: 4, playerId: 2 },
            { move: 2, playerId: 1 },
          ],
        });
      });

      // Assert: Match should be completed
      await waitFor(() => {
        expect(result.current.gameState).toBe('completed');
        expect(result.current.matchResult).toBeDefined();
        expect(result.current.matchResult.winner.name).toBe('Player1');
        expect(result.current.matchResult.winningLine).toEqual([0, 1, 2]);
        expect(result.current.matchResult.result).toBe('win');
        expect(result.current.matchResult.history).toHaveLength(5);
      });
    });
  });

  describe('match:error Event', () => {
    test('should set error state on match error', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Trigger error event
      act(() => {
        eventSource.trigger('match:error', {
          message: 'Player timeout',
          error: 'TIMEOUT',
        });
      });

      // Assert: Error state should be set
      await waitFor(() => {
        expect(result.current.gameState).toBe('error');
        expect(result.current.error).toBe('Player timeout');
      });
    });
  });

  describe('match:draw Event', () => {
    test('should complete match with draw result', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Trigger draw event
      act(() => {
        eventSource.trigger('match:draw', {
          finalBoard: [1, 2, 1, 1, 2, 2, 2, 1, 1],
          message: 'Empate!',
        });
      });

      // Assert: Match completed as draw
      await waitFor(() => {
        expect(result.current.gameState).toBe('completed');
        expect(result.current.matchResult).toBeDefined();
        expect(result.current.matchResult.winner).toBeNull();
      });
    });
  });

  describe('Connection Management', () => {
    test('should establish SSE connection on mount', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      // Assert: EventSource should be created
      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
        expect(MockEventSource.instances[0].url).toBe('/api/stream');
      });
    });

    test('should set connection status to connected', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Wait for EventSource to connect
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Simulate onopen
      act(() => {
        if (eventSource.onopen) {
          eventSource.onopen();
        }
      });

      // Assert: Connection status should be connected
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });
    });
  });
});
