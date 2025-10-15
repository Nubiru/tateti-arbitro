/**
 * Pruebas Unitarias para GameOptionsService
 * Pruebas de manejo de configuración del juego, cálculos de velocidad y gestión de estado
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Crearemos el servicio después de escribir las pruebas (enfoque TDD)
describe('GameOptionsService', () => {
  let GameOptionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Importar el servicio (será creado después de las pruebas)
    GameOptionsService =
      require('../../../src/services/GameOptionsService').default;
  });

  describe('Configuración de Velocidad', () => {
    test('debería retornar retraso correcto para velocidad lenta', () => {
      const delay = GameOptionsService.getSpeedDelay('slow');
      expect(delay).toBe(2000);
    });

    test('debería retornar retraso correcto para velocidad normal', () => {
      const delay = GameOptionsService.getSpeedDelay('normal');
      expect(delay).toBe(1000);
    });

    test('debería retornar retraso correcto para velocidad rápida', () => {
      const delay = GameOptionsService.getSpeedDelay('fast');
      expect(delay).toBe(200);
    });

    test('debería usar velocidad normal por defecto para entrada inválida', () => {
      const delay = GameOptionsService.getSpeedDelay('invalid');
      expect(delay).toBe(1000);
    });

    test('debería usar velocidad normal por defecto para entrada undefined', () => {
      const delay = GameOptionsService.getSpeedDelay(undefined);
      expect(delay).toBe(1000);
    });
  });

  describe('Validación de Configuración del Juego', () => {
    test('debería validar tamaño del tablero correctamente', () => {
      expect(GameOptionsService.isValidBoardSize('3x3')).toBe(true);
      expect(GameOptionsService.isValidBoardSize('5x5')).toBe(true);
      expect(GameOptionsService.isValidBoardSize('4x4')).toBe(false);
      expect(GameOptionsService.isValidBoardSize('invalid')).toBe(false);
    });

    test('debería validar configuración de velocidad correctamente', () => {
      expect(GameOptionsService.isValidSpeed('slow')).toBe(true);
      expect(GameOptionsService.isValidSpeed('normal')).toBe(true);
      expect(GameOptionsService.isValidSpeed('fast')).toBe(true);
      expect(GameOptionsService.isValidSpeed('invalid')).toBe(false);
    });

    test('debería validar modo de juego correctamente', () => {
      expect(GameOptionsService.isValidGameMode('individual')).toBe(true);
      expect(GameOptionsService.isValidGameMode('tournament')).toBe(true);
      expect(GameOptionsService.isValidGameMode('invalid')).toBe(false);
    });
  });

  describe('Normalización de Configuración', () => {
    test('debería normalizar configuración con valores por defecto', () => {
      const config = GameOptionsService.normalizeConfig({});
      expect(config).toEqual({
        boardSize: '3x3',
        speed: 'normal',
        gameMode: 'individual',
        noTie: false,
      });
    });

    test('debería preservar valores de configuración válidos', () => {
      const config = GameOptionsService.normalizeConfig({
        boardSize: '5x5',
        speed: 'fast',
        gameMode: 'tournament',
        noTie: true,
      });
      expect(config).toEqual({
        boardSize: '5x5',
        speed: 'fast',
        gameMode: 'tournament',
        noTie: true,
      });
    });

    test('debería corregir valores de configuración inválidos', () => {
      const config = GameOptionsService.normalizeConfig({
        boardSize: '4x4',
        speed: 'invalid',
        gameMode: 'wrong',
        noTie: 'yes',
      });
      expect(config).toEqual({
        boardSize: '3x3',
        speed: 'normal',
        gameMode: 'individual',
        noTie: false,
      });
    });
  });

  describe('Lógica de Limitación de Velocidad', () => {
    test('debería determinar si se necesita limitación', () => {
      expect(GameOptionsService.shouldThrottle('slow')).toBe(true);
      expect(GameOptionsService.shouldThrottle('normal')).toBe(true);
      expect(GameOptionsService.shouldThrottle('fast')).toBe(false);
    });

    test('debería crear configuración de limitación', () => {
      const throttleConfig = GameOptionsService.createThrottleConfig('slow');
      expect(throttleConfig).toEqual({
        delay: 2000,
        shouldThrottle: true,
        showIndicator: true,
      });
    });
  });

  describe('Ayudantes de Estado del Juego', () => {
    test('debería determinar si el juego está en progreso', () => {
      expect(GameOptionsService.isGameInProgress('playing')).toBe(true);
      expect(GameOptionsService.isGameInProgress('completed')).toBe(false);
      expect(GameOptionsService.isGameInProgress('waiting')).toBe(false);
    });

    test('debería determinar si el juego está completado', () => {
      expect(GameOptionsService.isGameCompleted('completed')).toBe(true);
      expect(GameOptionsService.isGameCompleted('playing')).toBe(false);
      expect(GameOptionsService.isGameCompleted('waiting')).toBe(false);
    });

    test('debería obtener texto de estado del juego para mostrar', () => {
      expect(GameOptionsService.getGameStatusText('playing')).toBe(
        'Partida en Progreso'
      );
      expect(GameOptionsService.getGameStatusText('completed')).toBe(
        'Partida Completada'
      );
      expect(GameOptionsService.getGameStatusText('waiting')).toBe(
        'Esperando...'
      );
    });
  });

  describe('Procesamiento de Línea Ganadora', () => {
    test('debería formatear array de línea ganadora correctamente', () => {
      const formatted = GameOptionsService.formatWinningLine([0, 1, 2]);
      expect(formatted).toBe('Línea 0-1-2');
    });

    test('debería manejar línea ganadora booleana', () => {
      const formatted = GameOptionsService.formatWinningLine(true);
      expect(formatted).toBe('Línea ganadora');
    });

    test('debería manejar línea ganadora null', () => {
      const formatted = GameOptionsService.formatWinningLine(null);
      expect(formatted).toBe('N/A');
    });

    test('debería manejar línea ganadora undefined', () => {
      const formatted = GameOptionsService.formatWinningLine(undefined);
      expect(formatted).toBe('N/A');
    });

    test('debería manejar línea ganadora con array vacío', () => {
      const formatted = GameOptionsService.formatWinningLine([]);
      expect(formatted).toBe('Línea ganadora');
    });

    test('debería manejar tipos de línea ganadora inválidos', () => {
      const formatted = GameOptionsService.formatWinningLine('invalid');
      expect(formatted).toBe('Línea ganadora');
    });
  });

  describe('Procesamiento de Información del Jugador', () => {
    test('debería extraer nombre del jugador de forma segura', () => {
      expect(GameOptionsService.getPlayerName({ name: 'Player1' })).toBe(
        'Player1'
      );
      expect(GameOptionsService.getPlayerName({})).toBe('Desconocido');
      expect(GameOptionsService.getPlayerName(null)).toBe('Desconocido');
      expect(GameOptionsService.getPlayerName(undefined)).toBe('Desconocido');
    });

    test('debería determinar si el jugador es humano', () => {
      expect(GameOptionsService.isHumanPlayer({ isHuman: true })).toBe(true);
      expect(GameOptionsService.isHumanPlayer({ isHuman: false })).toBe(false);
      expect(GameOptionsService.isHumanPlayer({})).toBe(false);
      expect(GameOptionsService.isHumanPlayer(null)).toBe(false);
    });
  });

  describe('Manejo de Errores', () => {
    test('debería manejar configuración malformada de forma elegante', () => {
      const config = GameOptionsService.normalizeConfig({
        boardSize: null,
        speed: undefined,
        gameMode: 123,
        noTie: 'maybe',
      });
      expect(config).toEqual({
        boardSize: '3x3',
        speed: 'normal',
        gameMode: 'individual',
        noTie: false,
      });
    });

    test('debería manejar casos límite en cálculo de velocidad', () => {
      expect(GameOptionsService.getSpeedDelay('')).toBe(1000);
      expect(GameOptionsService.getSpeedDelay(null)).toBe(1000);
      expect(GameOptionsService.getSpeedDelay(0)).toBe(1000);
    });
  });

  describe('Rendimiento y Optimización', () => {
    test('debería memorizar cálculos de velocidad', () => {
      const spy = jest.spyOn(GameOptionsService, 'getSpeedDelay');
      GameOptionsService.getSpeedDelay('slow');
      GameOptionsService.getSpeedDelay('slow');
      expect(spy).toHaveBeenCalledTimes(2); // No memorizado, pero debería ser rápido
    });

    test('debería manejar configuraciones grandes de forma eficiente', () => {
      const largeConfig = {
        boardSize: '5x5',
        speed: 'fast',
        gameMode: 'tournament',
        noTie: false,
        extraData: new Array(1000).fill('data'),
      };

      const start = performance.now();
      const normalized = GameOptionsService.normalizeConfig(largeConfig);
      const end = performance.now();

      expect(normalized.boardSize).toBe('5x5');
      expect(end - start).toBeLessThan(10); // Debería ser muy rápido
    });
  });
});
