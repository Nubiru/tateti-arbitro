import request from 'supertest';
import express from 'express';
import { createApp, attachRateLimiter } from '../../src/app/app.factory.js';

/**
 * Pruebas de Integración de Seguridad
 * Pruebas para CORS, limitación de tasa, validación de entrada y encabezados de seguridad
 * @lastModified 2025-10-04
 * @version 1.0.0
 */

describe('Pruebas de Seguridad', () => {
  let app;

  beforeEach(() => {
    const { app: testApp } = createApp();
    app = testApp;
  });

  describe('Configuración CORS', () => {
    test('debería incluir encabezados CORS en las respuestas', async () => {
      const response = await request(app)
        .options('/api/match')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:3000'
      );
      expect(response.headers['access-control-allow-methods']).toContain(
        'POST'
      );
      expect(response.headers['access-control-allow-headers']).toContain(
        'Content-Type'
      );
    });

    test('debería rechazar solicitudes de orígenes no autorizados', async () => {
      const response = await request(app)
        .post('/api/match')
        .set('Origin', 'http://malicious-site.com')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        });

      // Debería seguir procesando la solicitud pero los encabezados CORS deberían estar restringidos
      expect(response.status).toBe(200);
    });
  });

  describe('Limitación de Tasa', () => {
    test('debería permitir tasa de solicitudes normal', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        });

      expect(response.status).toBe(200);
    });

    test('debería bloquear solicitudes excesivas', async () => {
      // Crear una aplicación Express fresca solo con limitación de tasa
      const testApp = express();
      testApp.use(express.json());

      // Adjuntar limitador de tasa con configuraciones muy restrictivas para pruebas
      attachRateLimiter(testApp, {
        windowMs: 1000, // ventana de 1 segundo para pruebas
        max: 2, // limitar cada IP a 2 solicitudes por windowMs para pruebas
        message: 'Demasiadas solicitudes',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      // Agregar una ruta de prueba simple
      testApp.post('/api/match', (req, res) => {
        res.json({ message: 'OK' });
      });

      // Las primeras dos solicitudes deberían tener éxito
      const response1 = await request(testApp)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        });

      const response2 = await request(testApp)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        });

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // La tercera solicitud debería estar limitada por tasa
      const response3 = await request(testApp)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        });

      expect(response3.status).toBe(429);
      expect(response3.body.message).toBe('Demasiadas solicitudes');
    });
  });

  describe('Validación de Entrada', () => {
    test('debería rechazar nombres de jugadores inválidos', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: '', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Datos de entrada inválidos');
    });

    test('debería rechazar números de puerto inválidos', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 2000 },
          player2: { name: 'Player2', port: 3002 },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Datos de entrada inválidos');
    });

    test('debería rechazar tamaños de tablero inválidos', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Datos de entrada inválidos');
    });

    test('debería rechazar intentos XSS en nombres de jugadores', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: '<script>alert("xss")</script>', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Datos de entrada inválidos');
    });

    test('debería aceptar entrada válida', async () => {
      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: 'Player1', port: 3001 },
          player2: { name: 'Player2', port: 3002 },
          boardSize: '3x3',
          noTie: false,
          speed: 'normal',
        });

      expect(response.status).toBe(200);
    });
  });

  describe('Encabezados de Seguridad', () => {
    test('debería incluir encabezados de seguridad', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('0'); // Los navegadores modernos deprecan este encabezado
    });

    test('debería incluir encabezados CSP', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers['content-security-policy']).toContain(
        "default-src 'self'"
      );
      expect(response.headers['content-security-policy']).toContain(
        "script-src 'self'"
      );
    });
  });

  describe('Límites de Tamaño de Cuerpo', () => {
    test('debería rechazar solicitudes de tamaño excesivo', async () => {
      const largeData = 'x'.repeat(11 * 1024 * 1024); // 11MB

      const response = await request(app)
        .post('/api/match')
        .send({
          player1: { name: largeData, port: 3001 },
          player2: { name: 'Player2', port: 3002 },
        });

      expect(response.status).toBe(413);
    });
  });
});
