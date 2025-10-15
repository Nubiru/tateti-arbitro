/**
 * PlayerService Unit Tests
 * Tests for player discovery, generation, and management
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import { PlayerService } from '../../../src/services/PlayerService';

// Mock fetch globally
global.fetch = jest.fn();

describe('PlayerService', () => {
  let playerService;

  beforeEach(() => {
    playerService = new PlayerService();
    jest.clearAllMocks();
  });

  describe('discoverBots', () => {
    test('debería descubrir bots exitosamente', async () => {
      const mockBots = [
        { name: 'Bot1', port: 3001, status: 'healthy', type: 'random' },
        { name: 'Bot2', port: 3002, status: 'healthy', type: 'algorithm' },
        { name: 'Bot3', port: 3003, status: 'unhealthy', type: 'random' },
      ];

      // Mock fetch to return immediately
      global.fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ bots: mockBots }),
        })
      );

      const result = await playerService.discoverBots();

      expect(global.fetch).toHaveBeenCalledWith('/api/bots/available');
      expect(result).toEqual({
        success: true,
        bots: mockBots,
        error: null,
      });
    });

    test('debería manejar error de red', async () => {
      // Mock fetch to reject immediately
      global.fetch.mockImplementation(() =>
        Promise.reject(new Error('Network error'))
      );

      const result = await playerService.discoverBots();

      expect(result).toEqual({
        success: false,
        bots: [],
        error: 'Network error',
      });
    });

    test('debería manejar respuesta no exitosa', async () => {
      // Mock fetch to return error response immediately
      global.fetch.mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      );

      const result = await playerService.discoverBots();

      expect(result).toEqual({
        success: false,
        bots: [],
        error: 'Error al descubrir bots: 500',
      });
    });
  });

  describe('generatePlayers', () => {
    const mockBots = [
      { name: 'Bot1', port: 3001, status: 'healthy', type: 'random' },
      { name: 'Bot2', port: 3002, status: 'healthy', type: 'algorithm' },
      { name: 'Bot3', port: 3003, status: 'unhealthy', type: 'random' },
    ];

    test('debería generar jugadores usando bots disponibles', () => {
      const result = playerService.generatePlayers(2, mockBots);

      expect(result).toEqual([
        {
          name: 'Bot1',
          port: 3001,
          isHuman: false,
          status: 'healthy',
          type: 'random',
        },
        {
          name: 'Bot2',
          port: 3002,
          isHuman: false,
          status: 'healthy',
          type: 'algorithm',
        },
      ]);
    });

    test('debería generar jugadores con fallback cuando no hay suficientes bots', () => {
      const result = playerService.generatePlayers(4, mockBots);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        name: 'Bot1',
        port: 3001,
        isHuman: false,
        status: 'healthy',
        type: 'random',
      });
      expect(result[1]).toEqual({
        name: 'Bot2',
        port: 3002,
        isHuman: false,
        status: 'healthy',
        type: 'algorithm',
      });
      expect(result[2]).toEqual({
        name: 'RandomBot3',
        port: 3005,
        isHuman: false,
        status: 'unknown',
        type: 'bot',
      });
      expect(result[3]).toEqual({
        name: 'SmartBot2',
        port: 3006,
        isHuman: false,
        status: 'unknown',
        type: 'bot',
      });
    });

    test('debería generar solo bots saludables', () => {
      const result = playerService.generatePlayers(2, mockBots);

      const healthyBots = result.filter(player => player.status === 'healthy');
      expect(healthyBots).toHaveLength(2);
    });

    test('debería manejar lista vacía de bots', () => {
      const result = playerService.generatePlayers(2, []);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'RandomBot1',
        port: 3001,
        isHuman: false,
        status: 'unknown',
        type: 'bot',
      });
      expect(result[1]).toEqual({
        name: 'RandomBot2',
        port: 3002,
        isHuman: false,
        status: 'unknown',
        type: 'bot',
      });
    });
  });

  describe('validatePlayerCount', () => {
    test('debería validar conteo válido', () => {
      expect(playerService.validatePlayerCount(2)).toBe(true);
      expect(playerService.validatePlayerCount(4)).toBe(true);
      expect(playerService.validatePlayerCount(8)).toBe(true);
      expect(playerService.validatePlayerCount(16)).toBe(true);
    });

    test('debería rechazar conteo inválido', () => {
      expect(playerService.validatePlayerCount(1)).toBe(false);
      expect(playerService.validatePlayerCount(0)).toBe(false);
      expect(playerService.validatePlayerCount(-1)).toBe(false);
      expect(playerService.validatePlayerCount(17)).toBe(false);
      expect(playerService.validatePlayerCount(100)).toBe(false);
    });
  });

  describe('getDefaultPlayers', () => {
    test('debería retornar jugadores por defecto', () => {
      const result = playerService.getDefaultPlayers();

      expect(result).toEqual([
        {
          name: 'Bot1',
          port: 3001,
          isHuman: false,
          status: 'unknown',
          type: 'bot',
        },
        {
          name: 'Bot2',
          port: 3002,
          isHuman: false,
          status: 'unknown',
          type: 'bot',
        },
      ]);
    });
  });

  describe('getHealthyBots', () => {
    test('debería filtrar solo bots saludables', () => {
      const mockBots = [
        { name: 'Bot1', port: 3001, status: 'healthy' },
        { name: 'Bot2', port: 3002, status: 'unhealthy' },
        { name: 'Bot3', port: 3003, status: 'healthy' },
      ];

      const result = playerService.getHealthyBots(mockBots);

      expect(result).toEqual([
        { name: 'Bot1', port: 3001, status: 'healthy' },
        { name: 'Bot3', port: 3003, status: 'healthy' },
      ]);
    });
  });
});
