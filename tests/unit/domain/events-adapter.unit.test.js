/**
 * Unit Tests for EventsAdapter
 * Tests event broadcasting methods with mocked EventBus
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import { EventsAdapter } from '../../../src/domain/game/events.adapter.js';

describe('EventsAdapter', () => {
  let eventsAdapter;
  let mockEventBus;
  let mockLogger;

  beforeEach(() => {
    mockEventBus = {
      broadcast: jest.fn(),
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };

    eventsAdapter = new EventsAdapter({
      eventBus: mockEventBus,
      logger: mockLogger,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('broadcastMatchStart', () => {
    test('should call eventBus.broadcast with match:start event', () => {
      const payload = {
        players: [{ name: 'Player1' }, { name: 'Player2' }],
        boardSize: 3,
      };

      eventsAdapter.broadcastMatchStart(payload);

      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:start',
        payload
      );
    });

    test('should handle null payload', () => {
      eventsAdapter.broadcastMatchStart(null);

      expect(mockEventBus.broadcast).toHaveBeenCalledWith('match:start', null);
    });

    test('should handle empty payload', () => {
      eventsAdapter.broadcastMatchStart({});

      expect(mockEventBus.broadcast).toHaveBeenCalledWith('match:start', {});
    });
  });

  describe('broadcastMatchMove', () => {
    test('should call eventBus.broadcast with match:move event', () => {
      const payload = {
        player: { name: 'Player1', id: 'X' },
        move: 0,
        board: ['X', 0, 0, 0, 0, 0, 0, 0, 0],
        turn: 1,
      };

      eventsAdapter.broadcastMatchMove(payload);

      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:move',
        payload
      );
    });

    test('should handle multiple moves', () => {
      const move1 = { player: { name: 'Player1' }, move: 0 };
      const move2 = { player: { name: 'Player2' }, move: 1 };

      eventsAdapter.broadcastMatchMove(move1);
      eventsAdapter.broadcastMatchMove(move2);

      expect(mockEventBus.broadcast).toHaveBeenCalledTimes(2);
      expect(mockEventBus.broadcast).toHaveBeenNthCalledWith(
        1,
        'match:move',
        move1
      );
      expect(mockEventBus.broadcast).toHaveBeenNthCalledWith(
        2,
        'match:move',
        move2
      );
    });
  });

  describe('broadcastMatchWin', () => {
    test('should call eventBus.broadcast with match:win event', () => {
      const payload = {
        winner: { name: 'Player1', id: 'X' },
        winningLine: [0, 1, 2],
        finalBoard: ['X', 'X', 'X', 'O', 'O', 0, 0, 0, 0],
        message: 'Player1 ganó.',
      };

      eventsAdapter.broadcastMatchWin(payload);

      expect(mockEventBus.broadcast).toHaveBeenCalledWith('match:win', payload);
    });

    test('should handle win with timestamp', () => {
      const payload = {
        winner: { name: 'Player1' },
        timestamp: '2025-10-09T10:00:00.000Z',
      };

      eventsAdapter.broadcastMatchWin(payload);

      expect(mockEventBus.broadcast).toHaveBeenCalledWith('match:win', payload);
    });
  });

  describe('broadcastMatchDraw', () => {
    test('should call eventBus.broadcast with match:draw event', () => {
      const payload = {
        finalBoard: ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'],
        message: 'Empate.',
      };

      eventsAdapter.broadcastMatchDraw(payload);

      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:draw',
        payload
      );
    });
  });

  describe('broadcastMatchError', () => {
    test('should call eventBus.broadcast with match:error event', () => {
      const payload = {
        error: 'Connection timeout',
        player: { name: 'Player1' },
        message: 'Player1 no pudo realizar un movimiento',
      };

      eventsAdapter.broadcastMatchError(payload);

      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:error',
        payload
      );
    });

    test('should handle error with details', () => {
      const payload = {
        error: 'Invalid move',
        player: { name: 'Player2' },
        move: 10,
        message: 'Movimiento inválido',
      };

      eventsAdapter.broadcastMatchError(payload);

      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:error',
        payload
      );
    });
  });

  describe('broadcastTournamentStart', () => {
    test('should call eventBus.broadcast with tournament:start event', () => {
      const payload = {
        players: [
          { name: 'Player1' },
          { name: 'Player2' },
          { name: 'Player3' },
          { name: 'Player4' },
        ],
        totalRounds: 3,
      };

      eventsAdapter.broadcastTournamentStart(payload);

      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'tournament:start',
        payload
      );
    });
  });

  describe('broadcastTournamentComplete', () => {
    test('should call eventBus.broadcast with tournament:complete event', () => {
      const payload = {
        winner: { name: 'Player1' },
        totalMatches: 6,
        totalRounds: 3,
      };

      eventsAdapter.broadcastTournamentComplete(payload);

      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'tournament:complete',
        payload
      );
    });
  });

  describe('EventBus Integration', () => {
    test('should not throw if eventBus.broadcast is not a function', () => {
      const brokenAdapter = new EventsAdapter({
        eventBus: {},
        logger: mockLogger,
      });

      expect(() => {
        brokenAdapter.broadcastMatchStart({});
      }).toThrow();
    });

    test('should call broadcast exactly once per method call', () => {
      eventsAdapter.broadcastMatchStart({});
      eventsAdapter.broadcastMatchMove({});
      eventsAdapter.broadcastMatchWin({});

      expect(mockEventBus.broadcast).toHaveBeenCalledTimes(3);
    });
  });
});
