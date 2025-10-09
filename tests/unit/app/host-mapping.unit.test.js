/**
 * Unit Tests for getHostForPort Logic
 * Tests Docker service name mapping based on DOCKER_DISCOVERY environment variable
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

describe('getHostForPort Logic', () => {
  let originalEnv;
  let getHostForPort;

  beforeEach(() => {
    originalEnv = { ...process.env };

    getHostForPort = port => {
      if (process.env.DOCKER_DISCOVERY === 'true') {
        const portToService = {
          3001: 'random-bot-1',
          3002: 'random-bot-2',
          3003: 'random-bot-3',
          3004: 'random-bot-4',
          3005: 'algo-bot-1',
          3006: 'algo-bot-2',
          3007: 'algo-bot-3',
          3008: 'algo-bot-4',
        };
        return portToService[port] || 'localhost';
      }
      return 'localhost';
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Docker Discovery Enabled', () => {
    beforeEach(() => {
      process.env.DOCKER_DISCOVERY = 'true';
    });

    test('should map port 3001 to random-bot-1', () => {
      expect(getHostForPort(3001)).toBe('random-bot-1');
    });

    test('should map port 3002 to random-bot-2', () => {
      expect(getHostForPort(3002)).toBe('random-bot-2');
    });

    test('should map port 3005 to algo-bot-1', () => {
      expect(getHostForPort(3005)).toBe('algo-bot-1');
    });

    test('should map port 3008 to algo-bot-4', () => {
      expect(getHostForPort(3008)).toBe('algo-bot-4');
    });

    test('should return localhost for unmapped ports', () => {
      expect(getHostForPort(9999)).toBe('localhost');
    });

    test('should return localhost for null port', () => {
      expect(getHostForPort(null)).toBe('localhost');
    });

    test('should return localhost for undefined port', () => {
      expect(getHostForPort(undefined)).toBe('localhost');
    });
  });

  describe('Docker Discovery Disabled', () => {
    beforeEach(() => {
      process.env.DOCKER_DISCOVERY = 'false';
    });

    test('should return localhost for port 3001', () => {
      expect(getHostForPort(3001)).toBe('localhost');
    });

    test('should return localhost for port 3002', () => {
      expect(getHostForPort(3002)).toBe('localhost');
    });

    test('should return localhost for all mapped ports', () => {
      expect(getHostForPort(3001)).toBe('localhost');
      expect(getHostForPort(3005)).toBe('localhost');
      expect(getHostForPort(3008)).toBe('localhost');
    });
  });

  describe('Docker Discovery Not Set', () => {
    beforeEach(() => {
      delete process.env.DOCKER_DISCOVERY;
    });

    test('should return localhost when DOCKER_DISCOVERY is undefined', () => {
      expect(getHostForPort(3001)).toBe('localhost');
    });

    test('should return localhost for all ports', () => {
      expect(getHostForPort(3001)).toBe('localhost');
      expect(getHostForPort(3002)).toBe('localhost');
      expect(getHostForPort(9999)).toBe('localhost');
    });
  });

  describe('Edge Cases', () => {
    test('should handle string "true" correctly', () => {
      process.env.DOCKER_DISCOVERY = 'true';
      expect(getHostForPort(3001)).toBe('random-bot-1');
    });

    test('should not match boolean true', () => {
      process.env.DOCKER_DISCOVERY = true;
      expect(getHostForPort(3001)).toBe('localhost');
    });

    test('should handle empty string as false', () => {
      process.env.DOCKER_DISCOVERY = '';
      expect(getHostForPort(3001)).toBe('localhost');
    });

    test('should handle "TRUE" (uppercase) as false', () => {
      process.env.DOCKER_DISCOVERY = 'TRUE';
      expect(getHostForPort(3001)).toBe('localhost');
    });
  });
});
