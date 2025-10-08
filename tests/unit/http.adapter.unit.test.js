/**
 * Pruebas unitarias para Adaptador HTTP
 * Pruebas para funciones puras y lógica del adaptador HTTP
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import {
  HttpAdapter,
  buildUrl,
  buildRequestData,
  parseMoveResponse,
  validateMove,
  handleError,
  extractMoveFromResponse,
  handleRequestError,
  createHttpAdapter,
} from '../../src/domain/game/http.adapter.js';

// No se necesita simulación de axios para pruebas de funciones puras

describe('Pruebas Unitarias del Adaptador HTTP', () => {
  let httpAdapter;
  let mockLogger;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    };

    httpAdapter = new HttpAdapter({ logger: mockLogger });
  });

  describe('Constructor', () => {
    test('debería inicializar con logger', () => {
      expect(httpAdapter.logger).toBe(mockLogger);
    });

    test('debería lanzar error si logger falta', () => {
      expect(() => {
        new HttpAdapter({});
      }).toThrow();
    });
  });

  describe('buildUrl', () => {
    test('debería construir URL con protocolo por defecto', () => {
      const player = { name: 'Player 1', port: 3001 };
      const endpoint = '/move';

      const url = httpAdapter.buildUrl(player, endpoint);

      expect(url).toBe('http://localhost:3001/move');
    });

    test('debería construir URL con protocolo personalizado', () => {
      const player = { name: 'Player 1', port: 3001, protocol: 'https' };
      const endpoint = '/move';

      const url = httpAdapter.buildUrl(player, endpoint);

      expect(url).toBe('https://localhost:3001/move');
    });

    test('debería construir URL con host personalizado', () => {
      const player = { name: 'Player 1', port: 3001, host: '192.168.1.100' };
      const endpoint = '/move';

      const url = httpAdapter.buildUrl(player, endpoint);

      expect(url).toBe('http://192.168.1.100:3001/move');
    });

    test('debería manejar diferentes endpoints', () => {
      const player = { name: 'Player 1', port: 3001 };
      const endpoint = '/api/move';

      const url = httpAdapter.buildUrl(player, endpoint);

      expect(url).toBe('http://localhost:3001/api/move');
    });
  });

  describe('buildRequestData', () => {
    test('debería construir datos de solicitud con tablero y símbolo', () => {
      const board = ['X', 'O', '', '', '', '', '', '', ''];
      const symbol = 'X';
      const options = { timeoutMs: 5000 };

      const data = httpAdapter.buildRequestData(board, symbol, options);

      expect(data).toEqual({
        board: board,
        symbol: symbol,
        timeout: 5000,
      });
    });

    test('debería usar timeout por defecto cuando no se proporciona', () => {
      const board = ['X', 'O', '', '', '', '', '', '', ''];
      const symbol = 'X';

      const data = httpAdapter.buildRequestData(board, symbol, {});

      expect(data.timeout).toBe(30000);
    });

    test('debería manejar diferentes tamaños de tablero', () => {
      const board = Array(25).fill('');
      const symbol = 'X';
      const options = { timeoutMs: 5000 };

      const data = httpAdapter.buildRequestData(board, symbol, options);

      expect(data.board).toHaveLength(25);
      expect(data.symbol).toBe('X');
    });
  });

  describe('parseMoveResponse', () => {
    test('debería parsear movimiento desde campo move', () => {
      const response = { data: { move: 5 } };

      const move = httpAdapter.parseMoveResponse(response);

      expect(move).toBe(5);
    });

    test('debería parsear movimiento desde campo movimiento', () => {
      const response = { data: { movimiento: 3 } };

      const move = httpAdapter.parseMoveResponse(response);

      expect(move).toBe(3);
    });

    test('debería parsear movimiento desde campo data.move anidado', () => {
      const response = { data: { data: { move: 7 } } };

      const move = httpAdapter.parseMoveResponse(response);

      expect(move).toBe(7);
    });

    test('debería parsear movimiento desde campo data.movimiento anidado', () => {
      const response = { data: { data: { movimiento: 1 } } };

      const move = httpAdapter.parseMoveResponse(response);

      expect(move).toBe(1);
    });

    test('debería convertir movimientos string a números', () => {
      const response = { data: { move: '4' } };

      const move = httpAdapter.parseMoveResponse(response);

      expect(move).toBe(4);
      expect(typeof move).toBe('number');
    });

    test('debería lanzar error para respuesta inválida', () => {
      const response = { data: {} };

      expect(() => {
        httpAdapter.parseMoveResponse(response);
      }).toThrow('Respuesta inválida del jugador');
    });

    test('debería lanzar error para datos faltantes', () => {
      const response = {};

      expect(() => {
        httpAdapter.parseMoveResponse(response);
      }).toThrow('Respuesta inválida del jugador');
    });

    test('debería lanzar error para movimiento no numérico', () => {
      const response = { data: { move: 'invalid' } };

      expect(() => {
        httpAdapter.parseMoveResponse(response);
      }).toThrow('El movimiento debe ser un número');
    });
  });

  describe('validateMove', () => {
    test('debería validar movimiento válido', () => {
      const move = 5;
      const boardSize = 3;

      expect(() => {
        httpAdapter.validateMove(move, boardSize);
      }).not.toThrow();
    });

    test('debería lanzar error para movimiento fuera de rango', () => {
      const move = 9;
      const boardSize = 3;

      expect(() => {
        httpAdapter.validateMove(move, boardSize);
      }).toThrow('Movimiento fuera de rango');
    });

    test('debería lanzar error para movimiento negativo', () => {
      const move = -1;
      const boardSize = 3;

      expect(() => {
        httpAdapter.validateMove(move, boardSize);
      }).toThrow('Movimiento fuera de rango');
    });

    test('debería validar movimiento para tablero 5x5', () => {
      const move = 24;
      const boardSize = 5;

      expect(() => {
        httpAdapter.validateMove(move, boardSize);
      }).not.toThrow();
    });

    test('debería lanzar error para movimiento fuera de rango en tablero 5x5', () => {
      const move = 25;
      const boardSize = 5;

      expect(() => {
        httpAdapter.validateMove(move, boardSize);
      }).toThrow('Movimiento fuera de rango');
    });
  });

  describe('handleError', () => {
    test('debería manejar error de axios', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };

      expect(() => {
        httpAdapter.handleError(error);
      }).toThrow('Error del servidor del jugador: 500 - Internal server error');
    });

    test('debería manejar error de red', () => {
      const error = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      };

      expect(() => {
        httpAdapter.handleError(error);
      }).toThrow('No fue posible contactar al jugador: Connection refused');
    });

    test('debería manejar error de timeout', () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      };

      expect(() => {
        httpAdapter.handleError(error);
      }).toThrow(
        'El jugador tardó demasiado en responder: timeout of 5000ms exceeded'
      );
    });

    test('debería manejar error desconocido', () => {
      const error = new Error('Unknown error');

      expect(() => {
        httpAdapter.handleError(error);
      }).toThrow('Error desconocido: Unknown error');
    });
  });

  describe('Dependency Integration', () => {
    test('debería usar logger para mensajes de información', () => {
      expect(httpAdapter.logger).toBe(mockLogger);
      expect(typeof httpAdapter.logger.info).toBe('function');
    });

    test('debería usar logger para mensajes de error', () => {
      expect(httpAdapter.logger).toBe(mockLogger);
      expect(typeof httpAdapter.logger.error).toBe('function');
    });
  });

  describe('Class Method Delegation', () => {
    test('debería delegar buildUrl a función pura', () => {
      const player = { name: 'Player1', port: 3001 };
      const endpoint = '/move';

      const result = httpAdapter.buildUrl(player, endpoint);

      expect(result).toBe('http://localhost:3001/move');
    });

    test('debería delegar buildRequestData a función pura', () => {
      const board = ['X', 'O', '', '', '', '', '', '', ''];
      const symbol = 'X';
      const options = { timeoutMs: 5000 };

      const result = httpAdapter.buildRequestData(board, symbol, options);

      expect(result).toEqual({
        board: board,
        symbol: symbol,
        timeout: 5000,
      });
    });

    test('debería delegar parseMoveResponse a función pura', () => {
      const response = { data: { move: 5 } };

      const result = httpAdapter.parseMoveResponse(response);

      expect(result).toBe(5);
    });

    test('debería delegar validateMove a función pura', () => {
      expect(() => {
        httpAdapter.validateMove(5, 3);
      }).not.toThrow();
    });

    test('debería delegar handleError a función pura', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };

      expect(() => {
        httpAdapter.handleError(error);
      }).toThrow('Error del servidor del jugador: 500 - Internal server error');
    });
  });
});

describe('Pruebas Unitarias de Funciones Puras', () => {
  describe('buildUrl', () => {
    test('debería construir URL con valores por defecto', () => {
      const player = { name: 'Player1', port: 3001 };
      const endpoint = '/move';

      const url = buildUrl(player, endpoint);

      expect(url).toBe('http://localhost:3001/move');
    });

    test('debería construir URL con protocolo y host personalizados', () => {
      const player = {
        name: 'Player1',
        port: 3001,
        protocol: 'https',
        host: '192.168.1.100',
      };
      const endpoint = '/api/move';

      const url = buildUrl(player, endpoint);

      expect(url).toBe('https://192.168.1.100:3001/api/move');
    });
  });

  describe('buildRequestData', () => {
    test('debería construir datos de solicitud con timeout por defecto', () => {
      const board = ['X', 'O', '', '', '', '', '', '', ''];
      const symbol = 'X';

      const data = buildRequestData(board, symbol);

      expect(data).toEqual({
        board: board,
        symbol: symbol,
        timeout: 30000,
      });
    });

    test('debería construir datos de solicitud con timeout personalizado', () => {
      const board = ['X', 'O', '', '', '', '', '', '', ''];
      const symbol = 'X';
      const options = { timeoutMs: 5000 };

      const data = buildRequestData(board, symbol, options);

      expect(data).toEqual({
        board: board,
        symbol: symbol,
        timeout: 5000,
      });
    });
  });

  describe('parseMoveResponse', () => {
    test('debería parsear movimiento desde campo move', () => {
      const response = { data: { move: 5 } };

      const move = parseMoveResponse(response);

      expect(move).toBe(5);
    });

    test('debería parsear movimiento desde campo movimiento', () => {
      const response = { data: { movimiento: 3 } };

      const move = parseMoveResponse(response);

      expect(move).toBe(3);
    });

    test('debería parsear movimiento desde campo data.move anidado', () => {
      const response = { data: { data: { move: 7 } } };

      const move = parseMoveResponse(response);

      expect(move).toBe(7);
    });

    test('debería parsear movimiento desde campo data.movimiento anidado', () => {
      const response = { data: { data: { movimiento: 1 } } };

      const move = parseMoveResponse(response);

      expect(move).toBe(1);
    });

    test('debería convertir movimientos string a números', () => {
      const response = { data: { move: '4' } };

      const move = parseMoveResponse(response);

      expect(move).toBe(4);
      expect(typeof move).toBe('number');
    });

    test('debería lanzar error para respuesta inválida', () => {
      const response = { data: {} };

      expect(() => {
        parseMoveResponse(response);
      }).toThrow('Respuesta inválida del jugador');
    });

    test('debería lanzar error para datos faltantes', () => {
      const response = {};

      expect(() => {
        parseMoveResponse(response);
      }).toThrow('Respuesta inválida del jugador');
    });

    test('debería lanzar error para movimiento no numérico', () => {
      const response = { data: { move: 'invalid' } };

      expect(() => {
        parseMoveResponse(response);
      }).toThrow('El movimiento debe ser un número');
    });
  });

  describe('validateMove', () => {
    test('debería validar movimiento válido', () => {
      expect(() => {
        validateMove(5, 3);
      }).not.toThrow();
    });

    test('debería lanzar error para movimiento fuera de rango', () => {
      expect(() => {
        validateMove(9, 3);
      }).toThrow('Movimiento fuera de rango');
    });

    test('debería lanzar error para movimiento negativo', () => {
      expect(() => {
        validateMove(-1, 3);
      }).toThrow('Movimiento fuera de rango');
    });

    test('debería validar movimiento para tablero 5x5', () => {
      expect(() => {
        validateMove(24, 5);
      }).not.toThrow();
    });

    test('debería lanzar error para movimiento fuera de rango en tablero 5x5', () => {
      expect(() => {
        validateMove(25, 5);
      }).toThrow('Movimiento fuera de rango');
    });
  });

  describe('handleError', () => {
    test('debería manejar error de axios', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };

      expect(() => {
        handleError(error);
      }).toThrow('Error del servidor del jugador: 500 - Internal server error');
    });

    test('debería manejar error de red', () => {
      const error = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      };

      expect(() => {
        handleError(error);
      }).toThrow('No fue posible contactar al jugador: Connection refused');
    });

    test('debería manejar error de timeout', () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      };

      expect(() => {
        handleError(error);
      }).toThrow(
        'El jugador tardó demasiado en responder: timeout of 5000ms exceeded'
      );
    });

    test('debería manejar error desconocido', () => {
      const error = new Error('Unknown error');

      expect(() => {
        handleError(error);
      }).toThrow('Error desconocido: Unknown error');
    });
  });

  describe('extractMoveFromResponse', () => {
    test('debería extraer movimiento desde campo move', () => {
      const responseData = { move: 5 };

      const result = extractMoveFromResponse(responseData);

      expect(result).toEqual({ move: 5 });
    });

    test('debería extraer movimiento desde campo movimiento', () => {
      const responseData = { movimiento: 3 };

      const result = extractMoveFromResponse(responseData);

      expect(result).toEqual({ move: 3 });
    });

    test('debería extraer movimiento desde campo data.move anidado', () => {
      const responseData = { data: { move: 7 } };

      const result = extractMoveFromResponse(responseData);

      expect(result).toEqual({ move: 7 });
    });

    test('debería extraer movimiento desde campo data.movimiento anidado', () => {
      const responseData = { data: { movimiento: 1 } };

      const result = extractMoveFromResponse(responseData);

      expect(result).toEqual({ move: 1 });
    });

    test('debería convertir movimientos string a números', () => {
      const responseData = { move: '4' };

      const result = extractMoveFromResponse(responseData);

      expect(result).toEqual({ move: 4 });
    });

    test('debería retornar error para movimiento faltante', () => {
      const responseData = {};

      const result = extractMoveFromResponse(responseData);

      expect(result).toEqual({ error: 'No fue posible contactar al jugador.' });
    });

    test('debería retornar error para movimiento inválido', () => {
      const responseData = { move: 'invalid' };

      const result = extractMoveFromResponse(responseData);

      expect(result).toEqual({
        error: 'Movimiento inválido recibido del jugador',
      });
    });
  });

  describe('handleRequestError', () => {
    test('debería manejar error de timeout', () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      };

      const result = handleRequestError(error);

      expect(result).toEqual({ error: 'Tiempo de espera agotado' });
    });

    test('debería manejar respuesta de error HTTP', () => {
      const error = {
        response: { status: 500 },
      };

      const result = handleRequestError(error);

      expect(result).toEqual({ error: 'Respuesta 500' });
    });

    test('should handle connection refused error', () => {
      const error = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      };

      const result = handleRequestError(error);

      expect(result).toEqual({ error: 'No fue posible contactar al jugador.' });
    });

    test('debería manejar error desconocido', () => {
      const error = new Error('Unknown error');

      const result = handleRequestError(error);

      expect(result).toEqual({ error: 'No fue posible contactar al jugador.' });
    });
  });

  describe('createHttpAdapter', () => {
    test('debería crear instancia de HttpAdapter', () => {
      const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
      };

      const adapter = createHttpAdapter({ logger: mockLogger });

      expect(adapter).toBeInstanceOf(HttpAdapter);
      expect(adapter.logger).toBe(mockLogger);
    });

    test('debería lanzar error si logger falta', () => {
      expect(() => {
        createHttpAdapter({});
      }).toThrow('logger es requerido');
    });
  });
});
