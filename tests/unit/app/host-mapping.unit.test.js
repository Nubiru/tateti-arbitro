/**
 * Pruebas Unitarias para Lógica getHostForPort
 * Pruebas de mapeo de nombres de servicios Docker basado en variable de entorno DOCKER_DISCOVERY
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

describe('Lógica getHostForPort', () => {
  let originalEnv;
  let getHostForPort;

  beforeEach(() => {
    originalEnv = { ...process.env };

    getHostForPort = port => {
      if (process.env.DOCKER_DISCOVERY === 'true') {
        const portToService = {
          3001: 'random-bot-1',
          3002: 'random-bot-2',
          3003: 'random-bot-3',
          3004: 'random-bot-4',
          3005: 'algo-bot-1',
          3006: 'algo-bot-2',
          3007: 'algo-bot-3',
          3008: 'algo-bot-4',
        };
        return portToService[port] || 'localhost';
      }
      return 'localhost';
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Descubrimiento Docker Habilitado', () => {
    beforeEach(() => {
      process.env.DOCKER_DISCOVERY = 'true';
    });

    test('debería mapear puerto 3001 a random-bot-1', () => {
      expect(getHostForPort(3001)).toBe('random-bot-1');
    });

    test('debería mapear puerto 3002 a random-bot-2', () => {
      expect(getHostForPort(3002)).toBe('random-bot-2');
    });

    test('debería mapear puerto 3005 a algo-bot-1', () => {
      expect(getHostForPort(3005)).toBe('algo-bot-1');
    });

    test('debería mapear puerto 3008 a algo-bot-4', () => {
      expect(getHostForPort(3008)).toBe('algo-bot-4');
    });

    test('debería retornar localhost para puertos no mapeados', () => {
      expect(getHostForPort(9999)).toBe('localhost');
    });

    test('debería retornar localhost para puerto null', () => {
      expect(getHostForPort(null)).toBe('localhost');
    });

    test('debería retornar localhost para puerto undefined', () => {
      expect(getHostForPort(undefined)).toBe('localhost');
    });
  });

  describe('Descubrimiento Docker Deshabilitado', () => {
    beforeEach(() => {
      process.env.DOCKER_DISCOVERY = 'false';
    });

    test('debería retornar localhost para puerto 3001', () => {
      expect(getHostForPort(3001)).toBe('localhost');
    });

    test('debería retornar localhost para puerto 3002', () => {
      expect(getHostForPort(3002)).toBe('localhost');
    });

    test('debería retornar localhost para todos los puertos mapeados', () => {
      expect(getHostForPort(3001)).toBe('localhost');
      expect(getHostForPort(3005)).toBe('localhost');
      expect(getHostForPort(3008)).toBe('localhost');
    });
  });

  describe('Descubrimiento Docker No Establecido', () => {
    beforeEach(() => {
      delete process.env.DOCKER_DISCOVERY;
    });

    test('debería retornar localhost cuando DOCKER_DISCOVERY es undefined', () => {
      expect(getHostForPort(3001)).toBe('localhost');
    });

    test('debería retornar localhost para todos los puertos', () => {
      expect(getHostForPort(3001)).toBe('localhost');
      expect(getHostForPort(3002)).toBe('localhost');
      expect(getHostForPort(9999)).toBe('localhost');
    });
  });

  describe('Casos Extremos', () => {
    test('debería manejar string "true" correctamente', () => {
      process.env.DOCKER_DISCOVERY = 'true';
      expect(getHostForPort(3001)).toBe('random-bot-1');
    });

    test('debería no coincidir con boolean true', () => {
      process.env.DOCKER_DISCOVERY = true;
      expect(getHostForPort(3001)).toBe('localhost');
    });

    test('debería manejar string vacío como false', () => {
      process.env.DOCKER_DISCOVERY = '';
      expect(getHostForPort(3001)).toBe('localhost');
    });

    test('debería manejar "TRUE" (mayúsculas) como false', () => {
      process.env.DOCKER_DISCOVERY = 'TRUE';
      expect(getHostForPort(3001)).toBe('localhost');
    });
  });
});
