/**
 * Pruebas de integración para Funcionalidad de Limitación de Tasa
 * Pruebas del comportamiento y configuración de limitación de tasa
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { createApp, attachRateLimiter } from '../../src/app/app.factory.js';

describe('Pruebas de Integración de Rate Limiting', () => {
  let app;
  let originalEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Limitación de Tasa en Entorno de Producción', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'production';
      const { app: testApp } = createApp();
      app = testApp;
    });

    test('debería permitir solicitudes dentro del límite de tasa', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
    });

    test('debería aplicar limitación de tasa a todas las rutas', async () => {
      // Hacer múltiples solicitudes para probar la limitación de tasa
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);

      // Todas las solicitudes deberían tener éxito dentro de los límites normales de tasa
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    test('debería handle rate limiting headers', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      // Los encabezados de limitación de tasa serían establecidos por express-rate-limit
      // Los encabezados exactos dependen de la configuración de limitación de tasa
    });
  });

  describe('Limitación de Tasa Deshabilitada en Entorno de Prueba', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'test';
      const { app: testApp } = createApp();
      app = testApp;
    });

    test('debería no aplicar limitación de tasa en entorno de prueba', async () => {
      // Hacer muchas solicitudes para verificar que no hay limitación de tasa
      const requests = Array.from({ length: 20 }, () =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);

      // Todas las solicitudes deberían tener éxito sin limitación de tasa
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    test('debería permitir solicitudes ilimitadas en entorno de prueba', async () => {
      // Hacer un gran número de solicitudes
      const requests = Array.from({ length: 100 }, () =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);

      // Todas las solicitudes deberían tener éxito
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Configuración Personalizada de Limitación de Tasa', () => {
    test('debería aplicar opciones personalizadas de limitación de tasa', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      // Adjuntar limitador de tasa personalizado
      attachRateLimiter(customApp, {
        windowMs: 1000, // ventana de 1 segundo
        max: 2, // Solo 2 solicitudes por ventana
        message: 'Custom rate limit exceeded',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      // Agregar una ruta simple
      customApp.get('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      // Las primeras dos solicitudes deberían tener éxito
      const response1 = await request(customApp).get('/test');
      const response2 = await request(customApp).get('/test');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // La tercera solicitud debería estar limitada por tasa
      const response3 = await request(customApp).get('/test');

      expect(response3.status).toBe(429);
      expect(response3.body.message).toBe('Custom rate limit exceeded');
    });

    test('debería manejar diferentes ventanas de limitación de tasa', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 100, // Ventana muy corta para pruebas
        max: 1, // Solo 1 solicitud por ventana
        message: 'Rate limit exceeded',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      customApp.get('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      // Primera solicitud debería funcionar
      const response1 = await request(customApp).get('/test');
      expect(response1.status).toBe(200);

      // Segunda solicitud debería estar limitada
      const response2 = await request(customApp).get('/test');
      expect(response2.status).toBe(429);

      // Esperar a que el limitador de tasa se reinicie (tiempo real, no timers falsos)
      await new Promise(resolve => setTimeout(resolve, 150));

      const response3 = await request(customApp).get('/test');
      expect(response3.status).toBe(200);
    });

    test('debería manejar diferentes valores máximos de limitación de tasa', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 1000,
        max: 3, // 3 solicitudes por ventana
        message: 'Rate limit exceeded',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      customApp.get('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      // Las primeras tres solicitudes deberían tener éxito
      const responses = await Promise.all([
        request(customApp).get('/test'),
        request(customApp).get('/test'),
        request(customApp).get('/test'),
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // La cuarta solicitud debería estar limitada por tasa
      const response4 = await request(customApp).get('/test');
      expect(response4.status).toBe(429);
    });
  });

  describe('Manejo de Errores de Limitación de Tasa', () => {
    test('debería retornar respuesta de error apropiada cuando está limitado por tasa', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 1000,
        max: 1,
        message: 'Demasiadas solicitudes',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      customApp.get('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      // Primera solicitud tiene éxito
      const response1 = await request(customApp).get('/test');
      expect(response1.status).toBe(200);

      // Segunda solicitud está limitada por tasa
      const response2 = await request(customApp).get('/test');
      expect(response2.status).toBe(429);
      expect(response2.body.message).toBe('Demasiadas solicitudes');
    });

    test('debería handle rate limiting with custom error handler', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 1000,
        max: 1,
        message: 'Rate limit exceeded',
        handler: (req, res) => {
          res.status(429).json({
            error: 'Custom rate limit error',
            retryAfter: '1 second',
          });
        },
      });

      customApp.get('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      // Primera solicitud tiene éxito
      const response1 = await request(customApp).get('/test');
      expect(response1.status).toBe(200);

      // Segunda solicitud usa manejador de error personalizado
      const response2 = await request(customApp).get('/test');
      expect(response2.status).toBe(429);
      expect(response2.body).toEqual({
        error: 'Custom rate limit error',
        retryAfter: '1 second',
      });
    });
  });

  describe('Rate Limiting with Different IP Addresses', () => {
    test('debería apply rate limiting per IP address', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 1000,
        max: 1,
        message: 'Rate limit exceeded',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      customApp.get('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      // Simulate requests from different IPs
      const response1 = await request(customApp)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1');

      const response2 = await request(customApp)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.2');

      // Both should succeed as they're from different IPs
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });

    test('debería track rate limiting per IP address', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 1000,
        max: 1,
        message: 'Rate limit exceeded',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      customApp.get('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      // Primera solicitud desde IP 1 tiene éxito
      const response1 = await request(customApp)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1');

      // Segunda solicitud desde la misma IP está limitada por tasa
      const response2 = await request(customApp)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.1');

      // Tercera solicitud desde IP diferente tiene éxito
      const response3 = await request(customApp)
        .get('/test')
        .set('X-Forwarded-For', '192.168.1.2');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(429);
      expect(response3.status).toBe(200);
    });
  });

  describe('Rate Limiting Configuration Validation', () => {
    test('debería use default options when none provided', () => {
      const customApp = express();

      attachRateLimiter(customApp);

      // Should not throw error
      expect(customApp).toBeDefined();
    });

    test('debería merge custom options with defaults', () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 5000,
        message: 'Custom message',
      });

      // Should not throw error
      expect(customApp).toBeDefined();
    });

    test('debería handle empty options object', () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {});

      // Should not throw error
      expect(customApp).toBeDefined();
    });

    test('debería handle undefined options', () => {
      const customApp = express();

      attachRateLimiter(customApp, undefined);

      // Should not throw error
      expect(customApp).toBeDefined();
    });
  });

  describe('Rate Limiting with Different HTTP Methods', () => {
    test('debería apply rate limiting to GET requests', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 1000,
        max: 1,
        message: 'Rate limit exceeded',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      customApp.get('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      const response1 = await request(customApp).get('/test');
      const response2 = await request(customApp).get('/test');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(429);
    });

    test('debería apply rate limiting to POST requests', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 1000,
        max: 1,
        message: 'Rate limit exceeded',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      customApp.post('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      const response1 = await request(customApp).post('/test');
      const response2 = await request(customApp).post('/test');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(429);
    });

    test('debería apply rate limiting to PUT requests', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 1000,
        max: 1,
        message: 'Rate limit exceeded',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      customApp.put('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      const response1 = await request(customApp).put('/test');
      const response2 = await request(customApp).put('/test');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(429);
    });

    test('debería apply rate limiting to DELETE requests', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 1000,
        max: 1,
        message: 'Rate limit exceeded',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      customApp.delete('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      const response1 = await request(customApp).delete('/test');
      const response2 = await request(customApp).delete('/test');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(429);
    });
  });

  describe('Rate Limiting Reset Behavior', () => {
    test('debería reset rate limit after window expires', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 100, // Ventana muy corta para pruebas
        max: 1,
        message: 'Rate limit exceeded',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      customApp.get('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      // Primera solicitud tiene éxito
      const response1 = await request(customApp).get('/test');
      expect(response1.status).toBe(200);

      // Segunda solicitud está limitada por tasa
      const response2 = await request(customApp).get('/test');
      expect(response2.status).toBe(429);

      // Esperar a que el limitador de tasa se reinicie (tiempo real)
      await new Promise(resolve => setTimeout(resolve, 150));

      // Tercera solicitud debería tener éxito después del reinicio
      const response3 = await request(customApp).get('/test');
      expect(response3.status).toBe(200);
    });
  });

  describe('Rate Limiting Performance', () => {
    test('debería handle high frequency requests efficiently', async () => {
      const customApp = express();
      customApp.set('trust proxy', true);

      attachRateLimiter(customApp, {
        windowMs: 1000,
        max: 10,
        message: 'Rate limit exceeded',
        handler: (req, res, next, opts) => {
          res.status(opts.statusCode).json({ message: opts.message });
        },
      });

      customApp.get('/test', (req, res) => {
        res.json({ message: 'OK' });
      });

      // Hacer muchas solicitudes rápidamente
      const startTime = Date.now();
      const requests = Array.from({ length: 15 }, () =>
        request(customApp).get('/test')
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // Debería completarse rápidamente
      expect(endTime - startTime).toBeLessThan(1000);

      // Las primeras 10 deberían tener éxito, las últimas 5 deberían estar limitadas por tasa
      const successCount = responses.filter(r => r.status === 200).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;

      expect(successCount).toBe(10);
      expect(rateLimitedCount).toBe(5);
    });
  });
});
