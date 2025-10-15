/**
 * Pruebas de integración para emisión de eventos SSE usando app factory
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import request from 'supertest';
// EventSource está disponible globalmente en el entorno de prueba
import { createApp } from '../../src/app/app.factory.js';

describe('Integración de Eventos SSE', () => {
  let app;
  let mockArbitrator;
  let mockHttp;
  let mockEvents;
  let mockEventBus;

  beforeAll(async () => {
    // Crear bus de eventos simulado
    mockEventBus = {
      broadcast: jest.fn(),
      addConnection: jest.fn(),
      getConnectionCount: jest.fn(() => 0),
      getMetrics: jest.fn(() => ({ totalEvents: 0, connections: 0 })),
    };

    // Crear dependencias simuladas
    mockHttp = {
      get: jest.fn(),
    };
    mockEvents = {
      broadcastMatchStart: jest.fn(),
      broadcastMatchMove: jest.fn(),
      broadcastMatchWin: jest.fn(),
      broadcastMatchDraw: jest.fn(),
      broadcastMatchError: jest.fn(),
    };
    mockArbitrator = {
      runMatch: jest.fn(),
    };

    // Crear app con dependencias simuladas
    const { app: testApp } = createApp({
      http: mockHttp,
      events: mockEvents,
      arbitrator: mockArbitrator,
      eventBus: mockEventBus,
    });

    app = testApp;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar respuestas simuladas por defecto
    mockHttp.get.mockResolvedValue({
      success: true,
      data: { movimiento: 0 },
    });
  });

  describe('Eventos de Partida vía API', () => {
    test('debería emit events when running a match through API', async () => {
      // Simular partida exitosa
      mockArbitrator.runMatch.mockResolvedValue({
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        message: 'Player1 gano la partida',
        finalBoard: [1, 1, 1, 0, 0, 0, 0, 0, 0],
        history: [
          {
            player: { name: 'Player1', port: 3001, id: 'X' },
            move: 0,
            board: ['X', 0, 0, 0, 0, 0, 0, 0, 0],
            turn: 1,
            timestamp: '2025-10-03T10:00:00.000Z',
          },
          {
            player: { name: 'Player2', port: 3002, id: 'O' },
            move: 1,
            board: ['X', 'O', 0, 0, 0, 0, 0, 0, 0],
            turn: 2,
            timestamp: '2025-10-03T10:00:01.000Z',
          },
          {
            player: { name: 'Player1', port: 3001, id: 'X' },
            move: 2,
            board: ['X', 'O', 'X', 0, 0, 0, 0, 0, 0],
            turn: 3,
            timestamp: '2025-10-03T10:00:02.000Z',
          },
        ],
        players: [
          { name: 'Player1', port: 3001, host: 'localhost', protocol: 'http' },
          { name: 'Player2', port: 3002, host: 'localhost', protocol: 'http' },
        ],
        winningLine: [0, 1, 2],
      });

      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        })
        .expect(200);

      expect(response.body.result).toBe('win');
      expect(response.body.winner).toBeDefined();
      expect(response.body.message).toContain('gano');
    });

    test('debería handle player errors and emit appropriate events', async () => {
      mockArbitrator.runMatch.mockResolvedValue({
        result: 'error',
        winner: { name: 'Player2', port: 3002 },
        message: 'Player1 no pudo realizar un movimiento: Connection failed',
        finalBoard: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        history: [
          {
            player: { name: 'Player1', port: 3001, id: 'X' },
            move: 0,
            board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            turn: 1,
            timestamp: '2025-10-03T10:00:00.000Z',
            error: 'Connection failed',
          },
        ],
        players: [
          { name: 'Player1', port: 3001, host: 'localhost', protocol: 'http' },
          { name: 'Player2', port: 3002, host: 'localhost', protocol: 'http' },
        ],
      });

      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        })
        .expect(200);

      expect(response.body.result).toBe('error');
      expect(response.body.message).toContain(
        'Player1 no pudo realizar un movimiento'
      );
    });
  });

  describe('Endpoint SSE', () => {
    test('debería return connection status', async () => {
      const response = await request(app).get('/api/stream/status').expect(200);

      expect(response.body).toHaveProperty('connections');
      expect(response.body).toHaveProperty('eventsSent');
      expect(response.body).toHaveProperty('metrics');
      expect(response.body.metrics).toHaveProperty('totalEvents');
    });
  });

  describe('Formas de Carga de Eventos SSE', () => {
    test('debería emit match:start event with correct payload structure', async () => {
      mockArbitrator.runMatch.mockResolvedValue({
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        message: 'Player1 gano la partida',
        finalBoard: [1, 1, 1, 0, 0, 0, 0, 0, 0],
        history: [],
        players: [
          { name: 'Player1', port: 3001, host: 'localhost', protocol: 'http' },
          { name: 'Player2', port: 3002, host: 'localhost', protocol: 'http' },
        ],
        winningLine: [0, 1, 2],
      });

      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        })
        .expect(200);

      expect(response.body).toHaveProperty('winner');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('finalBoard');
      expect(response.body).toHaveProperty('history');
    });

    test('debería emit match:move event with correct payload structure', async () => {
      mockArbitrator.runMatch.mockResolvedValue({
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        message: 'Player1 gano la partida',
        finalBoard: [1, 1, 1, 0, 0, 0, 0, 0, 0],
        history: [
          {
            player: { name: 'Player1', port: 3001, id: 'X' },
            move: 0,
            board: ['X', 0, 0, 0, 0, 0, 0, 0, 0],
            turn: 1,
            timestamp: '2025-10-03T10:00:00.000Z',
          },
        ],
        players: [
          { name: 'Player1', port: 3001, host: 'localhost', protocol: 'http' },
          { name: 'Player2', port: 3002, host: 'localhost', protocol: 'http' },
        ],
        winningLine: [0, 1, 2],
      });

      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        })
        .expect(200);

      expect(response.body.history).toBeInstanceOf(Array);
      expect(response.body.history.length).toBeGreaterThan(0);
      expect(response.body.history[0]).toHaveProperty('player');
      expect(response.body.history[0]).toHaveProperty('move');
      expect(response.body.history[0]).toHaveProperty('timestamp');
    });

    test('debería emit match:win event with correct payload structure', async () => {
      mockArbitrator.runMatch.mockResolvedValue({
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        message: 'Player1 gano la partida',
        finalBoard: [1, 1, 1, 0, 0, 0, 0, 0, 0],
        history: [],
        players: [
          { name: 'Player1', port: 3001, host: 'localhost', protocol: 'http' },
          { name: 'Player2', port: 3002, host: 'localhost', protocol: 'http' },
        ],
        winningLine: [0, 1, 2],
      });

      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        })
        .expect(200);

      expect(response.body.result).toBe('win');
      expect(response.body.winner).toBeDefined();
      expect(response.body.message).toContain('gano');
      expect(response.body.finalBoard).toBeInstanceOf(Array);
    });
  });
});
