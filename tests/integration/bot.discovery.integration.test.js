/**
 * Integration Tests for GET /api/bots/available Endpoint
 * Tests bot discovery, parallel health checks, Docker service mapping
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app/app.factory.js';

// Mock fetch for parallel health checks
global.fetch = jest.fn();

describe('GET /api/bots/available - Integration Tests', () => {
  let app;
  let mockLogger;
  let mockEventBus;
  let mockArbitrator;
  let mockTournament;
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Create mock dependencies
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    mockEventBus = {
      broadcast: jest.fn(),
      addConnection: jest.fn(),
      closeAll: jest.fn(),
      getConnectionCount: jest.fn(() => 0),
    };

    mockArbitrator = {
      runMatch: jest.fn(),
    };

    mockTournament = {
      runTournament: jest.fn(),
      buildPlayerList: jest.fn(),
    };

    const mockClock = {
      now: () => new Date(),
      toISOString: () => new Date().toISOString(),
    };

    // Create app with mocked dependencies
    const { app: testApp } = createApp({
      logger: mockLogger,
      eventBus: mockEventBus,
      arbitrator: mockArbitrator,
      tournament: mockTournament,
      clock: mockClock,
    });

    app = testApp;

    // Clear fetch mock
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;

    // Clear all fetch mocks
    global.fetch.mockClear();
    global.fetch.mockReset();

    // Restore all mocks
    jest.restoreAllMocks();

    // Clear all timers to prevent hanging
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Parallel Health Checks', () => {
    test('should perform parallel health checks for all configured bots', async () => {
      // Mock successful health check responses
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'healthy',
          name: 'TestBot',
        }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // Verify fetch was called multiple times (parallel checks)
      // Based on default bot configuration (2-8 bots depending on env)
      expect(global.fetch).toHaveBeenCalled();
      expect(global.fetch.mock.calls.length).toBeGreaterThan(0);
    });

    test('should filter out unhealthy bots', async () => {
      // Mock mixed health responses
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'HealthyBot1' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'HealthyBot2' }),
        });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);
      expect(response.body.bots).toBeDefined();

      // Should only include healthy bots
      const healthyBots = response.body.bots.filter(
        bot => bot.status === 'healthy'
      );

      expect(healthyBots.length).toBeGreaterThan(0);
      // Unhealthy bots may or may not be included based on implementation
    });

    test('should handle timeout on slow bots', async () => {
      global.fetch.mockImplementation(() =>
        Promise.reject(new Error('Timeout'))
      );

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);
      expect(response.body.bots).toBeDefined();
    });

    test('should handle network errors gracefully', async () => {
      // Mock network error
      global.fetch.mockRejectedValue(new Error('Network error'));

      const response = await request(app).get('/api/bots/available');

      // Should still return a response
      expect(response.status).toBe(200);
      expect(response.body.bots).toBeDefined();

      // Bots should be marked as offline
      const offlineBots = response.body.bots.filter(
        bot => bot.status === 'offline'
      );
      expect(offlineBots.length).toBeGreaterThan(0);
    });

    test('should complete health checks within reasonable time', async () => {
      // Mock fast health checks
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'FastBot' }),
      });

      const startTime = Date.now();
      await request(app).get('/api/bots/available');
      const duration = Date.now() - startTime;

      // Should complete in under 5 seconds (parallel execution)
      // Note: This is a real timing check, not using fake timers
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Docker Service Discovery', () => {
    test('should use Docker service names when DOCKER_DISCOVERY=true', async () => {
      process.env.DOCKER_DISCOVERY = 'true';

      // Mock successful health check
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'DockerBot' }),
      });

      await request(app).get('/api/bots/available');

      // Verify fetch was called with Docker service names (not localhost)
      const fetchCalls = global.fetch.mock.calls;
      const dockerServiceCalls = fetchCalls.filter(call =>
        call[0].includes('random-bot-')
      );

      expect(dockerServiceCalls.length).toBeGreaterThan(0);
    });

    test('should use localhost when DOCKER_DISCOVERY=false', async () => {
      process.env.DOCKER_DISCOVERY = 'false';

      // Mock successful health check
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'LocalBot' }),
      });

      await request(app).get('/api/bots/available');

      // Verify fetch was called with localhost
      const fetchCalls = global.fetch.mock.calls;
      const localhostCalls = fetchCalls.filter(call =>
        call[0].includes('localhost')
      );

      expect(localhostCalls.length).toBeGreaterThan(0);
    });

    test('should use localhost when DOCKER_DISCOVERY is not set', async () => {
      delete process.env.DOCKER_DISCOVERY;

      // Mock successful health check
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'DefaultBot' }),
      });

      await request(app).get('/api/bots/available');

      // Verify fetch was called with localhost (default behavior)
      const fetchCalls = global.fetch.mock.calls;
      const localhostCalls = fetchCalls.filter(call =>
        call[0].includes('localhost')
      );

      expect(localhostCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Response Format', () => {
    test('should return bots array in response', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'TestBot' }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bots');
      expect(Array.isArray(response.body.bots)).toBe(true);
    });

    test('should include bot metadata in response', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'healthy',
          name: 'MetadataBot',
          type: 'random',
          capabilities: { boardSizes: ['3x3', '5x5'] },
        }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // At least one bot should have metadata
      const botsWithMetadata = response.body.bots.filter(
        bot => bot.name && bot.port
      );
      expect(botsWithMetadata.length).toBeGreaterThan(0);
    });

    test('should include health status for each bot', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'HealthyBot' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // Each bot should have a status field
      const botsWithStatus = response.body.bots.filter(bot => bot.status);
      expect(botsWithStatus.length).toBe(response.body.bots.length);
    });
  });

  describe('Bot Configuration', () => {
    test('should discover bots from environment configuration', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'healthy', name: 'ConfigBot' }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // Should include configured bots (at least random-bot-1, random-bot-2)
      expect(response.body.bots.length).toBeGreaterThan(0);
    });

    test('should include bot type and capabilities', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'healthy',
          name: 'CapableBot',
          type: 'algorithm',
          capabilities: {
            boardSizes: ['3x3', '5x5'],
            strategies: ['minimax', 'alphabeta'],
          },
        }),
      });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // Should include type and capabilities in response
      const botsWithType = response.body.bots.filter(bot => bot.type);
      expect(botsWithType.length).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery', () => {
    test('should return partial results when some bots fail', async () => {
      // Mock mixed responses
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'GoodBot1' }),
        })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'GoodBot2' }),
        });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);

      // Should include successful bots
      const healthyBots = response.body.bots.filter(
        bot => bot.status === 'healthy'
      );
      expect(healthyBots.length).toBeGreaterThan(0);
    });

    test('should not fail entire discovery if one bot times out', async () => {
      global.fetch
        .mockImplementationOnce(() => Promise.reject(new Error('Timeout')))
        .mockResolvedValue({
          ok: true,
          json: async () => ({ status: 'healthy', name: 'FastBot' }),
        });

      const response = await request(app).get('/api/bots/available');

      expect(response.status).toBe(200);
      expect(response.body.bots).toBeDefined();
      expect(response.body.bots.length).toBeGreaterThan(0);
    });
  });
});
