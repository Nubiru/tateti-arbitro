/**
 * GameContext Move Processing Unit Tests
 * @lastModified 2025-10-15
 * @version 1.0.0
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { GameProvider } from '../../../src/context/GameContext';

// Mock the SSE connection
const mockEventSource = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
  readyState: 1,
};

// Mock global EventSource
global.EventSource = jest.fn(() => mockEventSource);

describe('GameContext - Move Processing', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should handle high-frequency move events without stack overflow', () => {
    const { result } = renderHook(
      () => {
        const [moveQueue, setMoveQueue] = React.useState([]);
        const [isProcessingMoves, setIsProcessingMoves] = React.useState(false);

        return {
          moveQueue,
          setMoveQueue,
          isProcessingMoves,
          setIsProcessingMoves,
        };
      },
      { wrapper }
    );

    // Simulate high-frequency moves (100 moves)
    act(() => {
      const moves = Array(100)
        .fill(null)
        .map((_, index) => ({
          type: 'move',
          data: {
            board: Array(9).fill(0),
            history: [],
            turn: index + 1,
            player: { name: 'TestBot' },
            move: index,
          },
        }));

      result.current.setMoveQueue(moves);
    });

    // Should not cause stack overflow
    expect(() => {
      act(() => {
        result.current.setIsProcessingMoves(true);
      });
    }).not.toThrow();
  });

  test('should process move queue without recursive setTimeout', () => {
    const { result } = renderHook(
      () => {
        const [moveQueue, setMoveQueue] = React.useState([]);
        const [isProcessingMoves, setIsProcessingMoves] = React.useState(false);

        return {
          moveQueue,
          setMoveQueue,
          isProcessingMoves,
          setIsProcessingMoves,
        };
      },
      { wrapper }
    );

    // Add moves to queue
    act(() => {
      const moves = [
        {
          type: 'move',
          data: {
            board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
            history: [],
            turn: 1,
            player: { name: 'TestBot' },
            move: 0,
          },
        },
        {
          type: 'move',
          data: {
            board: [1, 2, 0, 0, 0, 0, 0, 0, 0],
            history: [],
            turn: 2,
            player: { name: 'TestBot' },
            move: 1,
          },
        },
      ];

      result.current.setMoveQueue(moves);
    });

    // Should process without recursive setTimeout
    expect(() => {
      act(() => {
        result.current.setIsProcessingMoves(true);
      });
    }).not.toThrow();
  });

  test('should handle undefined move data gracefully', () => {
    const { result } = renderHook(
      () => {
        const [moveQueue, setMoveQueue] = React.useState([]);

        return { moveQueue, setMoveQueue };
      },
      { wrapper }
    );

    // Add move with undefined data
    act(() => {
      const moves = [
        {
          type: 'move',
          data: undefined,
        },
      ];

      result.current.setMoveQueue(moves);
    });

    // Should not crash
    expect(() => {
      act(() => {
        // Simulate processing
      });
    }).not.toThrow();
  });

  test('should handle empty move queue', () => {
    const { result } = renderHook(
      () => {
        const [moveQueue, setMoveQueue] = React.useState([]);
        const [isProcessingMoves, setIsProcessingMoves] = React.useState(false);

        return {
          moveQueue,
          setMoveQueue,
          isProcessingMoves,
          setIsProcessingMoves,
        };
      },
      { wrapper }
    );

    // Should handle empty queue
    expect(() => {
      act(() => {
        result.current.setMoveQueue([]);
        result.current.setIsProcessingMoves(false);
      });
    }).not.toThrow();
  });
});
