/**
 * Pruebas Unitarias para ScreensaverService
 * Pruebas de generación de datos de juego simulados y lógica de ciclado para entretenimiento de pantalla inactiva
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import ScreensaverService from '../../../src/services/ScreensaverService';

describe('ScreensaverService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('getSimulatedGames', () => {
    test('debería retornar array de resultados de juegos simulados', () => {
      const games = ScreensaverService.getSimulatedGames();

      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBeGreaterThan(0);
    });

    test('debería retornar juegos con propiedades requeridas', () => {
      const games = ScreensaverService.getSimulatedGames();

      games.forEach(game => {
        expect(game).toHaveProperty('player1');
        expect(game).toHaveProperty('player2');
        expect(game).toHaveProperty('moves');
        expect(game).toHaveProperty('winner');
        expect(typeof game.player1).toBe('string');
        expect(typeof game.player2).toBe('string');
        expect(typeof game.moves).toBe('number');
        expect(typeof game.winner).toBe('string');
      });
    });

    test('debería retornar datos consistentes en múltiples llamadas', () => {
      const games1 = ScreensaverService.getSimulatedGames();
      const games2 = ScreensaverService.getSimulatedGames();

      expect(games1).toEqual(games2);
    });

    test('debería incluir juego Bot Alpha vs Bot Beta', () => {
      const games = ScreensaverService.getSimulatedGames();
      const botAlphaGame = games.find(
        game =>
          (game.player1 === 'Bot Alpha' && game.player2 === 'Bot Beta') ||
          (game.player1 === 'Bot Beta' && game.player2 === 'Bot Alpha')
      );

      expect(botAlphaGame).toBeDefined();
      expect(botAlphaGame.moves).toBeGreaterThan(0);
      expect(botAlphaGame.winner).toBeTruthy();
    });

    test('debería incluir juego AI Master vs Code Warrior', () => {
      const games = ScreensaverService.getSimulatedGames();
      const aiMasterGame = games.find(
        game =>
          game.player1 === 'AI Master' ||
          game.player2 === 'AI Master' ||
          game.player1 === 'Code Warrior' ||
          game.player2 === 'Code Warrior'
      );

      expect(aiMasterGame).toBeDefined();
      expect(aiMasterGame.winner).toBeDefined();
    });

    test('debería tener conteos de movimientos válidos (5-9 movimientos para juego 3x3)', () => {
      const games = ScreensaverService.getSimulatedGames();

      games.forEach(game => {
        expect(game.moves).toBeGreaterThanOrEqual(5);
        expect(game.moves).toBeLessThanOrEqual(9);
      });
    });

    test('debería tener ganador de uno de los dos jugadores', () => {
      const games = ScreensaverService.getSimulatedGames();

      games.forEach(game => {
        expect([game.player1, game.player2]).toContain(game.winner);
      });
    });

    test('debería retornar al menos 5 juegos simulados', () => {
      const games = ScreensaverService.getSimulatedGames();

      expect(games.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('createGameCycler', () => {
    test('debería llamar onGameChange con siguiente índice después del intervalo', () => {
      const games = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const onGameChange = jest.fn();

      ScreensaverService.createGameCycler(games, 1000, onGameChange);

      // Estado inicial - aún no se ha llamado
      expect(onGameChange).not.toHaveBeenCalled();

      // Después de 1 segundo - debería ciclar al índice 1
      jest.advanceTimersByTime(1000);
      expect(onGameChange).toHaveBeenCalledWith(1);

      // Después de 2 segundos - debería ciclar al índice 2
      jest.advanceTimersByTime(1000);
      expect(onGameChange).toHaveBeenCalledWith(2);

      // Después de 3 segundos - debería envolver al índice 0
      jest.advanceTimersByTime(1000);
      expect(onGameChange).toHaveBeenCalledWith(0);
    });

    test('debería ciclar a través de todos los juegos continuamente', () => {
      const games = [{ id: 1 }, { id: 2 }];
      const onGameChange = jest.fn();

      ScreensaverService.createGameCycler(games, 500, onGameChange);

      // Ciclar 5 veces
      jest.advanceTimersByTime(2500);

      expect(onGameChange).toHaveBeenCalledTimes(5);
      expect(onGameChange).toHaveBeenNthCalledWith(1, 1);
      expect(onGameChange).toHaveBeenNthCalledWith(2, 0);
      expect(onGameChange).toHaveBeenNthCalledWith(3, 1);
      expect(onGameChange).toHaveBeenNthCalledWith(4, 0);
      expect(onGameChange).toHaveBeenNthCalledWith(5, 1);
    });

    test('debería retornar función de limpieza que detiene el ciclado', () => {
      const games = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const onGameChange = jest.fn();

      const cleanup = ScreensaverService.createGameCycler(
        games,
        1000,
        onGameChange
      );

      // Avanzar 2 segundos
      jest.advanceTimersByTime(2000);
      expect(onGameChange).toHaveBeenCalledTimes(2);

      // Llamar limpieza
      cleanup();

      // Avanzar más tiempo - no debería llamar onGameChange más
      jest.advanceTimersByTime(5000);
      expect(onGameChange).toHaveBeenCalledTimes(2); // Aún solo 2 llamadas
    });

    test('debería manejar array de un solo juego', () => {
      const games = [{ id: 1 }];
      const onGameChange = jest.fn();

      ScreensaverService.createGameCycler(games, 1000, onGameChange);

      // Debería siempre retornar al índice 0
      jest.advanceTimersByTime(1000);
      expect(onGameChange).toHaveBeenCalledWith(0);

      jest.advanceTimersByTime(1000);
      expect(onGameChange).toHaveBeenCalledWith(0);
    });

    test('debería manejar intervalo personalizado', () => {
      const games = [{ id: 1 }, { id: 2 }];
      const onGameChange = jest.fn();

      ScreensaverService.createGameCycler(games, 3000, onGameChange);

      // No debería llamar antes del intervalo
      jest.advanceTimersByTime(2999);
      expect(onGameChange).not.toHaveBeenCalled();

      // Debería llamar después del intervalo
      jest.advanceTimersByTime(1);
      expect(onGameChange).toHaveBeenCalledTimes(1);
    });

    test('debería manejar array de juegos vacío de forma elegante', () => {
      const games = [];
      const onGameChange = jest.fn();

      expect(() => {
        const cleanup = ScreensaverService.createGameCycler(
          games,
          1000,
          onGameChange
        );
        jest.advanceTimersByTime(1000);
        cleanup();
      }).not.toThrow();

      expect(onGameChange).not.toHaveBeenCalled();
    });

    test('debería manejar callback null de forma elegante', () => {
      const games = [{ id: 1 }, { id: 2 }];

      expect(() => {
        const cleanup = ScreensaverService.createGameCycler(games, 1000, null);
        jest.advanceTimersByTime(1000);
        cleanup();
      }).not.toThrow();
    });
  });

  describe('getNextGame', () => {
    test('debería retornar siguiente índice en secuencia', () => {
      expect(ScreensaverService.getNextGame(0, 3)).toBe(1);
      expect(ScreensaverService.getNextGame(1, 3)).toBe(2);
    });

    test('debería envolver a 0 al final de la secuencia', () => {
      expect(ScreensaverService.getNextGame(2, 3)).toBe(0);
      expect(ScreensaverService.getNextGame(4, 5)).toBe(0);
    });

    test('debería manejar un solo juego', () => {
      expect(ScreensaverService.getNextGame(0, 1)).toBe(0);
    });

    test('debería manejar casos límite', () => {
      // Último índice se envuelve a 0
      expect(ScreensaverService.getNextGame(9, 10)).toBe(0);

      // Primer índice va a 1
      expect(ScreensaverService.getNextGame(0, 10)).toBe(1);
    });

    test('debería manejar cero juegos totales', () => {
      // Con 0 juegos, el servicio retorna 0 (no NaN)
      const result = ScreensaverService.getNextGame(0, 0);
      expect(result).toBe(0);
    });

    test('debería ser determinístico', () => {
      // Las mismas entradas siempre deberían producir la misma salida
      const result1 = ScreensaverService.getNextGame(5, 10);
      const result2 = ScreensaverService.getNextGame(5, 10);
      expect(result1).toBe(result2);
      expect(result1).toBe(6);
    });
  });

  describe('Integración: Ciclo Completo con Juegos Simulados Reales', () => {
    test('debería ciclar a través de juegos simulados usando lógica getNextGame', () => {
      const games = ScreensaverService.getSimulatedGames();
      const onGameChange = jest.fn();

      ScreensaverService.createGameCycler(games, 1000, onGameChange);

      // Ciclar a través de todos los juegos
      const totalGames = games.length;
      jest.advanceTimersByTime(totalGames * 1000);

      // Debería haber llamado onGameChange para cada juego
      expect(onGameChange).toHaveBeenCalledTimes(totalGames);

      // Última llamada debería envolver de vuelta al índice 0
      expect(onGameChange).toHaveBeenLastCalledWith(0);
    });

    test('debería mantener orden de ciclado correcto', () => {
      const games = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
      const onGameChange = jest.fn();

      ScreensaverService.createGameCycler(games, 100, onGameChange);

      jest.advanceTimersByTime(600);

      // Verificar orden exacto: 1, 2, 0, 1, 2, 0
      expect(onGameChange).toHaveBeenNthCalledWith(1, 1);
      expect(onGameChange).toHaveBeenNthCalledWith(2, 2);
      expect(onGameChange).toHaveBeenNthCalledWith(3, 0);
      expect(onGameChange).toHaveBeenNthCalledWith(4, 1);
      expect(onGameChange).toHaveBeenNthCalledWith(5, 2);
      expect(onGameChange).toHaveBeenNthCalledWith(6, 0);
    });
  });
});
