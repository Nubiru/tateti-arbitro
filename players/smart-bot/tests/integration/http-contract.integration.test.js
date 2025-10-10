/**
 * SmartBot HTTP Contract Integration Tests
 * TDD approach - tests written before implementation
 * @lastModified 2025-10-10
 */

import request from 'supertest';
import { app, server } from '../../index.js';

describe('SmartBot HTTP Contract', () => {
  // Cleanup server after all tests
  afterAll((done) => {
    server.close(done);
  });
  describe('GET /move endpoint', () => {
    test('should return winning move when available (3x3)', async () => {
      const board = [1, 1, 0, 0, 0, 0, 0, 0, 0];
      const response = await request(app)
        .get('/move')
        .query({ board: JSON.stringify(board) });

      expect(response.status).toBe(200);
      expect(response.body.move).toBe(2); // Complete win
    });

    test('should return blocking move when opponent threatens (3x3)', async () => {
      const board = [0, 0, 0, 2, 2, 0, 1, 0, 0];
      const response = await request(app)
        .get('/move')
        .query({ board: JSON.stringify(board) });

      expect(response.status).toBe(200);
      expect(response.body.move).toBe(5); // Block opponent
    });

    test('should return center on first move (3x3)', async () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const response = await request(app)
        .get('/move')
        .query({ board: JSON.stringify(board) });

      expect(response.status).toBe(200);
      expect(response.body.move).toBe(4);
    });

    test('should return valid move for 5x5 board', async () => {
      const board = Array(25).fill(0);
      const response = await request(app)
        .get('/move')
        .query({ board: JSON.stringify(board) });

      expect(response.status).toBe(200);
      expect(response.body.move).toBe(12); // Center for 5x5
    });

    test('should return HTTP 400 for missing board parameter', async () => {
      const response = await request(app).get('/move');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should return HTTP 400 for invalid board format', async () => {
      const response = await request(app)
        .get('/move')
        .query({ board: 'invalid' });
      expect(response.status).toBe(400);
    });

    test('should return HTTP 400 for non-array board', async () => {
      const response = await request(app)
        .get('/move')
        .query({ board: JSON.stringify('not-array') });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /health endpoint', () => {
    test('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.player).toBe('SmartBot');
    });
  });

  describe('GET /info endpoint', () => {
    test('should return bot information', async () => {
      const response = await request(app).get('/info');
      expect(response.status).toBe(200);
      expect(response.body.strategy).toBe('Smart');
      expect(response.body.name).toBe('SmartBot');
    });
  });
});

