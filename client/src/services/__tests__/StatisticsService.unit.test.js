/**
 * Pruebas Unitarias para StatisticsService (Frontend)
 * Pruebas de agregación y formateo de estadísticas para visualización
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

// Crearemos el servicio después de escribir las pruebas (enfoque TDD)
describe('StatisticsService (Frontend)', () => {
  let StatisticsService;

  beforeEach(() => {
    // Importar el servicio (se creará después de las pruebas)
    StatisticsService = require('../StatisticsService.js').default;
  });

  describe('aggregateMatchStats()', () => {
    test('debería procesar resultados de partida correctamente', () => {
      const matchResult = {
        winner: { name: 'Bot1', type: 'algorithm' },
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        history: [
          { player: { name: 'Bot1', type: 'algorithm' }, move: 0, turn: 1 },
          { player: { name: 'Bot2', type: 'random' }, move: 1, turn: 2 },
          { player: { name: 'Bot1', type: 'algorithm' }, move: 2, turn: 3 },
        ],
        boardSize: 3,
        gameMode: 'individual',
        startTime: '2025-10-07T10:00:00.000Z',
        endTime: '2025-10-07T10:00:02.000Z',
      };

      const stats = StatisticsService.aggregateMatchStats(matchResult);

      expect(stats).toEqual({
        winner: { name: 'Bot1', type: 'algorithm' },
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        moves: 3,
        duration: 2000,
        boardSize: 3,
        gameMode: 'individual',
        timestamp: '2025-10-07T10:00:00.000Z',
      });
    });

    test('debería manejar partidas en empate', () => {
      const matchResult = {
        winner: null,
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        history: Array(9)
          .fill()
          .map((_, i) => ({
            player: {
              name: `Bot${(i % 2) + 1}`,
              type: i % 2 === 0 ? 'algorithm' : 'random',
            },
            move: i,
            turn: i + 1,
          })),
        boardSize: 3,
        gameMode: 'individual',
        startTime: '2025-10-07T10:00:00.000Z',
        endTime: '2025-10-07T10:00:05.000Z',
      };

      const stats = StatisticsService.aggregateMatchStats(matchResult);

      expect(stats.winner).toBeNull();
      expect(stats.moves).toBe(9);
      expect(stats.duration).toBe(5000);
    });

    test('debería calcular duración correctamente', () => {
      const matchResult = {
        winner: { name: 'Bot1', type: 'algorithm' },
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        history: [
          { player: { name: 'Bot1', type: 'algorithm' }, move: 0, turn: 1 },
        ],
        boardSize: 3,
        gameMode: 'individual',
        startTime: '2025-10-07T10:00:00.000Z',
        endTime: '2025-10-07T10:00:01.500Z',
      };

      const stats = StatisticsService.aggregateMatchStats(matchResult);

      expect(stats.duration).toBe(1500);
    });

    test('debería manejar timestamps faltantes de manera elegante', () => {
      const matchResult = {
        winner: { name: 'Bot1', type: 'algorithm' },
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        history: [
          { player: { name: 'Bot1', type: 'algorithm' }, move: 0, turn: 1 },
        ],
        boardSize: 3,
        gameMode: 'individual',
        // Sin timestamps
      };

      const stats = StatisticsService.aggregateMatchStats(matchResult);

      expect(stats.duration).toBe(0);
      expect(stats.timestamp).toBeDefined();
    });
  });

  describe('formatStats()', () => {
    test('debería formatear estadísticas para visualización', () => {
      const rawStats = {
        totalGames: 10,
        winsByType: {
          algorithm: 6,
          random: 3,
          human: 1,
        },
        draws: 0,
        averageMoves: 5.5,
        averageDuration: 2500,
        totalDuration: 25000,
        gamesByBoardSize: {
          '3x3': 8,
          '5x5': 2,
        },
        gamesByMode: {
          individual: 7,
          tournament: 3,
        },
      };

      const formattedStats = StatisticsService.formatStats(rawStats);

      expect(formattedStats).toEqual({
        totalGames: 10,
        winsByType: {
          algorithm: 6,
          random: 3,
          human: 1,
        },
        draws: 0,
        averageMoves: '5.5',
        averageDuration: '2.5s',
        totalDuration: '25.0s',
        winRates: {
          algorithm: '60.0%',
          random: '30.0%',
          human: '10.0%',
        },
        drawRate: '0.0%',
        gamesByBoardSize: {
          '3x3': 8,
          '5x5': 2,
        },
        gamesByMode: {
          individual: 7,
          tournament: 3,
        },
      });
    });

    test('should handle zero games gracefully', () => {
      const rawStats = {
        totalGames: 0,
        winsByType: {
          algorithm: 0,
          random: 0,
          human: 0,
        },
        draws: 0,
        averageMoves: 0,
        averageDuration: 0,
        totalDuration: 0,
        gamesByBoardSize: {
          '3x3': 0,
          '5x5': 0,
        },
        gamesByMode: {
          individual: 0,
          tournament: 0,
        },
      };

      const formattedStats = StatisticsService.formatStats(rawStats);

      expect(formattedStats.winRates.algorithm).toBe('0.0%');
      expect(formattedStats.drawRate).toBe('0.0%');
      expect(formattedStats.averageMoves).toBe('0.0');
      expect(formattedStats.averageDuration).toBe('0ms');
    });

    test('should format durations correctly', () => {
      const rawStats = {
        totalGames: 1,
        winsByType: { algorithm: 1, random: 0, human: 0 },
        draws: 0,
        averageMoves: 3,
        averageDuration: 500,
        totalDuration: 500,
        gamesByBoardSize: { '3x3': 1, '5x5': 0 },
        gamesByMode: { individual: 1, tournament: 0 },
      };

      const formattedStats = StatisticsService.formatStats(rawStats);

      expect(formattedStats.averageDuration).toBe('500ms');
      expect(formattedStats.totalDuration).toBe('500ms');
    });

    test('should format longer durations correctly', () => {
      const rawStats = {
        totalGames: 1,
        winsByType: { algorithm: 1, random: 0, human: 0 },
        draws: 0,
        averageMoves: 3,
        averageDuration: 65000,
        totalDuration: 65000,
        gamesByBoardSize: { '3x3': 1, '5x5': 0 },
        gamesByMode: { individual: 1, tournament: 0 },
      };

      const formattedStats = StatisticsService.formatStats(rawStats);

      expect(formattedStats.averageDuration).toBe('1m 5s');
      expect(formattedStats.totalDuration).toBe('1m 5s');
    });
  });

  describe('calculateWinRates()', () => {
    test('should calculate win rates correctly', () => {
      const rawStats = {
        totalGames: 20,
        winsByType: {
          algorithm: 12,
          random: 6,
          human: 2,
        },
        draws: 0,
      };

      const winRates = StatisticsService.calculateWinRates(rawStats);

      expect(winRates).toEqual({
        algorithm: '60.0%',
        random: '30.0%',
        human: '10.0%',
      });
    });

    test('should handle draws in win rate calculation', () => {
      const rawStats = {
        totalGames: 10,
        winsByType: {
          algorithm: 4,
          random: 3,
          human: 1,
        },
        draws: 2,
      };

      const winRates = StatisticsService.calculateWinRates(rawStats);

      expect(winRates).toEqual({
        algorithm: '40.0%',
        random: '30.0%',
        human: '10.0%',
      });
    });

    test('should handle zero games', () => {
      const rawStats = {
        totalGames: 0,
        winsByType: {
          algorithm: 0,
          random: 0,
          human: 0,
        },
        draws: 0,
      };

      const winRates = StatisticsService.calculateWinRates(rawStats);

      expect(winRates).toEqual({
        algorithm: '0.0%',
        random: '0.0%',
        human: '0.0%',
      });
    });
  });

  describe('formatDuration()', () => {
    test('should format milliseconds correctly', () => {
      expect(StatisticsService.formatDuration(500)).toBe('500ms');
      expect(StatisticsService.formatDuration(999)).toBe('999ms');
    });

    test('should format seconds correctly', () => {
      expect(StatisticsService.formatDuration(1000)).toBe('1.0s');
      expect(StatisticsService.formatDuration(2500)).toBe('2.5s');
      expect(StatisticsService.formatDuration(59999)).toBe('60.0s');
    });

    test('should format minutes and seconds correctly', () => {
      expect(StatisticsService.formatDuration(60000)).toBe('1m 0s');
      expect(StatisticsService.formatDuration(65000)).toBe('1m 5s');
      expect(StatisticsService.formatDuration(125000)).toBe('2m 5s');
    });

    test('should handle zero duration', () => {
      expect(StatisticsService.formatDuration(0)).toBe('0ms');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed match results gracefully', () => {
      const malformedResult = {
        winner: 'invalid',
        players: 'not an array',
        history: null,
      };

      expect(() => {
        StatisticsService.aggregateMatchStats(malformedResult);
      }).not.toThrow();

      const stats = StatisticsService.aggregateMatchStats(malformedResult);
      expect(stats.moves).toBe(0);
      expect(stats.duration).toBe(0);
    });

    test('should handle empty match results', () => {
      expect(() => {
        StatisticsService.aggregateMatchStats({});
      }).not.toThrow();

      const stats = StatisticsService.aggregateMatchStats({});
      expect(stats.moves).toBe(0);
      expect(stats.duration).toBe(0);
    });

    test('should handle malformed raw stats gracefully', () => {
      const malformedStats = {
        totalGames: 'not a number',
        winsByType: 'not an object',
        averageMoves: null,
      };

      expect(() => {
        StatisticsService.formatStats(malformedStats);
      }).not.toThrow();

      const formatted = StatisticsService.formatStats(malformedStats);
      expect(formatted.totalGames).toBe(0);
      expect(formatted.averageMoves).toBe('0.0');
    });
  });
});
