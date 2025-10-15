/**
 * Pruebas Unitarias para Lógica de Normalización de Jugadores
 * Pruebas de transformación de datos de jugadores para árbitro
 * @lastModified 2025-01-27
 * @version 1.1.0
 */

import { jest } from '@jest/globals';

describe('Lógica de Normalización de Jugadores', () => {
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
      port: player.url ? null : player.port || null,
      url: player.url || null,
      host: player.url ? null : getHost(player.port),
      protocol: player.url ? null : 'http',
      isHuman: player.isHuman || false,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('Normalización de Nombres', () => {
    test('debería recortar espacios en blanco del nombre del jugador', () => {
      const player = { name: '  Player1  ', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.name).toBe('Player1');
    });

    test('debería manejar nombre sin espacios en blanco', () => {
      const player = { name: 'Player1', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.name).toBe('Player1');
    });

    test('debería manejar nombre con tabs y saltos de línea', () => {
      const player = { name: '\t\nPlayer1\n\t', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.name).toBe('Player1');
    });

    test('debería manejar nombre vacío', () => {
      const player = { name: '', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.name).toBe('');
    });
  });

  describe('Manejo de Puertos', () => {
    test('debería preservar número de puerto', () => {
      const player = { name: 'Player1', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.port).toBe(3001);
    });

    test('debería manejar diferentes números de puerto', () => {
      const player = { name: 'Player1', port: 3005 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.port).toBe(3005);
    });
  });

  describe('Mapeo de Host', () => {
    test('debería llamar getHostForPort con puerto del jugador', () => {
      const player = { name: 'Player1', port: 3001 };
      normalizePlayer(player, getHostForPort);

      expect(getHostForPort).toHaveBeenCalledWith(3001);
    });

    test('debería usar nombre de servicio Docker cuando DOCKER_DISCOVERY=true', () => {
      process.env.DOCKER_DISCOVERY = 'true';
      const player = { name: 'Player1', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.host).toBe('random-bot-1');
    });

    test('debería usar localhost cuando DOCKER_DISCOVERY=false', () => {
      process.env.DOCKER_DISCOVERY = 'false';
      const player = { name: 'Player1', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.host).toBe('localhost');
    });
  });

  describe('Protocolo', () => {
    test('debería siempre establecer protocolo a http', () => {
      const player = { name: 'Player1', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.protocol).toBe('http');
    });
  });

  describe('Bandera isHuman', () => {
    test('debería preservar isHuman=true', () => {
      const player = { name: 'Player1', port: 3001, isHuman: true };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.isHuman).toBe(true);
    });

    test('debería preservar isHuman=false', () => {
      const player = { name: 'Player1', port: 3001, isHuman: false };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.isHuman).toBe(false);
    });

    test('debería usar false por defecto cuando isHuman es undefined', () => {
      const player = { name: 'Player1', port: 3001 };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.isHuman).toBe(false);
    });

    test('debería usar false por defecto cuando isHuman es null', () => {
      const player = { name: 'Player1', port: 3001, isHuman: null };
      const result = normalizePlayer(player, getHostForPort);

      expect(result.isHuman).toBe(false);
    });
  });

  describe('Jugadores basados en URL (bots Vercel)', () => {
    test('debería normalizar jugador con campo URL', () => {
      const player = {
        name: 'VercelBot1',
        url: 'https://ta-te-ti-bemg.vercel.app',
        isHuman: false,
      };

      const result = normalizePlayer(player, getHostForPort);

      expect(result).toEqual({
        name: 'VercelBot1',
        port: null,
        url: 'https://ta-te-ti-bemg.vercel.app',
        host: null,
        protocol: null,
        isHuman: false,
      });
    });

    test('debería priorizar URL sobre puerto cuando ambos están presentes', () => {
      const player = {
        name: 'MixedBot',
        port: 3001,
        url: 'https://vercel-bot.vercel.app',
        isHuman: false,
      };

      const result = normalizePlayer(player, getHostForPort);

      expect(result).toEqual({
        name: 'MixedBot',
        port: null,
        url: 'https://vercel-bot.vercel.app',
        host: null,
        protocol: null,
        isHuman: false,
      });
    });

    test('debería manejar URL con barra diagonal final', () => {
      const player = {
        name: 'VercelBot1',
        url: 'https://ta-te-ti-bemg.vercel.app/',
        isHuman: false,
      };

      const result = normalizePlayer(player, getHostForPort);

      expect(result.url).toBe('https://ta-te-ti-bemg.vercel.app/');
    });

    test('no debería llamar getHostForPort cuando URL está presente', () => {
      const player = {
        name: 'VercelBot1',
        url: 'https://ta-te-ti-bemg.vercel.app',
        isHuman: false,
      };

      normalizePlayer(player, getHostForPort);

      expect(getHostForPort).not.toHaveBeenCalled();
    });
  });

  describe('Normalización Completa', () => {
    test('debería normalizar objeto de jugador completo', () => {
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
        url: null,
        host: 'random-bot-1',
        protocol: 'http',
        isHuman: false,
      });
    });

    test('debería normalizar jugador humano', () => {
      const player = {
        name: 'Human Player',
        port: 3001,
        isHuman: true,
      };

      const result = normalizePlayer(player, getHostForPort);

      expect(result).toEqual({
        name: 'Human Player',
        port: 3001,
        url: null,
        host: 'localhost',
        protocol: 'http',
        isHuman: true,
      });
    });

    test('debería normalizar jugador bot Vercel', () => {
      const player = {
        name: '  VercelBot  ',
        url: 'https://ta-te-ti-bemg.vercel.app',
        isHuman: false,
      };

      const result = normalizePlayer(player, getHostForPort);

      expect(result).toEqual({
        name: 'VercelBot',
        port: null,
        url: 'https://ta-te-ti-bemg.vercel.app',
        host: null,
        protocol: null,
        isHuman: false,
      });
    });
  });
});
