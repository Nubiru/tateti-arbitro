/**
 * Pruebas unitarias para Adaptador de Eventos
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import {
  EventsAdapter,
  createEventsAdapter,
} from '../../src/domain/game/events.adapter.js';

describe('Pruebas Unitarias del Adaptador de Eventos', () => {
  let mockEventBus;
  let mockLogger;
  let eventsAdapter;

  beforeEach(() => {
    mockEventBus = {
      broadcast: jest.fn(),
    };
    mockLogger = {
      debug: jest.fn(),
      error: jest.fn(),
    };
    eventsAdapter = new EventsAdapter({
      eventBus: mockEventBus,
      logger: mockLogger,
    });
    jest.clearAllMocks();
  });

  describe('EventsAdapter Class', () => {
    test('debería crear instancia con eventBus y logger', () => {
      expect(eventsAdapter).toBeInstanceOf(EventsAdapter);
      expect(eventsAdapter.eventBus).toBe(mockEventBus);
      expect(eventsAdapter.logger).toBe(mockLogger);
    });

    test('debería transmitir evento de inicio de partida', () => {
      const payload = {
        matchId: 'match-123',
        players: [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ],
        timestamp: '2025-10-03T10:00:00.000Z',
      };

      eventsAdapter.broadcastMatchStart(payload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'EVENTS',
        'BROADCAST',
        'MATCH_START',
        'Transmitiendo evento de inicio de partida',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:start',
        payload
      );
    });

    test('debería transmitir evento de movimiento de partida', () => {
      const payload = {
        matchId: 'match-123',
        player: { name: 'Player1', port: 3001 },
        move: 4,
        board: [0, 0, 0, 0, 1, 0, 0, 0, 0],
        timestamp: '2025-10-03T10:00:00.000Z',
      };

      eventsAdapter.broadcastMatchMove(payload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'EVENTS',
        'BROADCAST',
        'MATCH_MOVE',
        'Transmitiendo evento de movimiento de partida',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:move',
        payload
      );
    });

    test('debería transmitir evento de victoria de partida', () => {
      const payload = {
        matchId: 'match-123',
        winner: { name: 'Player1', port: 3001 },
        winningLine: [0, 1, 2],
        finalBoard: [1, 1, 1, 0, 0, 0, 0, 0, 0],
        timestamp: '2025-10-03T10:00:00.000Z',
      };

      eventsAdapter.broadcastMatchWin(payload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'EVENTS',
        'BROADCAST',
        'MATCH_WIN',
        'Transmitiendo evento de victoria de partida',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith('match:win', payload);
    });

    test('debería transmitir evento de empate de partida', () => {
      const payload = {
        matchId: 'match-123',
        finalBoard: [1, 2, 1, 2, 1, 2, 2, 1, 2],
        timestamp: '2025-10-03T10:00:00.000Z',
      };

      eventsAdapter.broadcastMatchDraw(payload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'EVENTS',
        'BROADCAST',
        'MATCH_DRAW',
        'Transmitiendo evento de empate de partida',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:draw',
        payload
      );
    });

    test('debería transmitir evento de error de partida', () => {
      const payload = {
        matchId: 'match-123',
        error: 'Player connection failed',
        timestamp: '2025-10-03T10:00:00.000Z',
      };

      eventsAdapter.broadcastMatchError(payload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'EVENTS',
        'BROADCAST',
        'MATCH_ERROR',
        'Transmitiendo evento de error de partida',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:error',
        payload
      );
    });

    test('debería transmitir evento de inicio de torneo', () => {
      const payload = {
        tournamentId: 'tournament-123',
        players: [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          { name: 'Player3', port: 3003 },
          { name: 'Player4', port: 3004 },
        ],
        totalMatches: 3,
        timestamp: '2025-10-03T10:00:00.000Z',
      };

      eventsAdapter.broadcastTournamentStart(payload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'EVENTS',
        'BROADCAST',
        'TOURNAMENT_START',
        'Transmitiendo evento de inicio de torneo',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'tournament:start',
        payload
      );
    });

    test('debería transmitir evento de finalización de torneo', () => {
      const payload = {
        tournamentId: 'tournament-123',
        winner: { name: 'Player1', port: 3001 },
        runnerUp: { name: 'Player2', port: 3002 },
        totalMatches: 3,
        completedMatches: 3,
        message: 'Tournament completed successfully',
        timestamp: '2025-10-03T10:00:00.000Z',
      };

      eventsAdapter.broadcastTournamentComplete(payload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'EVENTS',
        'BROADCAST',
        'TOURNAMENT_COMPLETE',
        'Transmitiendo evento de finalización de torneo',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'tournament:complete',
        payload
      );
    });

    test('debería manejar payload vacío', () => {
      const payload = {};

      eventsAdapter.broadcastMatchStart(payload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'EVENTS',
        'BROADCAST',
        'MATCH_START',
        'Transmitiendo evento de inicio de partida',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:start',
        payload
      );
    });

    test('debería manejar payload nulo', () => {
      const payload = null;

      eventsAdapter.broadcastMatchStart(payload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'EVENTS',
        'BROADCAST',
        'MATCH_START',
        'Transmitiendo evento de inicio de partida',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:start',
        payload
      );
    });

    test('debería manejar payload indefinido', () => {
      const payload = undefined;

      eventsAdapter.broadcastMatchStart(payload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'EVENTS',
        'BROADCAST',
        'MATCH_START',
        'Transmitiendo evento de inicio de partida',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:start',
        payload
      );
    });

    test('debería manejar objetos de payload complejos', () => {
      const payload = {
        matchId: 'match-123',
        players: [
          { name: 'Player1', port: 3001, host: 'localhost', protocol: 'http' },
          { name: 'Player2', port: 3002, host: 'localhost', protocol: 'http' },
        ],
        options: {
          timeoutMs: 5000,
          boardSize: '3x3',
          noTie: false,
        },
        metadata: {
          version: '1.0.0',
          environment: 'test',
        },
        timestamp: '2025-10-03T10:00:00.000Z',
      };

      eventsAdapter.broadcastMatchStart(payload);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'EVENTS',
        'BROADCAST',
        'MATCH_START',
        'Transmitiendo evento de inicio de partida',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:start',
        payload
      );
    });

    test('debería manejar todos los tipos de eventos con el mismo logger y eventBus', () => {
      const payload = { test: 'data' };

      eventsAdapter.broadcastMatchStart(payload);
      eventsAdapter.broadcastMatchMove(payload);
      eventsAdapter.broadcastMatchWin(payload);
      eventsAdapter.broadcastMatchDraw(payload);
      eventsAdapter.broadcastMatchError(payload);
      eventsAdapter.broadcastTournamentStart(payload);
      eventsAdapter.broadcastTournamentComplete(payload);

      expect(mockLogger.debug).toHaveBeenCalledTimes(7);
      expect(mockEventBus.broadcast).toHaveBeenCalledTimes(7);
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:start',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:move',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith('match:win', payload);
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:draw',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'match:error',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'tournament:start',
        payload
      );
      expect(mockEventBus.broadcast).toHaveBeenCalledWith(
        'tournament:complete',
        payload
      );
    });
  });

  describe('Función createEventsAdapter', () => {
    test('debería crear instancia de EventsAdapter', () => {
      const adapter = createEventsAdapter({
        eventBus: mockEventBus,
        logger: mockLogger,
      });
      expect(adapter).toBeInstanceOf(EventsAdapter);
      expect(adapter.eventBus).toBe(mockEventBus);
      expect(adapter.logger).toBe(mockLogger);
    });

    test('debería crear EventsAdapter con dependencias diferentes', () => {
      const differentEventBus = { broadcast: jest.fn() };
      const differentLogger = { debug: jest.fn() };

      const adapter = createEventsAdapter({
        eventBus: differentEventBus,
        logger: differentLogger,
      });

      expect(adapter).toBeInstanceOf(EventsAdapter);
      expect(adapter.eventBus).toBe(differentEventBus);
      expect(adapter.logger).toBe(differentLogger);
    });
  });
});
