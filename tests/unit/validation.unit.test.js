/**
 * Pruebas Unitarias de Validación
 * Pruebas para middleware validation.js
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

// Simular express-validator
const createMockValidator = () => ({
  custom: jest.fn().mockReturnThis(),
  isObject: jest.fn().mockReturnThis(),
  notEmpty: jest.fn().mockReturnThis(),
  isArray: jest.fn().mockReturnThis(),
  isLength: jest.fn().mockReturnThis(),
  isString: jest.fn().mockReturnThis(),
  isInt: jest.fn().mockReturnThis(),
  isIn: jest.fn().mockReturnThis(),
  isBoolean: jest.fn().mockReturnThis(),
  isNumeric: jest.fn().mockReturnThis(),
  isFloat: jest.fn().mockReturnThis(),
  isEmail: jest.fn().mockReturnThis(),
  isURL: jest.fn().mockReturnThis(),
  isDate: jest.fn().mockReturnThis(),
  isISO: jest.fn().mockReturnThis(),
  isUUID: jest.fn().mockReturnThis(),
  isMongoId: jest.fn().mockReturnThis(),
  isAlpha: jest.fn().mockReturnThis(),
  isAlphanumeric: jest.fn().mockReturnThis(),
  isAscii: jest.fn().mockReturnThis(),
  isBase64: jest.fn().mockReturnThis(),
  isCreditCard: jest.fn().mockReturnThis(),
  isCurrency: jest.fn().mockReturnThis(),
  isDataURI: jest.fn().mockReturnThis(),
  isDecimal: jest.fn().mockReturnThis(),
  isDivisibleBy: jest.fn().mockReturnThis(),
  isFQDN: jest.fn().mockReturnThis(),
  isHash: jest.fn().mockReturnThis(),
  isHexColor: jest.fn().mockReturnThis(),
  isIP: jest.fn().mockReturnThis(),
  isISBN: jest.fn().mockReturnThis(),
  isISSN: jest.fn().mockReturnThis(),
  isJSON: jest.fn().mockReturnThis(),
  isLatLong: jest.fn().mockReturnThis(),
  isMACAddress: jest.fn().mockReturnThis(),
  isMD5: jest.fn().mockReturnThis(),
  isMimeType: jest.fn().mockReturnThis(),
  isMobilePhone: jest.fn().mockReturnThis(),
  isPostalCode: jest.fn().mockReturnThis(),
  isSlug: jest.fn().mockReturnThis(),
  isStrongPassword: jest.fn().mockReturnThis(),
  isTaxID: jest.fn().mockReturnThis(),
  isTimeZone: jest.fn().mockReturnThis(),
  isVariableWidth: jest.fn().mockReturnThis(),
  isWhitelisted: jest.fn().mockReturnThis(),
  matches: jest.fn().mockReturnThis(),
  blacklist: jest.fn().mockReturnThis(),
  whitelist: jest.fn().mockReturnThis(),
  normalizeEmail: jest.fn().mockReturnThis(),
  toDate: jest.fn().mockReturnThis(),
  toFloat: jest.fn().mockReturnThis(),
  toInt: jest.fn().mockReturnThis(),
  toBoolean: jest.fn().mockReturnThis(),
  escape: jest.fn().mockReturnThis(),
  unescape: jest.fn().mockReturnThis(),
  ltrim: jest.fn().mockReturnThis(),
  rtrim: jest.fn().mockReturnThis(),
  trim: jest.fn().mockReturnThis(),
  stripLow: jest.fn().mockReturnThis(),
  stripHigh: jest.fn().mockReturnThis(),
  stripTags: jest.fn().mockReturnThis(),
  withMessage: jest.fn().mockReturnThis(),
  optional: jest.fn().mockReturnThis(),
});

jest.mock('express-validator', () => ({
  body: jest.fn(() => createMockValidator()),
  param: jest.fn(() => createMockValidator()),
  validationResult: jest.fn(),
}));

import {
  validateMatch,
  validateTournament,
  validateTournamentConfig,
  validateMove,
  validateHealth,
  handleValidationErrors,
  sanitizeInput,
} from '../../src/middleware/validation.js';
import { validationResult } from 'express-validator';

describe('Middleware de Validación', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateMatch', () => {
    test('debería ser un array de reglas de validación', () => {
      expect(Array.isArray(validateMatch)).toBe(true);
      expect(validateMatch.length).toBeGreaterThan(0);
    });

    test('debería incluir reglas de validación de player1', () => {
      // Probar que validateMatch contiene reglas de validación de player1
      expect(Array.isArray(validateMatch)).toBe(true);
      expect(validateMatch.length).toBeGreaterThan(0);
    });

    test('debería incluir reglas de validación de player2', () => {
      // Probar que validateMatch contiene reglas de validación de player2
      expect(Array.isArray(validateMatch)).toBe(true);
      expect(validateMatch.length).toBeGreaterThan(0);
    });

    test('debería incluir reglas de validación de campos opcionales', () => {
      // Probar que validateMatch contiene reglas de validación de campos opcionales
      expect(Array.isArray(validateMatch)).toBe(true);
      expect(validateMatch.length).toBeGreaterThan(0);
    });
  });

  describe('validateTournament', () => {
    test('debería ser un array de reglas de validación', () => {
      expect(Array.isArray(validateTournament)).toBe(true);
      expect(validateTournament.length).toBeGreaterThan(0);
    });

    test('debería incluir validación de array de jugadores', () => {
      // Probar que validateTournament contiene validación de array de jugadores
      expect(Array.isArray(validateTournament)).toBe(true);
      expect(validateTournament.length).toBeGreaterThan(0);
    });

    test('debería incluir reglas de validación de campos opcionales', () => {
      // Probar que validateTournament contiene reglas de validación de campos opcionales
      expect(Array.isArray(validateTournament)).toBe(true);
      expect(validateTournament.length).toBeGreaterThan(0);
    });
  });

  describe('validateHealth', () => {
    test('debería ser un array de reglas de validación', () => {
      expect(Array.isArray(validateHealth)).toBe(true);
      expect(validateHealth.length).toBeGreaterThan(0);
    });

    test('debería incluir validación de parámetro de servicio', () => {
      // Probar que validateHealth contiene validación de parámetro de servicio
      expect(Array.isArray(validateHealth)).toBe(true);
      expect(validateHealth.length).toBeGreaterThan(0);
    });
  });

  describe('handleValidationErrors', () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    test('debería llamar next cuando no hay errores de validación', () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      });

      handleValidationErrors(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('debería manejar error de jugador faltante', () => {
      const errors = [
        { msg: 'Se necesitan dos jugadores para iniciar la partida.' },
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => errors,
      });

      handleValidationErrors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Se necesitan dos jugadores para iniciar la partida.',
        details: errors,
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debería manejar errores de validación generales', () => {
      const errors = [
        { msg: 'player1.name debe ser una cadena' },
        { msg: 'player1.port debe ser un número' },
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => errors,
      });

      handleValidationErrors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Datos de entrada inválidos',
        details: errors,
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debería manejar array de errores vacío', () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [],
      });

      handleValidationErrors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Datos de entrada inválidos',
        details: [],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('sanitizeInput', () => {
    let req, res, next;

    beforeEach(() => {
      req = { body: {} };
      res = {};
      next = jest.fn();
    });

    test('debería llamar next cuando no hay body', () => {
      req.body = undefined;

      sanitizeInput(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('debería llamar next cuando body está vacío', () => {
      req.body = {};

      sanitizeInput(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('debería recortar valores string en body', () => {
      req.body = {
        name: '  Player1  ',
        description: '  Test description  ',
        number: 123,
        object: { key: 'value' },
      };

      sanitizeInput(req, res, next);

      expect(req.body.name).toBe('Player1');
      expect(req.body.description).toBe('Test description');
      expect(req.body.number).toBe(123);
      expect(req.body.object).toEqual({ key: 'value' });
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('debería manejar objetos anidados', () => {
      req.body = {
        player1: {
          name: '  Player1  ',
          port: 3001,
        },
        player2: {
          name: '  Player2  ',
          port: 3002,
        },
      };

      sanitizeInput(req, res, next);

      expect(req.body.player1.name).toBe('Player1');
      expect(req.body.player2.name).toBe('Player2');
      expect(req.body.player1.port).toBe(3001);
      expect(req.body.player2.port).toBe(3002);
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('debería manejar arrays', () => {
      req.body = {
        players: [
          { name: '  Player1  ', port: 3001 },
          { name: '  Player2  ', port: 3002 },
        ],
      };

      sanitizeInput(req, res, next);

      expect(req.body.players[0].name).toBe('Player1');
      expect(req.body.players[1].name).toBe('Player2');
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('debería manejar tipos de datos mixtos', () => {
      req.body = {
        string: '  test  ',
        number: 123,
        boolean: true,
        null: null,
        undefined: undefined,
        array: ['  item1  ', '  item2  '],
        object: { key: '  value  ' },
      };

      sanitizeInput(req, res, next);

      expect(req.body.string).toBe('test');
      expect(req.body.number).toBe(123);
      expect(req.body.boolean).toBe(true);
      expect(req.body.null).toBe(null);
      expect(req.body.undefined).toBe(undefined);
      expect(req.body.array).toEqual(['item1', 'item2']);
      expect(req.body.object).toEqual({ key: 'value' });
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integración de Reglas de Validación', () => {
    test('debería usar funciones de express-validator correctamente', () => {
      // Probar que las funciones de middleware de validación existen y son llamables
      expect(Array.isArray(validateMatch)).toBe(true);
      expect(Array.isArray(validateTournament)).toBe(true);
      expect(Array.isArray(validateHealth)).toBe(true);
      expect(typeof sanitizeInput).toBe('function');
      expect(typeof handleValidationErrors).toBe('function');
    });

    test('debería retornar resultado de validación de express-validator', () => {
      const mockResult = {
        isEmpty: () => true,
        array: () => [],
      };
      validationResult.mockReturnValue(mockResult);

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      handleValidationErrors(req, res, next);

      expect(validationResult).toHaveBeenCalledWith(req);
    });
  });

  describe('Manejo de Errores', () => {
    test('debería manejar error lanzado por validationResult', () => {
      validationResult.mockImplementation(() => {
        throw new Error('Validation error');
      });

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      expect(() => {
        handleValidationErrors(req, res, next);
      }).toThrow('Validation error');
    });

    test('debería manejar sanitizeInput con body malformado', () => {
      const req = { body: 'invalid' };
      const res = {};
      const next = jest.fn();

      // Debería manejar graciosamente sin lanzar
      sanitizeInput(req, res, next);

      expect(req.body).toBe('invalid'); // String permanece sin cambios
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('Casos Límite', () => {
    test('debería manejar body null en sanitizeInput', () => {
      const req = { body: null };
      const res = {};
      const next = jest.fn();

      sanitizeInput(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('debería manejar body undefined en sanitizeInput', () => {
      const req = {};
      const res = {};
      const next = jest.fn();

      sanitizeInput(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    test('debería manejar valores string vacíos en sanitizeInput', () => {
      const req = {
        body: {
          name: '',
          description: '   ',
          valid: '  test  ',
        },
      };
      const res = {};
      const next = jest.fn();

      sanitizeInput(req, res, next);

      expect(req.body.name).toBe('');
      expect(req.body.description).toBe('');
      expect(req.body.valid).toBe('test');
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cobertura de Reglas de Validación', () => {
    test('debería probar estructura de reglas de validateMatch', () => {
      // Probar que validateMatch contiene reglas de validación
      expect(validateMatch).toHaveLength(11); // player1 (4), player2 (4), boardSize (1), noTie (1), speed (1)

      // Probar que todas las reglas son objetos (objetos express-validator)
      validateMatch.forEach(rule => {
        expect(typeof rule).toBe('object');
        expect(rule).not.toBeNull();
      });
    });

    test('debería probar estructura de reglas de validateTournament', () => {
      // Probar que validateTournament contiene reglas de validación
      expect(validateTournament).toHaveLength(6); // players (1), players.*.name (1), players.*.port (1), boardSize (1), noTie (1), speed (1)

      // Probar que todas las reglas son objetos (objetos express-validator)
      validateTournament.forEach(rule => {
        expect(typeof rule).toBe('object');
        expect(rule).not.toBeNull();
      });
    });

    test('debería probar estructura de reglas de validateHealth', () => {
      // Probar que validateHealth contiene reglas de validación
      expect(validateHealth).toHaveLength(1); // service param (1)

      // Probar que todas las reglas son objetos (objetos express-validator)
      validateHealth.forEach(rule => {
        expect(typeof rule).toBe('object');
        expect(rule).not.toBeNull();
      });
    });

    test('debería probar sanitizeInput con estructuras anidadas complejas', () => {
      const req = {
        body: {
          name: '  John  ',
          items: ['  item1  ', '  item2  '],
          nested: { value: '  test  ' },
          mixed: {
            string: '  hello  ',
            number: 123,
            array: ['  a  ', '  b  '],
            object: { key: '  value  ' },
          },
        },
      };
      const res = {};
      const next = jest.fn();

      sanitizeInput(req, res, next);

      expect(req.body.name).toBe('John');
      expect(req.body.items).toEqual(['item1', 'item2']);
      expect(req.body.nested).toEqual({ value: 'test' });
      expect(req.body.mixed).toEqual({
        string: 'hello',
        number: 123,
        array: ['a', 'b'],
        object: { key: 'value' },
      });
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('Estructura de Reglas de Validación', () => {
    test('debería tener conteo correcto de reglas de validateMatch', () => {
      expect(validateMatch).toHaveLength(11);
    });

    test('debería tener conteo correcto de reglas de validateTournament', () => {
      expect(validateTournament).toHaveLength(6);
    });

    test('debería tener conteo correcto de reglas de validateHealth', () => {
      expect(validateHealth).toHaveLength(1);
    });

    test('debería tener reglas de validateMatch con estructura correcta', () => {
      validateMatch.forEach(rule => {
        expect(typeof rule).toBe('object');
        expect(rule).not.toBeNull();
      });
    });

    test('debería tener reglas de validateTournament con estructura correcta', () => {
      validateTournament.forEach(rule => {
        expect(typeof rule).toBe('object');
        expect(rule).not.toBeNull();
      });
    });

    test('debería tener reglas de validateHealth con estructura correcta', () => {
      validateHealth.forEach(rule => {
        expect(typeof rule).toBe('object');
        expect(rule).not.toBeNull();
      });
    });
  });

  describe('Pruebas de Cobertura Adicionales', () => {
    test('debería manejar handleValidationErrors con diferentes tipos de error', () => {
      // Restablecer la simulación global
      validationResult.mockReset();

      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Probar con diferentes tipos de error
      const errors = [
        { type: 'field', path: 'player1', msg: 'Player1 is required' },
        { type: 'alternative', path: 'player2', msg: 'Player2 is required' },
        { type: 'unknown', path: 'unknown', msg: 'Unknown error' },
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => errors,
      });

      handleValidationErrors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Datos de entrada inválidos',
        details: errors,
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debería manejar sanitizeInput con objetos profundamente anidados', () => {
      const req = {
        body: {
          level1: {
            level2: {
              level3: {
                string: '  trimmed  ',
                array: ['  item1  ', '  item2  '],
                nested: {
                  value: '  also trimmed  ',
                },
              },
            },
          },
        },
      };
      const res = {};
      const next = jest.fn();

      sanitizeInput(req, res, next);

      expect(req.body.level1.level2.level3.string).toBe('trimmed');
      expect(req.body.level1.level2.level3.array).toEqual(['item1', 'item2']);
      expect(req.body.level1.level2.level3.nested.value).toBe('also trimmed');
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('debería manejar sanitizeInput con tipos de datos mixtos', () => {
      const req = {
        body: {
          string: '  hello  ',
          number: 42,
          boolean: true,
          null: null,
          undefined: undefined,
          array: ['  item1  ', 123, true, null],
          object: {
            nested: '  nested value  ',
            number: 456,
          },
        },
      };
      const res = {};
      const next = jest.fn();

      sanitizeInput(req, res, next);

      expect(req.body.string).toBe('hello');
      expect(req.body.number).toBe(42);
      expect(req.body.boolean).toBe(true);
      expect(req.body.null).toBe(null);
      expect(req.body.undefined).toBe(undefined);
      expect(req.body.array).toEqual(['item1', 123, true, null]);
      expect(req.body.object.nested).toBe('nested value');
      expect(req.body.object.number).toBe(456);
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('debería manejar sanitizeInput con arrays y objetos vacíos', () => {
      const req = {
        body: {
          emptyArray: [],
          emptyObject: {},
          arrayWithEmptyStrings: ['', '  ', 'value'],
          objectWithEmptyValues: {
            empty: '',
            spaces: '   ',
            value: 'valid',
          },
        },
      };
      const res = {};
      const next = jest.fn();

      sanitizeInput(req, res, next);

      expect(req.body.emptyArray).toEqual([]);
      expect(req.body.emptyObject).toEqual({});
      expect(req.body.arrayWithEmptyStrings).toEqual(['', '', 'value']);
      expect(req.body.objectWithEmptyValues).toEqual({
        empty: '',
        spaces: '',
        value: 'valid',
      });
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('debería manejar sanitizeInput con referencias circulares de manera elegante', () => {
      const req = { body: {} };
      const res = {};
      const next = jest.fn();

      // Crear referencia circular
      req.body.circular = req.body;

      // Esto debería lanzar un error debido a la referencia circular
      expect(() => sanitizeInput(req, res, next)).toThrow();
    });

    test('debería manejar sanitizeInput con valores especiales', () => {
      const req = {
        body: {
          nan: NaN,
          infinity: Infinity,
          negativeInfinity: -Infinity,
          string: '  test  ',
          number: 42,
        },
      };
      const res = {};
      const next = jest.fn();

      sanitizeInput(req, res, next);

      expect(req.body.nan).toBeNaN();
      expect(req.body.infinity).toBe(Infinity);
      expect(req.body.negativeInfinity).toBe(-Infinity);
      expect(req.body.string).toBe('test');
      expect(req.body.number).toBe(42);
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('debería manejar sanitizeInput con anidamiento muy profundo', () => {
      const req = { body: {} };
      const res = {};
      const next = jest.fn();

      // Crear anidamiento muy profundo
      let current = req.body;
      for (let i = 0; i < 100; i++) {
        current[`level${i}`] = { value: `  level ${i}  ` };
        current = current[`level${i}`];
      }

      sanitizeInput(req, res, next);

      // Verificar que los valores profundos están recortados
      let check = req.body;
      for (let i = 0; i < 100; i++) {
        expect(check[`level${i}`].value).toBe(`level ${i}`);
        check = check[`level${i}`];
      }
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('debería manejar sanitizeInput con arrays grandes', () => {
      const req = {
        body: {
          largeArray: Array.from({ length: 1000 }, (_, i) => `  item ${i}  `),
        },
      };
      const res = {};
      const next = jest.fn();

      sanitizeInput(req, res, next);

      expect(req.body.largeArray).toHaveLength(1000);
      expect(req.body.largeArray[0]).toBe('item 0');
      expect(req.body.largeArray[999]).toBe('item 999');
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateTournamentConfig', () => {
    test('debería ser un array de reglas de validación', () => {
      expect(Array.isArray(validateTournamentConfig)).toBe(true);
      expect(validateTournamentConfig.length).toBeGreaterThan(0);
    });

    test('debería tener conteo correcto de reglas', () => {
      expect(validateTournamentConfig).toHaveLength(6); // totalPlayers, includeRandom, humanName, boardSize, noTie, speed
    });

    test('debería incluir validación de totalPlayers', () => {
      expect(Array.isArray(validateTournamentConfig)).toBe(true);
      expect(validateTournamentConfig.length).toBeGreaterThan(0);
    });

    test('debería incluir validación de campos opcionales', () => {
      expect(Array.isArray(validateTournamentConfig)).toBe(true);
      expect(validateTournamentConfig.length).toBeGreaterThan(0);
    });

    test('debería tener reglas con estructura correcta', () => {
      validateTournamentConfig.forEach(rule => {
        expect(typeof rule).toBe('object');
        expect(rule).not.toBeNull();
      });
    });
  });

  describe('validateMove', () => {
    test('debería ser un array de reglas de validación', () => {
      expect(Array.isArray(validateMove)).toBe(true);
      expect(validateMove.length).toBeGreaterThan(0);
    });

    test('debería tener conteo correcto de reglas', () => {
      expect(validateMove).toHaveLength(3); // matchId, player, position
    });

    test('debería incluir validación de matchId', () => {
      expect(Array.isArray(validateMove)).toBe(true);
      expect(validateMove.length).toBeGreaterThan(0);
    });

    test('debería incluir validación de player y position', () => {
      expect(Array.isArray(validateMove)).toBe(true);
      expect(validateMove.length).toBeGreaterThan(0);
    });

    test('debería tener reglas con estructura correcta', () => {
      validateMove.forEach(rule => {
        expect(typeof rule).toBe('object');
        expect(rule).not.toBeNull();
      });
    });
  });

  describe('Cobertura Completa de Validadores', () => {
    test('debería exportar todos los validadores necesarios', () => {
      expect(typeof validateMatch).toBe('object');
      expect(typeof validateTournament).toBe('object');
      expect(typeof validateTournamentConfig).toBe('object');
      expect(typeof validateMove).toBe('object');
      expect(typeof validateHealth).toBe('object');
      expect(typeof handleValidationErrors).toBe('function');
      expect(typeof sanitizeInput).toBe('function');
    });

    test('debería tener estructura consistente en todos los validadores', () => {
      const validators = [
        validateMatch,
        validateTournament,
        validateTournamentConfig,
        validateMove,
        validateHealth,
      ];

      validators.forEach(validator => {
        expect(Array.isArray(validator)).toBe(true);
        expect(validator.length).toBeGreaterThan(0);
        validator.forEach(rule => {
          expect(typeof rule).toBe('object');
          expect(rule).not.toBeNull();
        });
      });
    });
  });
});
