/**
 * RandomBot HTTP Contract Integration Tests
 * Tests for REST API endpoints
 * @lastModified 2025-10-10
 */

import request from 'supertest';
import { app, server } from '../../index.js';

describe('RandomBot HTTP Contract', () => {
  // Cleanup server after all tests
  afterAll((done) => {
    server.close(done);
  });
  describe('GET /move endpoint', () => {
    test('should return valid move for 3x3 board', async () => {
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const response = await request(app)
        .get('/move')
        .query({ board: JSON.stringify(board) });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('move');
      expect(response.body.move).toBeGreaterThanOrEqual(0);
      expect(response.body.move).toBeLessThan(9);
    });

    test('should return valid move for 5x5 board', async () => {
      const board = Array(25).fill(0);
      const response = await request(app)
        .get('/move')
        .query({ board: JSON.stringify(board) });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('move');
      expect(response.body.move).toBeGreaterThanOrEqual(0);
      expect(response.body.move).toBeLessThan(25);
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
        .query({ board: JSON.stringify({}) });
      expect(response.status).toBe(400);
    });
  });

  describe('GET /health endpoint', () => {
    test('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
    });
  });
});

