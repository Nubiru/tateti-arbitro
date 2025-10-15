/**
 * Pruebas Unitarias para CelebrationService
 * Pruebas de lógica de celebración, temporizadores de cuenta regresiva y formateo de estadísticas
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import CelebrationService from '../../../src/services/CelebrationService';

describe('CelebrationService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('calculateGameStatistics', () => {
    test('debería calcular estadísticas para partida individual con datos reales del juego', () => {
      const matchResult = {
        winner: { name: 'Player1', symbol: 'X' },
        history: [
          { playerId: 'player1', position: 0 },
          { playerId: 'player2', position: 1 },
          { playerId: 'player1', position: 2 },
        ],
        gameTime: 45000,
        winningLine: [0, 1, 2],
        players: [
          { name: 'Player1', symbol: 'X' },
          { name: 'Player2', symbol: 'O' },
        ],
      };

      const stats = CelebrationService.calculateGameStatistics(
        matchResult,
        null
      );

      expect(stats.winner).toEqual({ name: 'Player1', symbol: 'X' });
      expect(stats.movesCount).toBe(3);
      expect(stats.gameTime).toBe(45000);
      expect(stats.player1Moves).toBe(2);
      expect(stats.player2Moves).toBe(1);
    });

    test('debería calcular estadísticas para torneo con datos reales del torneo', () => {
      const tournamentResult = {
        winner: { name: 'Player1' },
        totalRounds: 2,
        totalMatches: 3,
        averageTime: 30000,
      };

      const stats = CelebrationService.calculateGameStatistics(
        null,
        tournamentResult
      );

      expect(stats.winner).toEqual({ name: 'Player1' });
      expect(stats.totalRounds).toBe(2);
      expect(stats.totalMatches).toBe(3);
      expect(stats.averageTime).toBe(30000);
    });

    test('debería manejar partida sin historial', () => {
      const matchResult = {
        winner: { name: 'Player1' },
        players: [{ name: 'Player1' }, { name: 'Player2' }],
      };

      const stats = CelebrationService.calculateGameStatistics(
        matchResult,
        null
      );

      expect(stats.movesCount).toBe(0);
      expect(stats.player1Moves).toBe(0);
      expect(stats.player2Moves).toBe(0);
    });

    test('debería manejar entradas null/undefined retornando estadísticas vacías', () => {
      const stats = CelebrationService.calculateGameStatistics(null, null);

      expect(stats.winner).toBeNull();
      expect(stats.movesCount).toBe(0);
      expect(stats.gameTime).toBe('N/A'); // El servicio retorna string 'N/A', no 0
    });
  });

  describe('getGameMetadata', () => {
    test('debería extraer metadatos del resultado de la partida', () => {
      const result = {
        gameMode: 'individual',
        boardSize: '3x3',
        speed: 'fast',
        noTie: true,
        winningLine: [0, 1, 2],
      };

      const metadata = CelebrationService.getGameMetadata(result);

      expect(metadata.gameMode).toBe('individual');
      expect(metadata.boardSize).toBe('3x3');
      expect(metadata.speed).toBe('fast');
      expect(metadata.noTie).toBe(true);
      expect(metadata.winningLine).toEqual([0, 1, 2]);
    });

    test('debería proporcionar valores por defecto para propiedades faltantes', () => {
      const result = {};

      const metadata = CelebrationService.getGameMetadata(result);

      expect(metadata.gameMode).toBe('Individual'); // El servicio retorna capitalizado
      expect(metadata.boardSize).toBe('3x3');
      expect(metadata.speed).toBe('normal');
      expect(metadata.noTie).toBe(false);
      expect(metadata.winningLine).toBeNull();
    });

    test('debería manejar entrada null', () => {
      const metadata = CelebrationService.getGameMetadata(null);

      expect(metadata.gameMode).toBe('Individual'); // El servicio retorna capitalizado
      expect(metadata.boardSize).toBe('3x3');
      expect(metadata.speed).toBe('normal');
      expect(metadata.noTie).toBe(false);
      expect(metadata.winningLine).toBeNull();
    });
  });

  describe('createCountdownTimer', () => {
    test('debería llamar onTick cada segundo con tiempo restante', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      CelebrationService.createCountdownTimer(5, onTick, onComplete);

      // Avanzar 1 segundo
      jest.advanceTimersByTime(1000);
      expect(onTick).toHaveBeenCalledWith(4);

      // Avanzar 1 segundo más
      jest.advanceTimersByTime(1000);
      expect(onTick).toHaveBeenCalledWith(3);

      expect(onComplete).not.toHaveBeenCalled();
    });

    test('debería llamar onTick con 0 antes de llamar onComplete', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      CelebrationService.createCountdownTimer(2, onTick, onComplete);

      // Avanzar a 1 segundo restante
      jest.advanceTimersByTime(1000);
      expect(onTick).toHaveBeenCalledWith(1);
      expect(onComplete).not.toHaveBeenCalled();

      // Avanzar a 0 segundos restantes
      jest.advanceTimersByTime(1000);
      expect(onTick).toHaveBeenCalledWith(0); // ✅ CRÍTICO: Debe llamar onTick(0)
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('debería llamar onComplete cuando la cuenta regresiva llega a 0', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      CelebrationService.createCountdownTimer(3, onTick, onComplete);

      jest.advanceTimersByTime(3000);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('debería dejar de llamar onTick después de que la cuenta regresiva se complete', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      CelebrationService.createCountdownTimer(2, onTick, onComplete);

      jest.advanceTimersByTime(2000);
      expect(onTick).toHaveBeenCalledTimes(2); // Llamado en 1 y 0

      // Avanzar más tiempo - no debería llamar onTick de nuevo
      jest.advanceTimersByTime(5000);
      expect(onTick).toHaveBeenCalledTimes(2); // Aún solo 2 llamadas
    });

    test('debería manejar callback onTick null', () => {
      const onComplete = jest.fn();

      expect(() => {
        CelebrationService.createCountdownTimer(2, null, onComplete);
        jest.advanceTimersByTime(2000);
      }).not.toThrow();

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('debería manejar callback onComplete null', () => {
      const onTick = jest.fn();

      expect(() => {
        CelebrationService.createCountdownTimer(2, onTick, null);
        jest.advanceTimersByTime(2000);
      }).not.toThrow();

      expect(onTick).toHaveBeenCalledWith(0);
    });

    test('debería retornar función de limpieza que borra el intervalo', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      const cleanup = CelebrationService.createCountdownTimer(
        10,
        onTick,
        onComplete
      );

      // Avanzar 2 segundos
      jest.advanceTimersByTime(2000);
      expect(onTick).toHaveBeenCalledTimes(2);

      // Llamar limpieza
      cleanup();

      // Avanzar más tiempo - no debería llamar onTick más
      jest.advanceTimersByTime(10000);
      expect(onTick).toHaveBeenCalledTimes(2); // Aún solo 2 llamadas
      expect(onComplete).not.toHaveBeenCalled();
    });

    test('debería manejar duración de 1 segundo', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      CelebrationService.createCountdownTimer(1, onTick, onComplete);

      jest.advanceTimersByTime(1000);

      expect(onTick).toHaveBeenCalledWith(0);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test('debería manejar duración de 0 segundos', () => {
      const onTick = jest.fn();
      const onComplete = jest.fn();

      CelebrationService.createCountdownTimer(0, onTick, onComplete);

      jest.advanceTimersByTime(1000);

      expect(onTick).toHaveBeenCalledWith(-1);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEmptyStatistics', () => {
    test('debería retornar objeto de estadísticas vacío', () => {
      const stats = CelebrationService.getEmptyStatistics();

      expect(stats).toEqual({
        winner: null,
        movesCount: 0,
        gameTime: 'N/A',
        player1Moves: 0,
        player2Moves: 0,
        totalRounds: 1,
        totalMatches: 1,
        averageTime: 'N/A',
      });
    });

    test('debería retornar nuevo objeto cada vez', () => {
      const stats1 = CelebrationService.getEmptyStatistics();
      const stats2 = CelebrationService.getEmptyStatistics();

      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });
  });
});
