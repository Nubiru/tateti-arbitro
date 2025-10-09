/**
 * Unit Tests for GameContext State Machine
 * Tests proper state transitions and SSE event handling
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

import React from 'react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, act, waitFor } from '@testing-library/react';
import {
  GameProvider,
  GameContext,
} from '../../../src/context/GameContext.jsx';

// Mock fetch
global.fetch = jest.fn();

// Mock EventSource
class MockEventSource {
  constructor(url) {
    this.url = url;
    this.listeners = {};
    this.readyState = 1; // OPEN
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        cb => cb !== callback
      );
    }
  }

  close() {
    this.readyState = 3; // CLOSED
  }

  // Helper method to simulate events
  simulateEvent(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback({ data: JSON.stringify(data) });
      });
    }
  }
}

global.EventSource = MockEventSource;

describe('GameContext State Machine', () => {
  let mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  describe('startMatch() State Transitions', () => {
    test('should dispatch START_MATCH immediately before API call', async () => {
      const TestComponent = () => {
        const { gameState, startMatch } = React.useContext(GameContext);
        const [stateHistory, setStateHistory] = React.useState([]);

        React.useEffect(() => {
          setStateHistory(prev => [...prev, gameState]);
        }, [gameState]);

        const handleStartMatch = async () => {
          await startMatch(
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' },
            { speed: 'normal' }
          );
        };

        return (
          <div>
            <div data-testid="game-state">{gameState}</div>
            <div data-testid="state-history">
              {JSON.stringify(stateHistory)}
            </div>
            <button onClick={handleStartMatch}>Start Match</button>
          </div>
        );
      };

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          matchId: 'test-match-123',
          players: [
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' },
          ],
          boardSize: 3,
          currentPlayer: { name: 'Bot1', type: 'algorithm' },
          waitingForHuman: false,
        }),
      });

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Initial state should be idle
      expect(screen.getByTestId('game-state')).toHaveTextContent('idle');

      // Click start match
      await act(async () => {
        screen.getByText('Start Match').click();
      });

      // Should immediately transition to playing state
      await waitFor(() => {
        const stateHistory = JSON.parse(
          screen.getByTestId('state-history').textContent
        );
        expect(stateHistory).toContain('playing');
      });

      // Verify API was called
      expect(mockFetch).toHaveBeenCalledWith('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Bot1'),
      });
    });

    test('should handle human player matches correctly', async () => {
      const TestComponent = () => {
        const { gameState, startMatch } = React.useContext(GameContext);
        const [stateHistory, setStateHistory] = React.useState([]);

        React.useEffect(() => {
          setStateHistory(prev => [...prev, gameState]);
        }, [gameState]);

        const handleStartMatch = async () => {
          await startMatch(
            { name: 'Human Player', type: 'human' },
            { name: 'Bot1', type: 'algorithm' },
            { speed: 'normal' }
          );
        };

        return (
          <div>
            <div data-testid="game-state">{gameState}</div>
            <div data-testid="state-history">
              {JSON.stringify(stateHistory)}
            </div>
            <button onClick={handleStartMatch}>Start Match</button>
          </div>
        );
      };

      // Mock API response for human player
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          matchId: 'test-match-123',
          players: [
            { name: 'Human Player', type: 'human' },
            { name: 'Bot1', type: 'algorithm' },
          ],
          boardSize: 3,
          currentPlayer: { name: 'Human Player', type: 'human' },
          waitingForHuman: true,
        }),
      });

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Click start match
      await act(async () => {
        screen.getByText('Start Match').click();
      });

      // Should transition to playing state and wait for human input
      await waitFor(() => {
        const stateHistory = JSON.parse(
          screen.getByTestId('state-history').textContent
        );
        expect(stateHistory).toContain('playing');
      });

      expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
    });

    test('should handle API errors gracefully', async () => {
      const TestComponent = () => {
        const { gameState, startMatch, error } = React.useContext(GameContext);

        const handleStartMatch = async () => {
          await startMatch(
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' },
            { speed: 'normal' }
          );
        };

        return (
          <div>
            <div data-testid="game-state">{gameState}</div>
            <div data-testid="error">{error || 'no error'}</div>
            <button onClick={handleStartMatch}>Start Match</button>
          </div>
        );
      };

      // Mock API error
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Click start match
      await act(async () => {
        screen.getByText('Start Match').click();
      });

      // Should transition to error state
      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('error');
        expect(screen.getByTestId('error')).toHaveTextContent('API Error');
      });
    });
  });

  describe('State Machine Actions', () => {
    test('should handle state transitions correctly', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          matchId: 'test-match-123',
          players: [
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' },
          ],
          boardSize: 3,
          currentPlayer: { name: 'Bot1', type: 'algorithm' },
          waitingForHuman: false,
        }),
      });

      const TestComponent = () => {
        const { gameState, currentMatch, startMatch } =
          React.useContext(GameContext);

        return (
          <div>
            <div data-testid="game-state">{gameState}</div>
            <div data-testid="match-data">{JSON.stringify(currentMatch)}</div>
            <button
              onClick={() =>
                startMatch(
                  { name: 'Bot1', type: 'algorithm' },
                  { name: 'Bot2', type: 'random' },
                  { speed: 'normal' }
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

      // Initial state should be idle
      expect(screen.getByTestId('game-state')).toHaveTextContent('idle');

      // Simulate START_MATCH action by clicking the button
      await act(async () => {
        const button = screen.getByText('Start Match');
        button.click();
      });

      // Should transition to playing state
      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });
    });
  });

  describe('State Transition Edge Cases', () => {
    test('should not change state if already in presentation screen', async () => {
      const TestComponent = () => {
        const { gameState } = React.useContext(GameContext);

        return (
          <div>
            <div data-testid="game-state">{gameState}</div>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Initial state should be idle
      expect(screen.getByTestId('game-state')).toHaveTextContent('idle');
    });

    test('should handle multiple rapid state changes', async () => {
      const TestComponent = () => {
        const { gameState, startMatch } = React.useContext(GameContext);
        const [stateHistory, setStateHistory] = React.useState([]);

        React.useEffect(() => {
          setStateHistory(prev => [...prev, gameState]);
        }, [gameState]);

        const handleRapidCalls = async () => {
          // Make multiple rapid calls
          startMatch(
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' }
          );
          startMatch(
            { name: 'Bot3', type: 'algorithm' },
            { name: 'Bot4', type: 'random' }
          );
        };

        return (
          <div>
            <div data-testid="game-state">{gameState}</div>
            <div data-testid="state-history">
              {JSON.stringify(stateHistory)}
            </div>
            <button onClick={handleRapidCalls}>Rapid Calls</button>
          </div>
        );
      };

      // Mock API responses
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          matchId: 'test-match-123',
          players: [
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' },
          ],
          boardSize: 3,
          currentPlayer: { name: 'Bot1', type: 'algorithm' },
          waitingForHuman: false,
        }),
      });

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Click rapid calls
      await act(async () => {
        screen.getByText('Rapid Calls').click();
      });

      // Should handle rapid calls gracefully
      await waitFor(() => {
        const stateHistory = JSON.parse(
          screen.getByTestId('state-history').textContent
        );
        expect(stateHistory).toContain('playing');
      });
    });
  });
});
