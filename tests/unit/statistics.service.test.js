/**
 * Pruebas Unitarias para StatisticsService
 * Pruebas de seguimiento y agregación de estadísticas en memoria
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import StatisticsService from '../../src/services/statistics.service.js';
import {
  createMockMatchData,
  createMockPlayer,
} from '../helpers/test-factories.js';
describe('StatisticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset statistics before each test
    StatisticsService.resetStats();
  });

  describe('recordMatch()', () => {
    test('debería almacenar datos de partida correctamente', () => {
      const matchData = createMockMatchData({
        winner: createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
        players: [
          createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
          createMockPlayer({ name: 'Bot2', type: 'random' }),
        ],
        moves: 5,
        duration: 2000,
      });

      StatisticsService.recordMatch(matchData);
      const stats = StatisticsService.getStats();

      expect(stats.totalGames).toBe(1);
      expect(stats.winsByType.algorithm).toBe(1);
      expect(stats.winsByType.random).toBe(0);
      expect(stats.averageMoves).toBe(5);
      expect(stats.averageDuration).toBe(2000);
    });

    test('debería manejar partidas empatadas', () => {
      const matchData = createMockMatchData({
        winner: null,
        players: [
          createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
          createMockPlayer({ name: 'Bot2', type: 'random' }),
        ],
        moves: 9,
        duration: 3000,
      });

      StatisticsService.recordMatch(matchData);
      const stats = StatisticsService.getStats();

      expect(stats.totalGames).toBe(1);
      expect(stats.draws).toBe(1);
      expect(stats.winsByType.algorithm).toBe(0);
      expect(stats.winsByType.random).toBe(0);
    });

    test('debería manejar múltiples partidas correctamente', () => {
      const match1 = createMockMatchData({
        winner: createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
        players: [
          createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
          createMockPlayer({ name: 'Bot2', type: 'random' }),
        ],
        moves: 3,
        duration: 1000,
      });

      const match2 = createMockMatchData({
        winner: createMockPlayer({ name: 'Bot2', type: 'random' }),
        players: [
          createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
          createMockPlayer({ name: 'Bot2', type: 'random' }),
        ],
        moves: 7,
        duration: 2500,
        timestamp: '2025-10-07T10:01:00.000Z',
      });

      StatisticsService.recordMatch(match1);
      StatisticsService.recordMatch(match2);
      const stats = StatisticsService.getStats();

      expect(stats.totalGames).toBe(2);
      expect(stats.winsByType.algorithm).toBe(1);
      expect(stats.winsByType.random).toBe(1);
      expect(stats.averageMoves).toBe(5); // (3 + 7) / 2
      expect(stats.averageDuration).toBe(1750); // (1000 + 2500) / 2
    });

    test('debería manejar ganador faltante con gracia', () => {
      const matchData = createMockMatchData({
        winner: undefined,
        players: [
          createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
          createMockPlayer({ name: 'Bot2', type: 'random' }),
        ],
        moves: 4,
        duration: 1500,
      });

      StatisticsService.recordMatch(matchData);
      const stats = StatisticsService.getStats();

      expect(stats.totalGames).toBe(1);
      expect(stats.draws).toBe(1);
    });
  });

  describe('getStats()', () => {
    test('debería retornar estadísticas vacías cuando no hay partidas registradas', () => {
      const stats = StatisticsService.getStats();

      expect(stats).toEqual({
        totalGames: 0,
        wins: {},
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
      });
    });

    test('debería calcular tasas de victoria correctamente', () => {
      const match1 = createMockMatchData({
        winner: createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
        players: [
          createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
          createMockPlayer({ name: 'Bot2', type: 'random' }),
        ],
        moves: 3,
        duration: 1000,
      });

      const match2 = createMockMatchData({
        winner: createMockPlayer({ name: 'Bot2', type: 'random' }),
        players: [
          createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
          createMockPlayer({ name: 'Bot2', type: 'random' }),
        ],
        moves: 5,
        duration: 2000,
        timestamp: '2025-10-07T10:01:00.000Z',
      });

      const match3 = createMockMatchData({
        winner: null,
        players: [
          createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
          createMockPlayer({ name: 'Bot2', type: 'random' }),
        ],
        moves: 9,
        duration: 3000,
        timestamp: '2025-10-07T10:02:00.000Z',
      });

      StatisticsService.recordMatch(match1);
      StatisticsService.recordMatch(match2);
      StatisticsService.recordMatch(match3);
      const stats = StatisticsService.getStats();

      expect(stats.totalGames).toBe(3);
      expect(stats.winsByType.algorithm).toBe(1);
      expect(stats.winsByType.random).toBe(1);
      expect(stats.draws).toBe(1);
      expect(stats.averageMoves).toBeCloseTo(5.67, 2); // (3 + 5 + 9) / 3
      expect(stats.averageDuration).toBe(2000); // (1000 + 2000 + 3000) / 3
    });

    test('debería rastrear juegos por tamaño de tablero y modo', () => {
      const match1 = createMockMatchData({
        winner: createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
        players: [
          createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
          createMockPlayer({ name: 'Bot2', type: 'random' }),
        ],
        moves: 3,
        duration: 1000,
        boardSize: 3,
        gameMode: 'individual',
      });

      const match2 = createMockMatchData({
        winner: createMockPlayer({ name: 'Bot2', type: 'random' }),
        players: [
          createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
          createMockPlayer({ name: 'Bot2', type: 'random' }),
        ],
        moves: 5,
        duration: 2000,
        boardSize: 5,
        gameMode: 'tournament',
        timestamp: '2025-10-07T10:01:00.000Z',
      });

      StatisticsService.recordMatch(match1);
      StatisticsService.recordMatch(match2);
      const stats = StatisticsService.getStats();

      expect(stats.gamesByBoardSize['3x3']).toBe(1);
      expect(stats.gamesByBoardSize['5x5']).toBe(1);
      expect(stats.gamesByMode.individual).toBe(1);
      expect(stats.gamesByMode.tournament).toBe(1);
    });
  });

  describe('resetStats()', () => {
    test('debería limpiar todas las estadísticas', () => {
      const matchData = createMockMatchData({
        winner: createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
        players: [
          createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
          createMockPlayer({ name: 'Bot2', type: 'random' }),
        ],
        moves: 5,
        duration: 2000,
      });

      StatisticsService.recordMatch(matchData);
      expect(StatisticsService.getStats().totalGames).toBe(1);

      StatisticsService.resetStats();
      const stats = StatisticsService.getStats();

      expect(stats.totalGames).toBe(0);
      expect(stats.winsByType.algorithm).toBe(0);
      expect(stats.winsByType.random).toBe(0);
      expect(stats.draws).toBe(0);
      expect(stats.averageMoves).toBe(0);
      expect(stats.averageDuration).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('debería manejar datos de partida malformados con gracia', () => {
      const malformedData = {
        winner: 'invalid',
        players: 'not an array',
        moves: 'not a number',
        duration: null,
      };

      expect(() => {
        StatisticsService.recordMatch(malformedData);
      }).not.toThrow();

      const stats = StatisticsService.getStats();
      expect(stats.totalGames).toBe(0);
    });

    test('debería manejar datos de partida vacíos', () => {
      expect(() => {
        StatisticsService.recordMatch({});
      }).not.toThrow();

      const stats = StatisticsService.getStats();
      expect(stats.totalGames).toBe(0);
    });
  });

  describe('Performance', () => {
    test('debería manejar gran número de partidas eficientemente', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        const matchData = createMockMatchData({
          winner: createMockPlayer({
            name: `Bot${(i % 2) + 1}`,
            type: i % 2 === 0 ? 'algorithm' : 'random',
          }),
          players: [
            createMockPlayer({ name: 'Bot1', type: 'algorithm' }),
            createMockPlayer({ name: 'Bot2', type: 'random' }),
          ],
          moves: Math.floor(Math.random() * 9) + 1,
          duration: Math.floor(Math.random() * 5000) + 1000,
          timestamp: new Date().toISOString(),
        });
        StatisticsService.recordMatch(matchData);
      }

      const end = performance.now();
      const stats = StatisticsService.getStats();

      expect(stats.totalGames).toBe(1000);
      expect(end - start).toBeLessThan(100); // Debería ser muy rápido
    });
  });
});
