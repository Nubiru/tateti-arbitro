/**
 * Pruebas Unitarias para Reglas del Modo Infinito
 * Pruebas de funciones puras para mecánica de ventana deslizante
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import {
  INFINITY_THRESHOLD,
  shouldRemoveOldestMove,
  getRemovalPosition,
  getRemovalPlayer,
} from '../../../../src/domain/game/rules/infinity.js';

describe('Reglas del Modo Infinito - Pruebas Unitarias', () => {
  describe('constante INFINITY_THRESHOLD', () => {
    test('debería ser 6 (cada jugador máximo 3 marcas)', () => {
      expect(INFINITY_THRESHOLD).toBe(6);
    });
  });

  describe('shouldRemoveOldestMove()', () => {
    test('debería retornar false para historial de movimientos vacío', () => {
      expect(shouldRemoveOldestMove([])).toBe(false);
    });

    test('debería retornar false para longitud de historial de movimientos < 6', () => {
      const history1 = [{ move: 0 }];
      const history2 = [{ move: 0 }, { move: 1 }];
      const history3 = [{ move: 0 }, { move: 1 }, { move: 2 }];
      const history4 = [{ move: 0 }, { move: 1 }, { move: 2 }, { move: 3 }];
      const history5 = [
        { move: 0 },
        { move: 1 },
        { move: 2 },
        { move: 3 },
        { move: 4 },
      ];

      expect(shouldRemoveOldestMove(history1)).toBe(false);
      expect(shouldRemoveOldestMove(history2)).toBe(false);
      expect(shouldRemoveOldestMove(history3)).toBe(false);
      expect(shouldRemoveOldestMove(history4)).toBe(false);
      expect(shouldRemoveOldestMove(history5)).toBe(false);
    });

    test('debería retornar true para longitud de historial de movimientos >= 6', () => {
      const history6 = [
        { move: 0 },
        { move: 1 },
        { move: 2 },
        { move: 3 },
        { move: 4 },
        { move: 5 },
      ];
      const history7 = [
        { move: 0 },
        { move: 1 },
        { move: 2 },
        { move: 3 },
        { move: 4 },
        { move: 5 },
        { move: 6 },
      ];
      const history10 = Array.from({ length: 10 }, (_, i) => ({ move: i }));

      expect(shouldRemoveOldestMove(history6)).toBe(true);
      expect(shouldRemoveOldestMove(history7)).toBe(true);
      expect(shouldRemoveOldestMove(history10)).toBe(true);
    });

    test('debería manejar entrada null o undefined de forma elegante', () => {
      expect(shouldRemoveOldestMove(null)).toBe(false);
      expect(shouldRemoveOldestMove(undefined)).toBe(false);
    });
  });

  describe('getRemovalPosition()', () => {
    test('debería retornar null para historial de movimientos vacío', () => {
      expect(getRemovalPosition([])).toBeNull();
    });

    test('debería retornar null para longitud de historial de movimientos < 6', () => {
      const history = [
        { move: 0 },
        { move: 1 },
        { move: 2 },
        { move: 3 },
        { move: 4 },
      ];
      expect(getRemovalPosition(history)).toBeNull();
    });

    test('debería retornar posición del movimiento más antiguo para longitud de historial >= 6', () => {
      const history = [
        { move: 4 },
        { move: 2 },
        { move: 7 },
        { move: 1 },
        { move: 8 },
        { move: 3 },
      ];
      expect(getRemovalPosition(history)).toBe(4); // Primer movimiento en el historial
    });

    test('debería retornar posición correcta incluso con muchos movimientos', () => {
      const history = [
        { move: 0 },
        { move: 1 },
        { move: 2 },
        { move: 3 },
        { move: 4 },
        { move: 5 },
        { move: 6 },
        { move: 7 },
        { move: 8 },
      ];
      expect(getRemovalPosition(history)).toBe(0); // Movimiento más antiguo
    });

    test('debería manejar entrada null o undefined de forma elegante', () => {
      expect(getRemovalPosition(null)).toBeNull();
      expect(getRemovalPosition(undefined)).toBeNull();
    });

    test('debería manejar formato de historial de movimientos inválido', () => {
      const invalidHistory = [
        {},
        { move: 1 },
        { move: 2 },
        { move: 3 },
        { move: 4 },
        { move: 5 },
      ];
      expect(getRemovalPosition(invalidHistory)).toBeNull();
    });
  });

  describe('getRemovalPlayer()', () => {
    const players = [
      { id: 'X', name: 'Player1' },
      { id: 'O', name: 'Player2' },
    ];

    test('debería retornar null para historial de movimientos vacío', () => {
      expect(getRemovalPlayer([], players)).toBeNull();
    });

    test('debería retornar null para longitud de historial de movimientos < 6', () => {
      const history = [
        { move: 0, playerId: 'X' },
        { move: 1, playerId: 'O' },
        { move: 2, playerId: 'X' },
        { move: 3, playerId: 'O' },
        { move: 4, playerId: 'X' },
      ];
      expect(getRemovalPlayer(history, players)).toBeNull();
    });

    test('debería retornar jugador correcto para Player1 (X)', () => {
      const history = [
        { move: 0, playerId: 'X' },
        { move: 1, playerId: 'O' },
        { move: 2, playerId: 'X' },
        { move: 3, playerId: 'O' },
        { move: 4, playerId: 'X' },
        { move: 5, playerId: 'O' },
      ];
      const result = getRemovalPlayer(history, players);
      expect(result).toEqual({ id: 'X', name: 'Player1' });
    });

    test('debería retornar jugador correcto para Player2 (O)', () => {
      const history = [
        { move: 0, playerId: 'O' },
        { move: 1, playerId: 'X' },
        { move: 2, playerId: 'O' },
        { move: 3, playerId: 'X' },
        { move: 4, playerId: 'O' },
        { move: 5, playerId: 'X' },
      ];
      const result = getRemovalPlayer(history, players);
      expect(result).toEqual({ id: 'O', name: 'Player2' });
    });

    test('debería manejar entrada de historial null o undefined', () => {
      expect(getRemovalPlayer(null, players)).toBeNull();
      expect(getRemovalPlayer(undefined, players)).toBeNull();
    });

    test('debería manejar entrada de jugadores null o undefined', () => {
      const history = [
        { move: 0, playerId: 'X' },
        { move: 1, playerId: 'O' },
        { move: 2, playerId: 'X' },
        { move: 3, playerId: 'O' },
        { move: 4, playerId: 'X' },
        { move: 5, playerId: 'O' },
      ];
      expect(getRemovalPlayer(history, null)).toBeNull();
      expect(getRemovalPlayer(history, undefined)).toBeNull();
    });

    test('debería manejar array de jugadores inválido', () => {
      const history = [
        { move: 0, playerId: 'X' },
        { move: 1, playerId: 'O' },
        { move: 2, playerId: 'X' },
        { move: 3, playerId: 'O' },
        { move: 4, playerId: 'X' },
        { move: 5, playerId: 'O' },
      ];
      expect(getRemovalPlayer(history, [])).toBeNull();
      expect(getRemovalPlayer(history, [players[0]])).toBeNull(); // Solo 1 jugador
    });

    test('debería manejar formato de historial de movimientos inválido', () => {
      const invalidHistory = [
        {},
        { move: 1, playerId: 'O' },
        { move: 2, playerId: 'X' },
        { move: 3, playerId: 'O' },
        { move: 4, playerId: 'X' },
        { move: 5, playerId: 'O' },
      ];
      expect(getRemovalPlayer(invalidHistory, players)).toBeNull();
    });
  });
});
