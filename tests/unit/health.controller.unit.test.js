/**
 * Pruebas unitarias para Health Controller
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { jest } from '@jest/globals';

// Stubs seguros de proceso vía spies (sin sobrescritura global)

// Importar las funciones a probar
import {
  getBasicHealth,
  getDetailedHealth,
  formatUptime,
  formatMemory,
} from '../../src/app/controllers/health.controller.js';

describe('Pruebas Unitarias del Controlador de Salud', () => {
  let uptimeSpy;
  let memorySpy;
  let originalEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-03T10:00:00.000Z'));

    // Almacenar env original
    originalEnv = { ...process.env };
    process.env = { ...originalEnv, npm_package_version: '1.0.0' };

    // Crear espías para métodos de proceso
    uptimeSpy = jest.spyOn(process, 'uptime').mockReturnValue(3600);
    memorySpy = jest.spyOn(process, 'memoryUsage').mockReturnValue({
      rss: 1024 * 1024 * 100, // 100 MB
      heapTotal: 1024 * 1024 * 50, // 50 MB
      heapUsed: 1024 * 1024 * 25, // 25 MB
      external: 1024 * 1024 * 10, // 10 MB
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    uptimeSpy?.mockRestore();
    memorySpy?.mockRestore();
    process.env = originalEnv;
  });

  describe('getBasicHealth', () => {
    test('debería retornar datos de salud básicos', () => {
      const result = getBasicHealth();

      expect(result).toEqual({
        status: 'healthy',
        timestamp: '2025-10-03T10:00:00.000Z',
        uptime: 3600,
        memory: {
          rss: 104857600,
          heapTotal: 52428800,
          heapUsed: 26214400,
          external: 10485760,
        },
        version: '1.0.0',
      });
    });

    test('debería usar versión por defecto cuando npm_package_version no está configurado', () => {
      // Sobrescribir env para esta prueba
      process.env = { ...originalEnv };
      delete process.env.npm_package_version;

      uptimeSpy.mockReturnValue(0);
      memorySpy.mockReturnValue({
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
      });

      const result = getBasicHealth();

      expect(result.version).toBe('1.0.0');
    });
  });

  describe('getDetailedHealth', () => {
    test('debería retornar datos de salud detallados', () => {
      uptimeSpy.mockReturnValue(3661); // 1h 1m 1s

      const result = getDetailedHealth();

      expect(result).toEqual({
        status: 'healthy',
        timestamp: '2025-10-03T10:00:00.000Z',
        uptime: {
          seconds: 3661,
          formatted: '1h 1m 1s',
        },
        memory: {
          rss: '100 MB',
          heapTotal: '50 MB',
          heapUsed: '25 MB',
          external: '10 MB',
        },
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
        },
        version: '1.0.0',
      });
    });

    test('debería manejar tiempo de actividad cero', () => {
      uptimeSpy.mockReturnValue(0);
      memorySpy.mockReturnValue({
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
      });

      const result = getDetailedHealth();

      expect(result.uptime).toEqual({
        seconds: 0,
        formatted: '0h 0m 0s',
      });
    });

    test('debería manejar valores grandes de tiempo de actividad', () => {
      uptimeSpy.mockReturnValue(90061); // 25h 1m 1s
      memorySpy.mockReturnValue({
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
      });

      const result = getDetailedHealth();

      expect(result.uptime).toEqual({
        seconds: 90061,
        formatted: '25h 1m 1s',
      });
    });
  });

  describe('formatUptime', () => {
    test('debería formatear tiempo de actividad correctamente', () => {
      expect(formatUptime(0)).toBe('0h 0m 0s');
      expect(formatUptime(60)).toBe('0h 1m 0s');
      expect(formatUptime(3661)).toBe('1h 1m 1s');
      expect(formatUptime(3600)).toBe('1h 0m 0s');
      expect(formatUptime(90061)).toBe('25h 1m 1s');
    });

    test('debería manejar segundos fraccionarios', () => {
      expect(formatUptime(61.5)).toBe('0h 1m 1s');
      expect(formatUptime(3661.7)).toBe('1h 1m 1s');
    });
  });

  describe('formatMemory', () => {
    test('debería formatear memoria correctamente', () => {
      expect(formatMemory(0)).toBe('0 MB');
      expect(formatMemory(1024 * 1024)).toBe('1 MB');
      expect(formatMemory(1024 * 1024 * 100)).toBe('100 MB');
      expect(formatMemory(1024 * 1024 * 100.5)).toBe('101 MB'); // Redondeado hacia arriba
      expect(formatMemory(1024 * 1024 * 99.5)).toBe('100 MB'); // Redondeado hacia arriba
    });

    test('debería manejar valores grandes de memoria', () => {
      expect(formatMemory(1024 * 1024 * 1024)).toBe('1024 MB');
      expect(formatMemory(1024 * 1024 * 2048)).toBe('2048 MB');
    });

    test('debería manejar bytes fraccionarios', () => {
      expect(formatMemory(1024 * 1024 * 0.1)).toBe('0 MB');
      expect(formatMemory(1024 * 1024 * 0.5)).toBe('1 MB');
      expect(formatMemory(1024 * 1024 * 0.9)).toBe('1 MB');
    });

    test('debería manejar valores muy pequeños', () => {
      expect(formatMemory(1)).toBe('0 MB');
      expect(formatMemory(1023)).toBe('0 MB');
      expect(formatMemory(1024)).toBe('0 MB');
    });

    test('debería manejar valores negativos', () => {
      expect(formatMemory(-1)).toBe('0 MB');
      expect(formatMemory(-1024 * 1024)).toBe('0 MB');
    });
  });

  describe('Casos Límite y Cobertura de Ramas', () => {
    test('debería manejar valores muy grandes de tiempo de actividad en getDetailedHealth', () => {
      uptimeSpy.mockReturnValue(999999999); // Tiempo de actividad muy grande
      memorySpy.mockReturnValue({
        rss: 1024 * 1024 * 100,
        heapTotal: 1024 * 1024 * 50,
        heapUsed: 1024 * 1024 * 25,
        external: 1024 * 1024 * 10,
      });

      const result = getDetailedHealth();

      expect(result.uptime.seconds).toBe(999999999);
      expect(result.uptime.formatted).toMatch(/^\d+h \d+m \d+s$/);
    });

    test('debería manejar tiempo de actividad con límites exactos de hora', () => {
      uptimeSpy.mockReturnValue(7200); // Exactamente 2 horas
      memorySpy.mockReturnValue({
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
      });

      const result = getDetailedHealth();

      expect(result.uptime.formatted).toBe('2h 0m 0s');
    });

    test('debería manejar tiempo de actividad con límites exactos de minuto', () => {
      uptimeSpy.mockReturnValue(120); // Exactamente 2 minutos
      memorySpy.mockReturnValue({
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
      });

      const result = getDetailedHealth();

      expect(result.uptime.formatted).toBe('0h 2m 0s');
    });

    test('debería manejar tiempo de actividad con límites exactos de segundo', () => {
      uptimeSpy.mockReturnValue(30); // Exactamente 30 segundos
      memorySpy.mockReturnValue({
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
      });

      const result = getDetailedHealth();

      expect(result.uptime.formatted).toBe('0h 0m 30s');
    });

    test('debería manejar valores de memoria que se redondean a cero', () => {
      uptimeSpy.mockReturnValue(0);
      memorySpy.mockReturnValue({
        rss: 511, // Menos de 512KB, debería redondear a 0
        heapTotal: 1023, // Menos de 1MB, debería redondear a 0
        heapUsed: 1024 * 1024, // Exactamente 1MB, debería redondear a 1
        external: 0,
      });

      const result = getDetailedHealth();

      expect(result.memory.rss).toBe('0 MB');
      expect(result.memory.heapTotal).toBe('0 MB');
      expect(result.memory.heapUsed).toBe('1 MB');
      expect(result.memory.external).toBe('0 MB');
    });

    test('debería manejar valores de memoria que se redondean hacia arriba', () => {
      uptimeSpy.mockReturnValue(0);
      memorySpy.mockReturnValue({
        rss: 1024 * 1024 * 100.6, // Debería redondear a 101
        heapTotal: 1024 * 1024 * 200.6, // Debería redondear a 201
        heapUsed: 1024 * 1024 * 50.6, // Debería redondear a 51
        external: 1024 * 1024 * 10.6, // Debería redondear a 11
      });

      const result = getDetailedHealth();

      expect(result.memory.rss).toBe('101 MB');
      expect(result.memory.heapTotal).toBe('201 MB');
      expect(result.memory.heapUsed).toBe('51 MB');
      expect(result.memory.external).toBe('11 MB');
    });

    test('debería manejar valores negativos de memoria', () => {
      uptimeSpy.mockReturnValue(0);
      memorySpy.mockReturnValue({
        rss: -100,
        heapTotal: -200,
        heapUsed: -50,
        external: -10,
      });

      const result = getDetailedHealth();

      expect(result.memory.rss).toBe('0 MB');
      expect(result.memory.heapTotal).toBe('0 MB');
      expect(result.memory.heapUsed).toBe('0 MB');
      expect(result.memory.external).toBe('0 MB');
    });

    test('debería manejar valores muy grandes de memoria', () => {
      uptimeSpy.mockReturnValue(0);
      memorySpy.mockReturnValue({
        rss: 1024 * 1024 * 1024 * 2, // 2GB
        heapTotal: 1024 * 1024 * 1024 * 4, // 4GB
        heapUsed: 1024 * 1024 * 1024 * 1.5, // 1.5GB
        external: 1024 * 1024 * 512, // 512MB
      });

      const result = getDetailedHealth();

      expect(result.memory.rss).toBe('2048 MB');
      expect(result.memory.heapTotal).toBe('4096 MB');
      expect(result.memory.heapUsed).toBe('1536 MB');
      expect(result.memory.external).toBe('512 MB');
    });

    test('debería manejar respaldo de versión cuando npm_package_version es cadena vacía', () => {
      process.env = { ...originalEnv, npm_package_version: '' };

      const result = getBasicHealth();

      expect(result.version).toBe('1.0.0');
    });

    test('debería manejar respaldo de versión cuando npm_package_version es null', () => {
      process.env = { ...originalEnv, npm_package_version: null };

      const result = getBasicHealth();

      expect(result.version).toBe('1.0.0');
    });

    test('debería manejar respaldo de versión cuando npm_package_version es undefined', () => {
      process.env = { ...originalEnv };
      delete process.env.npm_package_version;

      const result = getBasicHealth();

      expect(result.version).toBe('1.0.0');
    });

    test('debería usar npm_package_version real cuando está configurado', () => {
      process.env = { ...originalEnv, npm_package_version: '2.5.3' };

      const result = getBasicHealth();

      expect(result.version).toBe('2.5.3');
    });

    test('debería usar npm_package_version real en getDetailedHealth', () => {
      process.env = { ...originalEnv, npm_package_version: '3.0.0-beta' };

      const result = getDetailedHealth();

      expect(result.version).toBe('3.0.0-beta');
    });
  });
});
