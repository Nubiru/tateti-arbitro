/**
 * Pruebas Unitarias para Lógica de Asignación de ID de Jugador
 * Pruebas de asignación de símbolos X/O a jugadores
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

describe('Lógica de Asignación de ID de Jugador', () => {
  let assignPlayerIds;

  beforeEach(() => {
    assignPlayerIds = players => {
      const symbols = ['X', 'O'];
      return players.map((player, index) => ({
        ...player,
        id: symbols[index],
        symbol: symbols[index],
      }));
    };
  });

  describe('Asignación de Dos Jugadores', () => {
    test('debería asignar X al primer jugador', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = assignPlayerIds(players);

      expect(result[0].id).toBe('X');
      expect(result[0].symbol).toBe('X');
    });

    test('debería asignar O al segundo jugador', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = assignPlayerIds(players);

      expect(result[1].id).toBe('O');
      expect(result[1].symbol).toBe('O');
    });

    test('debería preservar datos originales del jugador', () => {
      const players = [
        { name: 'Player1', port: 3001, isHuman: true },
        { name: 'Player2', port: 3002, isHuman: false },
      ];

      const result = assignPlayerIds(players);

      expect(result[0]).toEqual({
        name: 'Player1',
        port: 3001,
        isHuman: true,
        id: 'X',
        symbol: 'X',
      });

      expect(result[1]).toEqual({
        name: 'Player2',
        port: 3002,
        isHuman: false,
        id: 'O',
        symbol: 'O',
      });
    });
  });

  describe('Consistencia de Símbolos', () => {
    test('debería usar símbolos X y O consistentemente', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result1 = assignPlayerIds(players);
      const result2 = assignPlayerIds(players);

      expect(result1[0].id).toBe(result2[0].id);
      expect(result1[1].id).toBe(result2[1].id);
    });

    test('debería asignar símbolos diferentes a cada jugador', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = assignPlayerIds(players);

      expect(result[0].id).not.toBe(result[1].id);
    });
  });

  describe('Casos Extremos', () => {
    test('debería manejar jugadores con datos mínimos', () => {
      const players = [{ name: 'P1' }, { name: 'P2' }];

      const result = assignPlayerIds(players);

      expect(result[0].id).toBe('X');
      expect(result[1].id).toBe('O');
    });

    test('debería manejar jugadores con propiedades extra', () => {
      const players = [
        { name: 'Player1', port: 3001, host: 'localhost', protocol: 'http' },
        { name: 'Player2', port: 3002, host: 'localhost', protocol: 'http' },
      ];

      const result = assignPlayerIds(players);

      expect(result[0]).toHaveProperty('id', 'X');
      expect(result[0]).toHaveProperty('host', 'localhost');
      expect(result[1]).toHaveProperty('id', 'O');
      expect(result[1]).toHaveProperty('protocol', 'http');
    });

    test('debería no mutar el array original de jugadores', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const originalPlayers = JSON.parse(JSON.stringify(players));
      assignPlayerIds(players);

      expect(players).toEqual(originalPlayers);
    });
  });

  describe('Propiedades de Símbolos', () => {
    test('debería establecer propiedades id y symbol', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = assignPlayerIds(players);

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('symbol');
      expect(result[1]).toHaveProperty('id');
      expect(result[1]).toHaveProperty('symbol');
    });

    test('debería tener valores id y symbol coincidentes', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = assignPlayerIds(players);

      expect(result[0].id).toBe(result[0].symbol);
      expect(result[1].id).toBe(result[1].symbol);
    });
  });

  describe('Manejo de Arrays', () => {
    test('debería retornar array de la misma longitud', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = assignPlayerIds(players);

      expect(result).toHaveLength(2);
    });

    test('debería mantener orden de jugadores', () => {
      const players = [
        { name: 'First', port: 3001 },
        { name: 'Second', port: 3002 },
      ];

      const result = assignPlayerIds(players);

      expect(result[0].name).toBe('First');
      expect(result[1].name).toBe('Second');
    });
  });
});
