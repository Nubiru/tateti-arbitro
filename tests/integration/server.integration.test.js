/**
 * Pruebas de integración para endpoints del servidor usando app factory
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app/app.factory.js';

describe('Endpoints del Servidor', () => {
  let app;
  let mockArbitrator;
  let mockHttp;
  let mockEvents;

  beforeAll(async () => {
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
    });

    app = testApp;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/match', () => {
    test('debería devolver 400 cuando falta player1', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({ player2: { name: 'Player2', port: 3002 } });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Se necesitan dos jugadores para iniciar la partida.'
      );
    });

    test('debería devolver 400 cuando falta player2', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({ player1: { name: 'Player1', port: 3001 } });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Se necesitan dos jugadores para iniciar la partida.'
      );
    });

    test('debería devolver 400 cuando faltan ambos jugadores', async () => {
      const response = await request(app).post('/api/match').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Se necesitan dos jugadores para iniciar la partida.'
      );
    });

    test('debería devolver 200 con resultado de partida cuando se proporcionan jugadores', async () => {
      const mockResult = {
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        message: 'Player1 gano la partida',
        finalBoard: [1, 1, 1, 0, 0, 0, 0, 0, 0],
        history: [],
        players: [
          {
            name: 'Player1',
            port: 3001,
            host: 'random-bot-1',
            protocol: 'http',
            isHuman: false,
          },
          {
            name: 'Player2',
            port: 3002,
            host: 'random-bot-2',
            protocol: 'http',
            isHuman: false,
          },
        ],
        winningLine: [0, 1, 2],
      };

      mockArbitrator.runMatch.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(mockArbitrator.runMatch).toHaveBeenCalledWith(
        [
          {
            name: 'Player1',
            port: 3001,
            host: 'random-bot-1',
            protocol: 'http',
            isHuman: false,
          },
          {
            name: 'Player2',
            port: 3002,
            host: 'random-bot-2',
            protocol: 'http',
            isHuman: false,
          },
        ],
        { timeoutMs: 3000, noTie: false, boardSize: 3 }
      );
    });

    test('debería pasar opción timeoutMs al árbitro', async () => {
      const mockResult = {
        result: 'win',
        winner: { name: 'Player1', port: 3001 },
        message: 'Player1 gano la partida',
        finalBoard: [1, 1, 1, 0, 0, 0, 0, 0, 0],
        history: [],
        players: [
          {
            name: 'Player1',
            port: 3001,
            host: 'random-bot-1',
            protocol: 'http',
            isHuman: false,
          },
          {
            name: 'Player2',
            port: 3002,
            host: 'random-bot-2',
            protocol: 'http',
            isHuman: false,
          },
        ],
        winningLine: [0, 1, 2],
      };

      mockArbitrator.runMatch.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          timeoutMs: 5000,
        });

      expect(response.status).toBe(200);
      expect(mockArbitrator.runMatch).toHaveBeenCalledWith(
        [
          {
            name: 'Player1',
            port: 3001,
            host: 'random-bot-1',
            protocol: 'http',
            isHuman: false,
          },
          {
            name: 'Player2',
            port: 3002,
            host: 'random-bot-2',
            protocol: 'http',
            isHuman: false,
          },
        ],
        { timeoutMs: 5000, noTie: false, boardSize: 3 }
      );
    });

    test('debería devolver 500 cuando el árbitro lanza un error', async () => {
      mockArbitrator.runMatch.mockRejectedValue(new Error('Arbitrator error'));

      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });
  });

  describe('Manejador 404', () => {
    test('debería devolver 404 para rutas desconocidas', async () => {
      const response = await request(app).get('/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Ruta no encontrada');
    });

    test('debería devolver 404 para POST a rutas desconocidas', async () => {
      const response = await request(app)
        .post('/unknown-route')
        .send({ data: 'test' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Ruta no encontrada');
    });
  });

  describe('Archivos Estáticos', () => {
    test('debería servir archivos estáticos desde el directorio público', async () => {
      const response = await request(app).get('/');

      // No debería retornar 404 para la ruta raíz (sirve index.html)
      expect(response.status).not.toBe(404);
    });
  });
});
