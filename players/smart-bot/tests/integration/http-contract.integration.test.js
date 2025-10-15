/**
 * Pruebas de Integración de Contrato HTTP de SmartBot
 * Enfoque TDD - pruebas escritas antes de la implementación
 * @lastModified 2025-10-10
 */

import request from 'supertest';
import { app, server } from '../../index.js';

describe('Contrato HTTP de SmartBot', () => {
  // Limpiar servidor después de todas las pruebas
  afterAll((done) => {
    server.close(done);
  });
  describe('endpoint GET /move', () => {
    test('debería retornar movimiento ganador cuando esté disponible (3x3)', async () => {
      const board = [1, 1, 0, 0, 0, 0, 0, 0, 0];
      const response = await request(app)
        .get('/move')
        .query({ board: JSON.stringify(board) });

      expect(response.status).toBe(200);
      expect(response.body.move).toBe(2); // Completar victoria
    });

    test('debería retornar movimiento de bloqueo cuando el oponente amenace (3x3)', async () => {
      const board = [0, 0, 0, 2, 2, 0, 1, 0, 0];
      const response = await request(app)
        .get('/move')
        .query({ board: JSON.stringify(board) });

      expect(response.status).toBe(200);
      expect(response.body.move).toBe(5); // Bloquear oponente
    });

    test('debería retornar centro en primer movimiento (3x3)', async () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const response = await request(app)
        .get('/move')
        .query({ board: JSON.stringify(board) });

      expect(response.status).toBe(200);
      expect(response.body.move).toBe(4);
    });

    test('debería retornar movimiento válido para tablero 5x5', async () => {
      const board = Array(25).fill(0);
      const response = await request(app)
        .get('/move')
        .query({ board: JSON.stringify(board) });

      expect(response.status).toBe(200);
      expect(response.body.move).toBe(12); // Centro para 5x5
    });

    test('debería retornar HTTP 400 para parámetro board faltante', async () => {
      const response = await request(app).get('/move');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('debería retornar HTTP 400 para formato de board inválido', async () => {
      const response = await request(app)
        .get('/move')
        .query({ board: 'invalid' });
      expect(response.status).toBe(400);
    });

    test('debería retornar HTTP 400 para board que no es array', async () => {
      const response = await request(app)
        .get('/move')
        .query({ board: JSON.stringify('not-array') });
      expect(response.status).toBe(400);
    });
  });

  describe('endpoint GET /health', () => {
    test('debería retornar estado saludable', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.player).toBe('SmartBot');
    });
  });

  describe('endpoint GET /info', () => {
    test('debería retornar información del bot', async () => {
      const response = await request(app).get('/info');
      expect(response.status).toBe(200);
      expect(response.body.strategy).toBe('Smart');
      expect(response.body.name).toBe('SmartBot');
    });
  });
});

