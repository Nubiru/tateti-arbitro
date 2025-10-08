/**
 * Pruebas Unitarias de ArbitratorCoordinator
 * Pruebas para el coordinador arbitrator.coordinator.js
 * @lastModified 2025-10-06
 * @version 1.0.0
 */

import { ArbitratorCoordinator } from '../../src/domain/game/arbitrator.coordinator.js';

describe('Pruebas Unitarias de ArbitratorCoordinator', () => {
  let coordinator;
  let mockDependencies;

  beforeEach(() => {
    mockDependencies = {
      httpAdapter: {
        requestMove: jest.fn(),
      },
      eventsAdapter: {
        broadcastMatchStart: jest.fn(),
        broadcastMatchMove: jest.fn(),
        broadcastMatchWin: jest.fn(),
        broadcastMatchDraw: jest.fn(),
        broadcastMatchError: jest.fn(),
      },
      clock: {
        now: () => new Date('2025-10-06T15:30:00.000Z'),
      },
    };

    coordinator = new ArbitratorCoordinator(mockDependencies);
  });

  describe('Constructor', () => {
    test('debería crear instancia con dependencias inyectadas', () => {
      expect(coordinator.httpAdapter).toBe(mockDependencies.httpAdapter);
      expect(coordinator.eventsAdapter).toBe(mockDependencies.eventsAdapter);
      expect(coordinator.clock).toBe(mockDependencies.clock);
    });

    test('debería usar Date como clock por defecto', () => {
      const coordinatorWithoutClock = new ArbitratorCoordinator({
        httpAdapter: mockDependencies.httpAdapter,
        eventsAdapter: mockDependencies.eventsAdapter,
      });
      expect(coordinatorWithoutClock.clock).toBe(Date);
    });
  });

  describe('runMatch', () => {
    const mockPlayers = [
      { name: 'Player1', port: 3001, host: 'localhost', protocol: 'http' },
      { name: 'Player2', port: 3002, host: 'localhost', protocol: 'http' },
    ];

    test('debería ejecutar partida exitosa con ganador', async () => {
      // Mock HTTP adapter responses
      mockDependencies.httpAdapter.requestMove
        .mockResolvedValueOnce({ position: 0 }) // Player1 move
        .mockResolvedValueOnce({ position: 1 }) // Player2 move
        .mockResolvedValueOnce({ position: 3 }) // Player1 move
        .mockResolvedValueOnce({ position: 4 }) // Player2 move
        .mockResolvedValueOnce({ position: 6 }); // Player1 move (wins)

      const result = await coordinator.runMatch(mockPlayers, {
        boardSize: 3,
        timeoutMs: 1000,
        noTie: false,
      });

      expect(result.winner).toBe(mockPlayers[0]);
      expect(result.status).toBe('win');
      expect(result.board).toEqual(['X', 'O', 0, 'X', 'O', 0, 'X', 0, 0]);
      expect(
        mockDependencies.eventsAdapter.broadcastMatchStart
      ).toHaveBeenCalled();
      expect(
        mockDependencies.eventsAdapter.broadcastMatchWin
      ).toHaveBeenCalled();
    });

    test('debería ejecutar partida con empate', async () => {
      // Mock moves that result in a draw
      mockDependencies.httpAdapter.requestMove
        .mockResolvedValueOnce({ position: 0 }) // Player1
        .mockResolvedValueOnce({ position: 1 }) // Player2
        .mockResolvedValueOnce({ position: 2 }) // Player1
        .mockResolvedValueOnce({ position: 3 }) // Player2
        .mockResolvedValueOnce({ position: 4 }) // Player1
        .mockResolvedValueOnce({ position: 5 }) // Player2
        .mockResolvedValueOnce({ position: 6 }) // Player1
        .mockResolvedValueOnce({ position: 7 }) // Player2
        .mockResolvedValueOnce({ position: 8 }); // Player1

      const result = await coordinator.runMatch(mockPlayers, {
        boardSize: 3,
        timeoutMs: 1000,
        noTie: false,
      });

      expect(result.winner).toBe(null);
      expect(result.status).toBe('draw');
      expect(
        mockDependencies.eventsAdapter.broadcastMatchDraw
      ).toHaveBeenCalled();
    });

    test('debería manejar error de jugador', async () => {
      mockDependencies.httpAdapter.requestMove.mockRejectedValueOnce(
        new Error('Player timeout')
      );

      const result = await coordinator.runMatch(mockPlayers, {
        boardSize: 3,
        timeoutMs: 1000,
        noTie: false,
      });

      expect(result.winner).toBe(null);
      expect(result.status).toBe('error');
      expect(result.error).toContain('Player timeout');
      expect(
        mockDependencies.eventsAdapter.broadcastMatchError
      ).toHaveBeenCalled();
    });

    test('debería validar jugadores correctamente', async () => {
      const invalidPlayers = [{ name: 'Player1', port: 3001 }]; // Solo un jugador

      await expect(coordinator.runMatch(invalidPlayers)).rejects.toThrow(
        'Se necesitan exactamente 2 jugadores para la partida'
      );
    });

    test('debería usar opciones por defecto', async () => {
      mockDependencies.httpAdapter.requestMove
        .mockResolvedValueOnce({ position: 0 })
        .mockResolvedValueOnce({ position: 1 })
        .mockResolvedValueOnce({ position: 3 })
        .mockResolvedValueOnce({ position: 4 })
        .mockResolvedValueOnce({ position: 6 });

      const result = await coordinator.runMatch(mockPlayers);

      expect(result.board).toHaveLength(9); // 3x3 por defecto
      expect(result.winner).toBe(mockPlayers[0]);
    });

    test('debería manejar tablero 5x5', async () => {
      mockDependencies.httpAdapter.requestMove
        .mockResolvedValueOnce({ position: 0 })
        .mockResolvedValueOnce({ position: 1 })
        .mockResolvedValueOnce({ position: 5 })
        .mockResolvedValueOnce({ position: 6 })
        .mockResolvedValueOnce({ position: 10 })
        .mockResolvedValueOnce({ position: 11 })
        .mockResolvedValueOnce({ position: 15 })
        .mockResolvedValueOnce({ position: 16 })
        .mockResolvedValueOnce({ position: 20 });

      const result = await coordinator.runMatch(mockPlayers, {
        boardSize: '5x5',
        timeoutMs: 1000,
      });

      expect(result.board).toHaveLength(25); // 5x5
    });
  });
});
