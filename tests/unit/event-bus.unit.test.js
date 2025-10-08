/**
 * Pruebas unitarias para EventBus
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import eventBus from '../../src/app/event-bus.js';

describe('Pruebas Unitarias de EventBus', () => {
  let mockResponse;

  beforeEach(() => {
    // Reiniciar la instancia singleton
    eventBus.connections.clear();
    eventBus.eventCounts.clear();
    eventBus.totalEvents = 0;
    eventBus.startTime = Date.now();

    // Simular objeto de respuesta Express
    mockResponse = {
      writeHead: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      destroyed: false,
      _sseTimeout: null,
    };
  });

  afterEach(() => {
    // CRITICAL: Clean up all timeouts to prevent hanging tests
    eventBus.connections.forEach(conn => {
      if (conn._sseTimeout) {
        clearTimeout(conn._sseTimeout);
        conn._sseTimeout = null;
      }
    });
    // Clear connections without calling end() on mocks
    eventBus.connections.clear();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('debería inicializar con estado vacío', () => {
      expect(eventBus.connections).toBeInstanceOf(Set);
      expect(eventBus.connections.size).toBe(0);
      expect(eventBus.eventCounts).toBeInstanceOf(Map);
      expect(eventBus.eventCounts.size).toBe(0);
      expect(eventBus.totalEvents).toBe(0);
      expect(typeof eventBus.startTime).toBe('number');
    });
  });

  describe('addConnection', () => {
    test('debería agregar conexión y establecer encabezados SSE', () => {
      eventBus.addConnection(mockResponse);

      expect(eventBus.connections.has(mockResponse)).toBe(true);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/event-stream'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-cache'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Connection',
        'keep-alive'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Origin',
        '*'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'Cache-Control'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    test('debería enviar evento de conexión inicial', () => {
      eventBus.addConnection(mockResponse);

      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('event: connection')
      );
      expect(mockResponse.write).toHaveBeenCalledWith(
        expect.stringContaining('Conexión SSE establecida')
      );
    });

    test('debería registrar manejador de cierre', () => {
      eventBus.addConnection(mockResponse);

      expect(mockResponse.on).toHaveBeenCalledWith(
        'close',
        expect.any(Function)
      );
    });

    test('debería eliminar conexión cuando se llama al manejador de cierre', () => {
      eventBus.addConnection(mockResponse);
      expect(eventBus.connections.size).toBe(1);

      // Simular evento de cierre
      const closeHandler = mockResponse.on.mock.calls.find(
        call => call[0] === 'close'
      )[1];
      closeHandler();

      expect(eventBus.connections.size).toBe(0);
    });
  });

  describe('sendEvent', () => {
    test('debería enviar evento a conexión válida', () => {
      eventBus.sendEvent(mockResponse, 'test-event', { message: 'test' });

      expect(mockResponse.write).toHaveBeenCalledWith(
        'event: test-event\ndata: {"message":"test"}\n\n'
      );
    });

    test('debería no enviar evento a conexión destruida', () => {
      mockResponse.destroyed = true;
      eventBus.sendEvent(mockResponse, 'test-event', { message: 'test' });

      expect(mockResponse.write).not.toHaveBeenCalled();
    });

    test('debería no enviar evento a conexión nula', () => {
      eventBus.sendEvent(null, 'test-event', { message: 'test' });

      expect(mockResponse.write).not.toHaveBeenCalled();
    });
  });

  describe('broadcast', () => {
    let mockResponse2;

    beforeEach(() => {
      mockResponse2 = {
        write: jest.fn(),
        destroyed: false,
      };
      eventBus.connections.add(mockResponse);
      eventBus.connections.add(mockResponse2);
    });

    test('debería transmitir a todas las conexiones', () => {
      eventBus.broadcast('test-event', { message: 'broadcast' });

      expect(mockResponse.write).toHaveBeenCalledWith(
        'event: test-event\ndata: {"message":"broadcast"}\n\n'
      );
      expect(mockResponse2.write).toHaveBeenCalledWith(
        'event: test-event\ndata: {"message":"broadcast"}\n\n'
      );
    });

    test('debería rastrear conteos de eventos', () => {
      eventBus.broadcast('test-event', { message: 'test' });
      eventBus.broadcast('test-event', { message: 'test2' });
      eventBus.broadcast('other-event', { message: 'test3' });

      expect(eventBus.totalEvents).toBe(3);
      expect(eventBus.eventCounts.get('test-event')).toBe(2);
      expect(eventBus.eventCounts.get('other-event')).toBe(1);
    });

    test('debería limpiar conexiones destruidas durante la transmisión', () => {
      mockResponse2.destroyed = true;

      eventBus.broadcast('test-event', { message: 'test' });

      expect(mockResponse.write).toHaveBeenCalled();
      expect(mockResponse2.write).not.toHaveBeenCalled();
      expect(eventBus.connections.has(mockResponse2)).toBe(false);
    });

    test('debería manejar conjunto de conexiones vacío', () => {
      eventBus.connections.clear();

      expect(() => {
        eventBus.broadcast('test-event', { message: 'test' });
      }).not.toThrow();
    });
  });

  describe('getConnectionCount', () => {
    test('debería devolver conteo correcto de conexiones', () => {
      expect(eventBus.getConnectionCount()).toBe(0);

      eventBus.connections.add(mockResponse);
      expect(eventBus.getConnectionCount()).toBe(1);

      eventBus.connections.add({});
      expect(eventBus.getConnectionCount()).toBe(2);
    });
  });

  describe('getMetrics', () => {
    test('debería devolver métricas detalladas', () => {
      eventBus.connections.add(mockResponse);
      eventBus.broadcast('test-event', { message: 'test' });
      eventBus.broadcast('other-event', { message: 'test2' });

      const metrics = eventBus.getMetrics();

      expect(metrics).toEqual({
        totalEvents: 2,
        eventCounts: {
          'test-event': 1,
          'other-event': 1,
        },
        connections: 1,
        uptime: expect.objectContaining({
          formatted: expect.any(String),
          milliseconds: expect.any(Number),
          seconds: expect.any(Number),
        }),
        eventsPerSecond: expect.any(Number),
        status: 'active',
      });
    });

    test('debería manejar conteos de eventos vacíos', () => {
      const metrics = eventBus.getMetrics();

      expect(metrics.totalEvents).toBe(0);
      expect(metrics.eventCounts).toEqual({});
      expect(metrics.connections).toBe(0);
      expect(metrics.uptime).toEqual(
        expect.objectContaining({
          formatted: expect.any(String),
          milliseconds: expect.any(Number),
          seconds: expect.any(Number),
        })
      );
      expect(typeof metrics.eventsPerSecond).toBe('number');
      expect(metrics.status).toBe('active');
    });
  });

  describe('closeAll', () => {
    test('debería cerrar todas las conexiones y limpiar el conjunto', () => {
      const mockResponse2 = { end: jest.fn(), destroyed: false };
      eventBus.connections.add(mockResponse);
      eventBus.connections.add(mockResponse2);

      eventBus.closeAll();

      expect(mockResponse.end).toHaveBeenCalled();
      expect(mockResponse2.end).toHaveBeenCalled();
      expect(eventBus.connections.size).toBe(0);
    });

    test('debería manejar conjunto de conexiones vacío', () => {
      expect(() => {
        eventBus.closeAll();
      }).not.toThrow();
    });

    test('debería no llamar end en conexiones destruidas', () => {
      mockResponse.destroyed = true;
      eventBus.connections.add(mockResponse);

      eventBus.closeAll();

      expect(mockResponse.end).not.toHaveBeenCalled();
    });
  });
});
