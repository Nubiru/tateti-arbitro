/**
 * Unit Tests for Player ID Assignment Logic
 * Tests X/O symbol assignment to players
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

describe('Player ID Assignment Logic', () => {
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

  describe('Two Player Assignment', () => {
    test('should assign X to first player', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = assignPlayerIds(players);

      expect(result[0].id).toBe('X');
      expect(result[0].symbol).toBe('X');
    });

    test('should assign O to second player', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = assignPlayerIds(players);

      expect(result[1].id).toBe('O');
      expect(result[1].symbol).toBe('O');
    });

    test('should preserve original player data', () => {
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

  describe('Symbol Consistency', () => {
    test('should use X and O symbols consistently', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result1 = assignPlayerIds(players);
      const result2 = assignPlayerIds(players);

      expect(result1[0].id).toBe(result2[0].id);
      expect(result1[1].id).toBe(result2[1].id);
    });

    test('should assign different symbols to each player', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = assignPlayerIds(players);

      expect(result[0].id).not.toBe(result[1].id);
    });
  });

  describe('Edge Cases', () => {
    test('should handle players with minimal data', () => {
      const players = [{ name: 'P1' }, { name: 'P2' }];

      const result = assignPlayerIds(players);

      expect(result[0].id).toBe('X');
      expect(result[1].id).toBe('O');
    });

    test('should handle players with extra properties', () => {
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

    test('should not mutate original players array', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const originalPlayers = JSON.parse(JSON.stringify(players));
      assignPlayerIds(players);

      expect(players).toEqual(originalPlayers);
    });
  });

  describe('Symbol Properties', () => {
    test('should set both id and symbol properties', () => {
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

    test('should have matching id and symbol values', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = assignPlayerIds(players);

      expect(result[0].id).toBe(result[0].symbol);
      expect(result[1].id).toBe(result[1].symbol);
    });
  });

  describe('Array Handling', () => {
    test('should return array of same length', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = assignPlayerIds(players);

      expect(result).toHaveLength(2);
    });

    test('should maintain player order', () => {
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
