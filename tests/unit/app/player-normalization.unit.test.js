/**
 * Unit Tests for Player Normalization Logic
 * Tests player data transformation for arbitrator
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { jest } from '@jest/globals';

describe('Player Normalization Logic', () => {
  let normalizePlayer;
  let getHostForPort;
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };

    getHostForPort = jest.fn(port => {
      if (process.env.DOCKER_DISCOVERY === 'true') {
        const portToService = {
          3001: 'random-bot-1',
          3002: 'random-bot-2',
        };
        return portToService[port] || 'localhost';
      }
      return 'localhost';
    });

    normalizePlayer = (player, getHost) => ({
      name: player.name?.trim(),
      port: player.port,
      host: getHost(player.port),
      protocol: 'http',
      isHuman: player.isHuman || false,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('Name Normalization', () => {
    test('should trim whitespace from player name', () => {
      const player = { name: '  Player1  ', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.name).toBe('Player1');
    });

    test('should handle name with no whitespace', () => {
      const player = { name: 'Player1', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.name).toBe('Player1');
    });

    test('should handle name with tabs and newlines', () => {
      const player = { name: '\t\nPlayer1\n\t', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.name).toBe('Player1');
    });

    test('should handle empty name', () => {
      const player = { name: '', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.name).toBe('');
    });
  });

  describe('Port Handling', () => {
    test('should preserve port number', () => {
      const player = { name: 'Player1', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.port).toBe(3001);
    });

    test('should handle different port numbers', () => {
      const player = { name: 'Player1', port: 3005 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.port).toBe(3005);
    });
  });

  describe('Host Mapping', () => {
    test('should call getHostForPort with player port', () => {
      const player = { name: 'Player1', port: 3001 };
      normalizePlayer(player, getHostForPort);

      expect(getHostForPort).toHaveBeenCalledWith(3001);
    });

    test('should use Docker service name when DOCKER_DISCOVERY=true', () => {
      process.env.DOCKER_DISCOVERY = 'true';
      const player = { name: 'Player1', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.host).toBe('random-bot-1');
    });

    test('should use localhost when DOCKER_DISCOVERY=false', () => {
      process.env.DOCKER_DISCOVERY = 'false';
      const player = { name: 'Player1', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.host).toBe('localhost');
    });
  });

  describe('Protocol', () => {
    test('should always set protocol to http', () => {
      const player = { name: 'Player1', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.protocol).toBe('http');
    });
  });

  describe('isHuman Flag', () => {
    test('should preserve isHuman=true', () => {
      const player = { name: 'Player1', port: 3001, isHuman: true };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.isHuman).toBe(true);
    });

    test('should preserve isHuman=false', () => {
      const player = { name: 'Player1', port: 3001, isHuman: false };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.isHuman).toBe(false);
    });

    test('should default to false when isHuman is undefined', () => {
      const player = { name: 'Player1', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.isHuman).toBe(false);
    });

    test('should default to false when isHuman is null', () => {
      const player = { name: 'Player1', port: 3001, isHuman: null };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.isHuman).toBe(false);
    });
  });

  describe('Complete Normalization', () => {
    test('should normalize complete player object', () => {
      process.env.DOCKER_DISCOVERY = 'true';
      const player = {
        name: '  TestBot  ',
        port: 3001,
        isHuman: false,
      };

      const result = normalizePlayer(player, getHostForPort);

      expect(result).toEqual({
        name: 'TestBot',
        port: 3001,
        host: 'random-bot-1',
        protocol: 'http',
        isHuman: false,
      });
    });

    test('should normalize human player', () => {
      const player = {
        name: 'Human Player',
        port: 3001,
        isHuman: true,
      };

      const result = normalizePlayer(player, getHostForPort);

      expect(result).toEqual({
        name: 'Human Player',
        port: 3001,
        host: 'localhost',
        protocol: 'http',
        isHuman: true,
      });
    });
  });
});
