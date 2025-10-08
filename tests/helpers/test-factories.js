/**
 * Test Data Factories
 * Provides complete, valid test data for all test types
 * Following fix.plan.md Stage 3 requirements
 * @lastModified 2025-10-08
 * @version 2.0.0
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
    isHuman: false,
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
 * Create mock arbitrator core
 * @param {Object} overrides - Properties to override
 * @returns {Object} Complete arbitrator core mock
 */
export function createMockArbitratorCore(overrides = {}) {
  return {
    createInitialBoard: jest.fn().mockReturnValue(Array(9).fill(0)),
    isValidMove: jest.fn().mockReturnValue(true),
    makeMove: jest.fn().mockReturnValue(true),
    checkWinner: jest.fn().mockReturnValue(null),
    isBoardFull: jest.fn().mockReturnValue(false),
    getNextPlayer: jest.fn().mockReturnValue('O'),
    checkGameOver: jest.fn().mockReturnValue({ gameOver: false, winner: null }),
    getValidMoves: jest.fn().mockReturnValue([0, 1, 2, 3, 4, 5, 6, 7, 8]),
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
  const mockDate = new Date('2025-10-07T10:00:00.000Z');
  return {
    now: jest.fn(() => mockDate),
    toISOString: jest.fn(() => '2025-10-07T10:00:00.000Z'),
    ...overrides,
  };
}

/**
 * Create mock delay function
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
    arbitratorCore: createMockArbitratorCore(),
    httpAdapter: createMockHttpAdapter(),
    eventsAdapter: createMockEventsAdapter(),
    logger: createMockLogger(),
    clock: createMockClock(),
    delay: createMockDelay(),
    ...overrides,
  };
}

/**
 * Create complete TournamentCoordinator dependencies
 * @param {Object} overrides - Properties to override
 * @returns {Object} Complete dependencies object
 */
export function createMockTournamentDependencies(overrides = {}) {
  return {
    arbitrator: createMockArbitratorCore(),
    eventsAdapter: createMockEventsAdapter(),
    logger: createMockLogger(),
    clock: createMockClock(),
    ...overrides,
  };
}

/**
 * Create mock SSE response object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Complete SSE response mock
 */
export function createMockSSEResponse(overrides = {}) {
  return {
    writeHead: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
    destroy: jest.fn(),
    ...overrides,
  };
}

/**
 * Create mock Express request object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Complete Express request mock
 */
export function createMockRequest(overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    method: 'GET',
    url: '/',
    ...overrides,
  };
}

/**
 * Create mock Express response object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Complete Express response mock
 */
export function createMockResponse(overrides = {}) {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    ...overrides,
  };
}
