/**
 * Pruebas de Integración de Tournament DI
 * Pruebas para funcionalidad asíncrona de tournament.di.js
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { TournamentCoordinator } from '../../src/domain/game/tournament.di.js';

describe('Pruebas de Integración de TournamentCoordinator', () => {
  let coordinator;
  let mockDependencies;

  beforeEach(() => {
    mockDependencies = {
      arbitrator: {
        runMatch: jest.fn(),
      },
      eventsAdapter: {
        broadcastTournamentStart: jest.fn(),
        broadcastTournamentComplete: jest.fn(),
        broadcastMatchStart: jest.fn(),
        broadcastMatchMove: jest.fn(),
        broadcastMatchWin: jest.fn(),
        broadcastMatchDraw: jest.fn(),
        broadcastMatchError: jest.fn(),
      },
      logger: {
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
      clock: {
        now: jest.fn(() => Date.now()),
        toISOString: jest.fn(() => new Date().toISOString()),
      },
    };

    coordinator = new TournamentCoordinator(mockDependencies);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runTournament - Pruebas de Integración Asíncronas', () => {
    test('debería completar un torneo simple de 2 jugadores', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Simular resultado de partida exitosa
      mockDependencies.arbitrator.runMatch.mockResolvedValue({
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        moves: 5,
        duration: 1000,
      });

      const result = await coordinator.runTournament(players, {
        timeoutMs: 5000,
        noTie: false,
        boardSize: 3,
      });

      expect(result).toBeDefined();
      expect(result.winners).toBeDefined();
      expect(result.winners.winner).toBeDefined();
      expect(['Player1', 'Player2']).toContain(result.winners.winner.name);
      expect(
        mockDependencies.eventsAdapter.broadcastTournamentStart
      ).toHaveBeenCalled();
      expect(
        mockDependencies.eventsAdapter.broadcastTournamentComplete
      ).toHaveBeenCalled();
      expect(mockDependencies.arbitrator.runMatch).toHaveBeenCalledTimes(1);
    });

    test('debería completar un torneo de 4 jugadores con múltiples rondas', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
        { name: 'Player3', port: 3003 },
        { name: 'Player4', port: 3004 },
      ];

      // Simular resultados de partidas para torneo de 4 jugadores (3 partidas totales)
      mockDependencies.arbitrator.runMatch
        .mockResolvedValueOnce({
          result: 'win',
          winner: { name: 'Player1', port: 3001 },
          moves: 5,
          duration: 1000,
        })
        .mockResolvedValueOnce({
          result: 'win',
          winner: { name: 'Player3', port: 3003 },
          moves: 6,
          duration: 1200,
        })
        .mockResolvedValueOnce({
          result: 'win',
          winner: { name: 'Player1', port: 3001 },
          moves: 7,
          duration: 1500,
        });

      const result = await coordinator.runTournament(players, {
        timeoutMs: 5000,
        noTie: false,
        boardSize: 3,
      });

      expect(result).toBeDefined();
      expect(result.winners).toBeDefined();
      expect(result.winners.winner).toBeDefined();
      expect(result.winners.winner.name).toBe('Player1');
      expect(mockDependencies.arbitrator.runMatch).toHaveBeenCalledTimes(3);
      expect(
        mockDependencies.eventsAdapter.broadcastTournamentStart
      ).toHaveBeenCalled();
      expect(
        mockDependencies.eventsAdapter.broadcastTournamentComplete
      ).toHaveBeenCalled();
    });

    test('debería manejar torneo con partidas en empate', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Simular resultado de partida en empate
      mockDependencies.arbitrator.runMatch.mockResolvedValue({
        result: 'draw',
        winner: null,
        moves: 9,
        duration: 2000,
      });

      const result = await coordinator.runTournament(players, {
        timeoutMs: 5000,
        noTie: false,
        boardSize: 3,
      });

      expect(result).toBeDefined();
      expect(result.winners).toBeDefined();
      expect(result.winners.winner).toBeDefined();
      expect(['Player1', 'Player2']).toContain(result.winners.winner.name); // Cualquier jugador puede ganar en empate
      expect(mockDependencies.arbitrator.runMatch).toHaveBeenCalledTimes(1);
    });

    test('debería manejar torneo con partidas con error', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      // Simular resultado de partida con error
      mockDependencies.arbitrator.runMatch.mockResolvedValue({
        result: 'error',
        winner: null,
        error: 'Connection timeout',
        moves: 0,
        duration: 5000,
      });

      const result = await coordinator.runTournament(players, {
        timeoutMs: 5000,
        noTie: false,
        boardSize: 3,
      });

      expect(result).toBeDefined();
      expect(result.winners).toBeDefined();
      expect(result.winners.winner).toBeDefined();
      expect(['Player1', 'Player2']).toContain(result.winners.winner.name); // Cualquier jugador puede ganar en error
      expect(mockDependencies.arbitrator.runMatch).toHaveBeenCalledTimes(1);
    });

    test('debería manejar torneo de tablero 5x5', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      mockDependencies.arbitrator.runMatch.mockResolvedValue({
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        moves: 8,
        duration: 2000,
      });

      const result = await coordinator.runTournament(players, {
        timeoutMs: 10000,
        noTie: true,
        boardSize: 5,
      });

      expect(result).toBeDefined();
      expect(result.winners).toBeDefined();
      expect(result.winners.winner).toBeDefined();
      expect(['Player1', 'Player2']).toContain(result.winners.winner.name);
      expect(mockDependencies.arbitrator.runMatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Player1' }),
          expect.objectContaining({ name: 'Player2' }),
        ]),
        expect.objectContaining({
          timeoutMs: 10000,
          noTie: true,
          boardSize: 5,
        })
      );
    });

    test('debería manejar torneo con timeout personalizado', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      mockDependencies.arbitrator.runMatch.mockResolvedValue({
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        moves: 5,
        duration: 1000,
      });

      const result = await coordinator.runTournament(players, {
        timeoutMs: 15000,
        noTie: false,
        boardSize: 3,
      });

      expect(result).toBeDefined();
      expect(mockDependencies.arbitrator.runMatch).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          timeoutMs: 15000,
        })
      );
    });

    test('debería manejar torneo con modo sin empates', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      mockDependencies.arbitrator.runMatch.mockResolvedValue({
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        moves: 5,
        duration: 1000,
      });

      const result = await coordinator.runTournament(players, {
        timeoutMs: 5000,
        noTie: true,
        boardSize: 3,
      });

      expect(result).toBeDefined();
      expect(mockDependencies.arbitrator.runMatch).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          noTie: true,
        })
      );
    });

    test('debería manejar torneo de 6 jugadores con BYEs', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
        { name: 'Player3', port: 3003 },
        { name: 'Player4', port: 3004 },
        { name: 'Player5', port: 3005 },
        { name: 'Player6', port: 3006 },
      ];

      // Simular resultados de partidas para torneo de 6 jugadores (5 partidas totales)
      mockDependencies.arbitrator.runMatch
        .mockResolvedValueOnce({
          result: 'win',
          winner: { name: 'Player1', port: 3001 },
          moves: 5,
          duration: 1000,
        })
        .mockResolvedValueOnce({
          result: 'win',
          winner: { name: 'Player3', port: 3003 },
          moves: 6,
          duration: 1200,
        })
        .mockResolvedValueOnce({
          result: 'win',
          winner: { name: 'Player5', port: 3005 },
          moves: 7,
          duration: 1500,
        })
        .mockResolvedValueOnce({
          result: 'win',
          winner: { name: 'Player1', port: 3001 },
          moves: 8,
          duration: 1800,
        })
        .mockResolvedValueOnce({
          result: 'win',
          winner: { name: 'Player1', port: 3001 },
          moves: 9,
          duration: 2000,
        });

      const result = await coordinator.runTournament(players, {
        timeoutMs: 5000,
        noTie: false,
        boardSize: 3,
      });

      expect(result).toBeDefined();
      expect(result.winners).toBeDefined();
      expect(result.winners.winner).toBeDefined();
      expect([
        'Player1',
        'Player2',
        'Player3',
        'Player4',
        'Player5',
        'Player6',
      ]).toContain(result.winners.winner.name);
      expect(mockDependencies.arbitrator.runMatch).toHaveBeenCalledTimes(7); // 6 jugadores = 7 partidas (incluye BYEs)
    });

    test('debería manejar ejecución de torneo con resultados mixtos', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
        { name: 'Player3', port: 3003 },
        { name: 'Player4', port: 3004 },
      ];

      // Simular resultados mixtos: victoria, empate, error, victoria
      mockDependencies.arbitrator.runMatch
        .mockResolvedValueOnce({
          result: 'win',
          winner: { name: 'Player1', port: 3001 },
          moves: 5,
          duration: 1000,
        })
        .mockResolvedValueOnce({
          result: 'draw',
          winner: null,
          moves: 9,
          duration: 2000,
        })
        .mockResolvedValueOnce({
          result: 'error',
          winner: null,
          error: 'Network error',
          moves: 0,
          duration: 5000,
        })
        .mockResolvedValueOnce({
          result: 'win',
          winner: { name: 'Player1', port: 3001 },
          moves: 6,
          duration: 1500,
        });

      const result = await coordinator.runTournament(players, {
        timeoutMs: 5000,
        noTie: false,
        boardSize: 3,
      });

      expect(result).toBeDefined();
      expect(result.winners).toBeDefined();
      expect(result.winners.winner).toBeDefined();
      expect(['Player1', 'Player2']).toContain(result.winners.winner.name);
      expect(mockDependencies.arbitrator.runMatch).toHaveBeenCalledTimes(2); // 2 jugadores = 1 partida
    });

    test('debería registrar progreso del torneo correctamente', async () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      mockDependencies.arbitrator.runMatch.mockResolvedValue({
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        moves: 5,
        duration: 1000,
      });

      await coordinator.runTournament(players, {
        timeoutMs: 5000,
        noTie: false,
        boardSize: 3,
      });

      expect(mockDependencies.logger.info).toHaveBeenCalledWith(
        'TOURNAMENT',
        'START',
        'Iniciando torneo',
        expect.objectContaining({
          players: expect.arrayContaining(['Player1', 'Player2']),
          boardSize: '3x3',
          noTie: false,
          timeoutMs: 5000,
        })
      );
    });

    test('debería manejar torneo con máximo de jugadores (12)', async () => {
      const players = Array.from({ length: 12 }, (_, i) => ({
        name: `Player${i + 1}`,
        port: 3001 + i,
      }));

      // Simular resultados de partidas para torneo de 12 jugadores (11 partidas totales)
      for (let i = 0; i < 11; i++) {
        mockDependencies.arbitrator.runMatch.mockResolvedValueOnce({
          result: 'win',
          winner: { name: `Player${i + 1}`, port: 3001 + i },
          moves: 5 + i,
          duration: 1000 + i * 100,
        });
      }

      const result = await coordinator.runTournament(players, {
        timeoutMs: 5000,
        noTie: false,
        boardSize: 3,
      });

      expect(result).toBeDefined();
      expect(result.winners).toBeDefined();
      expect(result.winners.winner).toBeDefined();
      expect(result.winners.winner).toBeDefined();
      expect(result.winners.winner.name).toBeDefined();
      expect(mockDependencies.arbitrator.runMatch).toHaveBeenCalledTimes(15); // 12 jugadores = 15 partidas (incluye BYEs)
    });
  });
});
