/**
 * Test Data Factories
 * Provides complete, valid test data for all test types
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

/**
 * Create a complete mock player with all required properties
 * @param {Object} overrides - Properties to override
 * @returns {Object} Complete player object
 */
export function createMockPlayer(overrides = {}) {
  return {
    name: 'TestBot',
    type: 'algorithm',
    port: 3001,
    host: 'localhost',
    protocol: 'http',
    ...overrides,
  };
}

/**
 * Create multiple mock players
 * @param {number} count - Number of players to create
 * @param {Object} baseOverrides - Base overrides for all players
 * @returns {Array} Array of complete player objects
 */
export function createMockPlayers(count = 2, baseOverrides = {}) {
  return Array.from({ length: count }, (_, i) =>
    createMockPlayer({
      name: `Bot${i + 1}`,
      port: 3001 + i,
      ...baseOverrides,
    })
  );
}

/**
 * Create complete mock match data
 * @param {Object} overrides - Properties to override
 * @returns {Object} Complete match data object
 */
export function createMockMatchData(overrides = {}) {
  return {
    winner: createMockPlayer({ name: 'Bot1' }),
    players: createMockPlayers(),
    moves: 5,
    duration: 2000,
    boardSize: 3,
    gameMode: 'individual',
    timestamp: '2025-10-07T10:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create mock HTTP adapter
 * @param {Object} overrides - Properties to override
 * @returns {Object} Complete HTTP adapter mock
 */
export function createMockHttpAdapter(overrides = {}) {
  return {
    requestMove: jest.fn().mockResolvedValue({ move: 0 }),
    makeMove: jest.fn().mockResolvedValue({ row: 0, col: 0 }),
    ...overrides,
  };
}

/**
 * Create mock events adapter
 * @param {Object} overrides - Properties to override
 * @returns {Object} Complete events adapter mock
 */
export function createMockEventsAdapter(overrides = {}) {
  return {
    broadcastMatchStart: jest.fn(),
    broadcastMatchMove: jest.fn(),
    broadcastMatchWin: jest.fn(),
    broadcastMatchDraw: jest.fn(),
    broadcastMatchError: jest.fn(),
    ...overrides,
  };
}

/**
 * Create mock logger
 * @param {Object} overrides - Properties to override
 * @returns {Object} Complete logger mock
 */
export function createMockLogger(overrides = {}) {
  return {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    ...overrides,
  };
}

/**
 * Create mock clock
 * @param {Object} overrides - Properties to override
 * @returns {Object} Complete clock mock
 */
export function createMockClock(overrides = {}) {
  return {
    now: jest.fn(() => new Date('2025-10-07T10:00:00.000Z').getTime()),
    toISOString: jest.fn(() => '2025-10-07T10:00:00.000Z'),
    ...overrides,
  };
}

/**
 * Create mock delay function
 * @param {Object} overrides - Properties to override
 * @returns {Function} Mock delay function
 */
export function createMockDelay() {
  return jest.fn().mockResolvedValue();
}

/**
 * Create complete ArbitratorCoordinator dependencies
 * @param {Object} overrides - Properties to override
 * @returns {Object} Complete dependencies object
 */
export function createMockArbitratorDependencies(overrides = {}) {
  return {
    httpAdapter: createMockHttpAdapter(),
    eventsAdapter: createMockEventsAdapter(),
    logger: createMockLogger(),
    clock: createMockClock(),
    delay: createMockDelay(),
    ...overrides,
  };
}
