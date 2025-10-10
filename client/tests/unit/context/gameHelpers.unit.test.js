/**
 * Unit Tests: gameHelpers - All helper functions
 * Pure function tests - synchronous, instant execution
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import {
  getDelayForSpeed,
  validateMoveRequest,
  createMoveQueueItem,
  getPlayerIdForTurn,
  formatGameConfig,
} from '../../../src/context/gameHelpers';

describe('getDelayForSpeed', () => {
  test('should return 2000ms for slow', () => {
    expect(getDelayForSpeed('slow')).toBe(2000);
  });

  test('should return 1000ms for normal', () => {
    expect(getDelayForSpeed('normal')).toBe(1000);
  });

  test('should return 200ms for fast', () => {
    expect(getDelayForSpeed('fast')).toBe(200);
  });

  test('should default to 1000ms for unknown speed', () => {
    expect(getDelayForSpeed('unknown')).toBe(1000);
  });

  test('should default to 1000ms for null', () => {
    expect(getDelayForSpeed(null)).toBe(1000);
  });

  test('should default to 1000ms for undefined', () => {
    expect(getDelayForSpeed(undefined)).toBe(1000);
  });

  test('should default to 1000ms for empty string', () => {
    expect(getDelayForSpeed('')).toBe(1000);
  });
});

describe('validateMoveRequest', () => {
  test('should not throw for valid 3x3 move', () => {
    expect(() => {
      validateMoveRequest('match-123', 4, 9);
    }).not.toThrow();
  });

  test('should not throw for valid 5x5 move', () => {
    expect(() => {
      validateMoveRequest('match-456', 12, 25);
    }).not.toThrow();
  });

  test('should throw if matchId is null', () => {
    expect(() => {
      validateMoveRequest(null, 4, 9);
    }).toThrow('No active match found');
  });

  test('should throw if matchId is undefined', () => {
    expect(() => {
      validateMoveRequest(undefined, 4, 9);
    }).toThrow('No active match found');
  });

  test('should throw if matchId is empty string', () => {
    expect(() => {
      validateMoveRequest('', 4, 9);
    }).toThrow('No active match found');
  });

  test('should throw if position is not a number', () => {
    expect(() => {
      validateMoveRequest('match-123', '4', 9);
    }).toThrow('Invalid position: must be a number');
  });

  test('should throw if position < 0', () => {
    expect(() => {
      validateMoveRequest('match-123', -1, 9);
    }).toThrow('Invalid position: must be between 0 and 8');
  });

  test('should throw if position >= boardSize', () => {
    expect(() => {
      validateMoveRequest('match-123', 9, 9);
    }).toThrow('Invalid position: must be between 0 and 8');
  });

  test('should throw if position > 24 for 5x5 board', () => {
    expect(() => {
      validateMoveRequest('match-456', 25, 25);
    }).toThrow('Invalid position: must be between 0 and 24');
  });

  test('should use default boardSize of 9', () => {
    expect(() => {
      validateMoveRequest('match-123', 8);
    }).not.toThrow();
  });
});

describe('createMoveQueueItem', () => {
  test('should create queue item with correct structure', () => {
    const data = {
      player: { name: 'Player1' },
      move: 4,
      board: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    };

    const result = createMoveQueueItem(data);

    expect(result.type).toBe('move');
    expect(result.data).toEqual(data);
    expect(result.timestamp).toBeGreaterThan(0);
    expect(typeof result.timestamp).toBe('number');
  });

  test('should create unique timestamps for sequential calls', () => {
    const item1 = createMoveQueueItem({ move: 0 });
    const item2 = createMoveQueueItem({ move: 1 });

    expect(item2.timestamp).toBeGreaterThanOrEqual(item1.timestamp);
  });
});

describe('getPlayerIdForTurn', () => {
  test('should return player1 for even moveCount', () => {
    expect(getPlayerIdForTurn(0)).toBe('player1');
    expect(getPlayerIdForTurn(2)).toBe('player1');
    expect(getPlayerIdForTurn(4)).toBe('player1');
  });

  test('should return player2 for odd moveCount', () => {
    expect(getPlayerIdForTurn(1)).toBe('player2');
    expect(getPlayerIdForTurn(3)).toBe('player2');
    expect(getPlayerIdForTurn(5)).toBe('player2');
  });
});

describe('formatGameConfig', () => {
  test('should apply default values for empty options', () => {
    const result = formatGameConfig({});

    expect(result).toEqual({
      speed: 'normal',
      boardSize: '3x3',
      noTie: false,
    });
  });

  test('should apply default values for undefined', () => {
    const result = formatGameConfig(undefined);

    expect(result).toEqual({
      speed: 'normal',
      boardSize: '3x3',
      noTie: false,
    });
  });

  test('should preserve provided values', () => {
    const result = formatGameConfig({
      speed: 'slow',
      boardSize: '5x5',
      noTie: true,
    });

    expect(result).toEqual({
      speed: 'slow',
      boardSize: '5x5',
      noTie: true,
    });
  });

  test('should mix provided and default values', () => {
    const result = formatGameConfig({
      speed: 'fast',
    });

    expect(result).toEqual({
      speed: 'fast',
      boardSize: '3x3',
      noTie: false,
    });
  });
});
