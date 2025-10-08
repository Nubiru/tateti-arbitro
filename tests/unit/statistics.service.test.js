/**
 * Unit Tests for StatisticsService
 * Tests in-memory statistics tracking and aggregation
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// We'll create the service after writing tests (TDD approach)
describe('StatisticsService', () => {
  let StatisticsService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Import the service (will be created after tests)
    StatisticsService =
      require('../../src/services/statistics.service.js').default;
  });

  describe('recordMatch()', () => {
    test('should store match data correctly', () => {
      const matchData = {
        winner: { name: 'Bot1', type: 'algorithm' },
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        moves: 5,
        duration: 2000,
        boardSize: 3,
        gameMode: 'individual',
        timestamp: '2025-10-07T10:00:00.000Z',
      };

      StatisticsService.recordMatch(matchData);
      const stats = StatisticsService.getStats();

      expect(stats.totalGames).toBe(1);
      expect(stats.winsByType.algorithm).toBe(1);
      expect(stats.winsByType.random).toBe(0);
      expect(stats.averageMoves).toBe(5);
      expect(stats.averageDuration).toBe(2000);
    });

    test('should handle draw matches', () => {
      const matchData = {
        winner: null,
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        moves: 9,
        duration: 3000,
        boardSize: 3,
        gameMode: 'individual',
        timestamp: '2025-10-07T10:00:00.000Z',
      };

      StatisticsService.recordMatch(matchData);
      const stats = StatisticsService.getStats();

      expect(stats.totalGames).toBe(1);
      expect(stats.draws).toBe(1);
      expect(stats.winsByType.algorithm).toBe(0);
      expect(stats.winsByType.random).toBe(0);
    });

    test('should handle multiple matches correctly', () => {
      const match1 = {
        winner: { name: 'Bot1', type: 'algorithm' },
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        moves: 3,
        duration: 1000,
        boardSize: 3,
        gameMode: 'individual',
        timestamp: '2025-10-07T10:00:00.000Z',
      };

      const match2 = {
        winner: { name: 'Bot2', type: 'random' },
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        moves: 7,
        duration: 2500,
        boardSize: 3,
        gameMode: 'individual',
        timestamp: '2025-10-07T10:01:00.000Z',
      };

      StatisticsService.recordMatch(match1);
      StatisticsService.recordMatch(match2);
      const stats = StatisticsService.getStats();

      expect(stats.totalGames).toBe(2);
      expect(stats.winsByType.algorithm).toBe(1);
      expect(stats.winsByType.random).toBe(1);
      expect(stats.averageMoves).toBe(5); // (3 + 7) / 2
      expect(stats.averageDuration).toBe(1750); // (1000 + 2500) / 2
    });

    test('should handle missing winner gracefully', () => {
      const matchData = {
        winner: undefined,
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        moves: 4,
        duration: 1500,
        boardSize: 3,
        gameMode: 'individual',
        timestamp: '2025-10-07T10:00:00.000Z',
      };

      StatisticsService.recordMatch(matchData);
      const stats = StatisticsService.getStats();

      expect(stats.totalGames).toBe(1);
      expect(stats.draws).toBe(1);
    });
  });

  describe('getStats()', () => {
    test('should return empty stats when no matches recorded', () => {
      const stats = StatisticsService.getStats();

      expect(stats).toEqual({
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
      });
    });

    test('should calculate win rates correctly', () => {
      const match1 = {
        winner: { name: 'Bot1', type: 'algorithm' },
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        moves: 3,
        duration: 1000,
        boardSize: 3,
        gameMode: 'individual',
        timestamp: '2025-10-07T10:00:00.000Z',
      };

      const match2 = {
        winner: { name: 'Bot2', type: 'random' },
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        moves: 5,
        duration: 2000,
        boardSize: 3,
        gameMode: 'individual',
        timestamp: '2025-10-07T10:01:00.000Z',
      };

      const match3 = {
        winner: null,
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        moves: 9,
        duration: 3000,
        boardSize: 3,
        gameMode: 'individual',
        timestamp: '2025-10-07T10:02:00.000Z',
      };

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

    test('should track games by board size and mode', () => {
      const match1 = {
        winner: { name: 'Bot1', type: 'algorithm' },
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        moves: 3,
        duration: 1000,
        boardSize: 3,
        gameMode: 'individual',
        timestamp: '2025-10-07T10:00:00.000Z',
      };

      const match2 = {
        winner: { name: 'Bot2', type: 'random' },
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        moves: 5,
        duration: 2000,
        boardSize: 5,
        gameMode: 'tournament',
        timestamp: '2025-10-07T10:01:00.000Z',
      };

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
    test('should clear all statistics', () => {
      const matchData = {
        winner: { name: 'Bot1', type: 'algorithm' },
        players: [
          { name: 'Bot1', type: 'algorithm' },
          { name: 'Bot2', type: 'random' },
        ],
        moves: 5,
        duration: 2000,
        boardSize: 3,
        gameMode: 'individual',
        timestamp: '2025-10-07T10:00:00.000Z',
      };

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
    test('should handle malformed match data gracefully', () => {
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

    test('should handle empty match data', () => {
      expect(() => {
        StatisticsService.recordMatch({});
      }).not.toThrow();

      const stats = StatisticsService.getStats();
      expect(stats.totalGames).toBe(0);
    });
  });

  describe('Performance', () => {
    test('should handle large number of matches efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        const matchData = {
          winner: {
            name: `Bot${(i % 2) + 1}`,
            type: i % 2 === 0 ? 'algorithm' : 'random',
          },
          players: [
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' },
          ],
          moves: Math.floor(Math.random() * 9) + 1,
          duration: Math.floor(Math.random() * 5000) + 1000,
          boardSize: 3,
          gameMode: 'individual',
          timestamp: new Date().toISOString(),
        };
        StatisticsService.recordMatch(matchData);
      }

      const end = performance.now();
      const stats = StatisticsService.getStats();

      expect(stats.totalGames).toBe(1000);
      expect(end - start).toBeLessThan(100); // Should be very fast
    });
  });
});
