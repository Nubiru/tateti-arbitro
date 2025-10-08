/**
 * Pruebas unitarias para funciones puras del Núcleo del Torneo
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import {
  isPowerOfTwo,
  calculateTotalMatches,
  createBracket,
  createBracketWithByes,
  executeRound,
  isTournamentComplete,
  getTournamentWinners,
  shufflePlayers,
  validateTournamentPlayers,
  getRoundInfo,
  calculateProgress,
} from '../../src/domain/game/tournament.core.js';

describe('Pruebas Unitarias del Núcleo del Torneo', () => {
  describe('isPowerOfTwo', () => {
    test('debería retornar true para números potencia de dos', () => {
      expect(isPowerOfTwo(2)).toBe(true);
      expect(isPowerOfTwo(4)).toBe(true);
      expect(isPowerOfTwo(8)).toBe(true);
      expect(isPowerOfTwo(16)).toBe(true);
    });

    test('debería retornar false para números que no son potencia de dos', () => {
      expect(isPowerOfTwo(3)).toBe(false);
      expect(isPowerOfTwo(5)).toBe(false);
      expect(isPowerOfTwo(6)).toBe(false);
      expect(isPowerOfTwo(7)).toBe(false);
    });
  });

  describe('calculateTotalMatches', () => {
    test('debería calcular total de partidas correcto', () => {
      expect(calculateTotalMatches(2)).toBe(1);
      expect(calculateTotalMatches(4)).toBe(3);
      expect(calculateTotalMatches(8)).toBe(7);
      expect(calculateTotalMatches(16)).toBe(15);
    });
  });

  describe('createBracket', () => {
    test('debería crear bracket para 2 jugadores', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
      ];
      const bracket = createBracket(players);

      expect(bracket).toHaveLength(1);
      expect(bracket[0]).toHaveProperty('round', 1);
      expect(bracket[0]).toHaveProperty('matches');
      expect(bracket[0].matches).toHaveLength(1);
      expect(bracket[0].matches[0]).toEqual({
        player1: players[0],
        player2: players[1],
      });
    });

    test('debería crear bracket para 4 jugadores', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
        { name: 'Player 3', port: 3003 },
        { name: 'Player 4', port: 3004 },
      ];
      const bracket = createBracket(players);

      expect(bracket).toHaveLength(2);
      expect(bracket[0].matches).toHaveLength(2);
      expect(bracket[1].matches).toHaveLength(1);
    });

    test('debería crear bracket con BYEs para jugadores que no son potencia de dos', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
        { name: 'Player 3', port: 3003 },
      ];

      const bracket = createBracket(players);
      expect(bracket).toHaveLength(2); // 3 jugadores -> 4 (siguiente potencia de 2) -> 2 rondas
      expect(bracket[0].matches).toHaveLength(2); // Primera ronda tiene 2 partidas
      expect(bracket[1].matches).toHaveLength(1); // Segunda ronda tiene 1 partida

      // Verificar que se agregó BYE
      const firstRound = bracket[0];
      const hasBye = firstRound.matches.some(
        match => match.player1?.isBye || match.player2?.isBye
      );
      expect(hasBye).toBe(true);
    });
  });

  describe('createBracketWithByes', () => {
    test('debería crear bracket con BYEs para 3 jugadores', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
        { name: 'Player 3', port: 3003 },
      ];

      const bracket = createBracketWithByes(players);
      expect(bracket).toHaveLength(2); // 3 jugadores -> 4 (siguiente potencia de 2) -> 2 rondas
      expect(bracket[0].matches).toHaveLength(2); // Primera ronda tiene 2 partidas
      expect(bracket[1].matches).toHaveLength(1); // Segunda ronda tiene 1 partida

      // Verificar que se agregó exactamente un BYE
      const firstRound = bracket[0];
      const byeMatches = firstRound.matches.filter(
        match => match.player1?.isBye || match.player2?.isBye
      );
      expect(byeMatches).toHaveLength(1);
    });

    test('debería crear bracket con BYEs para 5 jugadores', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
        { name: 'Player 3', port: 3003 },
        { name: 'Player 4', port: 3004 },
        { name: 'Player 5', port: 3005 },
      ];

      const bracket = createBracketWithByes(players);
      expect(bracket).toHaveLength(3); // 5 jugadores -> 8 (siguiente potencia de 2) -> 3 rondas
      expect(bracket[0].matches).toHaveLength(4); // Primera ronda tiene 4 partidas
      expect(bracket[1].matches).toHaveLength(2); // Segunda ronda tiene 2 partidas
      expect(bracket[2].matches).toHaveLength(1); // Tercera ronda tiene 1 partida

      // Verificar que se agregaron 3 BYEs (8 - 5 = 3)
      const firstRound = bracket[0];
      const byeCount = firstRound.matches.reduce((count, match) => {
        if (match.player1?.isBye) count++;
        if (match.player2?.isBye) count++;
        return count;
      }, 0);
      expect(byeCount).toBe(3);
    });

    test('debería crear bracket con BYEs para 6 jugadores', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
        { name: 'Player 3', port: 3003 },
        { name: 'Player 4', port: 3004 },
        { name: 'Player 5', port: 3005 },
        { name: 'Player 6', port: 3006 },
      ];

      const bracket = createBracketWithByes(players);
      expect(bracket).toHaveLength(3); // 6 jugadores -> 8 (siguiente potencia de 2) -> 3 rondas
      expect(bracket[0].matches).toHaveLength(4); // Primera ronda tiene 4 partidas

      // Verificar que se agregaron 2 BYEs (8 - 6 = 2)
      const firstRound = bracket[0];
      const byeCount = firstRound.matches.reduce((count, match) => {
        if (match.player1?.isBye) count++;
        if (match.player2?.isBye) count++;
        return count;
      }, 0);
      expect(byeCount).toBe(2);
    });

    test('debería crear bracket con BYEs para 7 jugadores', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
        { name: 'Player 3', port: 3003 },
        { name: 'Player 4', port: 3004 },
        { name: 'Player 5', port: 3005 },
        { name: 'Player 6', port: 3006 },
        { name: 'Player 7', port: 3007 },
      ];

      const bracket = createBracketWithByes(players);
      expect(bracket).toHaveLength(3); // 7 jugadores -> 8 (siguiente potencia de 2) -> 3 rondas
      expect(bracket[0].matches).toHaveLength(4); // Primera ronda tiene 4 partidas

      // Verificar que se agregó 1 BYE (8 - 7 = 1)
      const firstRound = bracket[0];
      const byeCount = firstRound.matches.reduce((count, match) => {
        if (match.player1?.isBye) count++;
        if (match.player2?.isBye) count++;
        return count;
      }, 0);
      expect(byeCount).toBe(1);
    });

    test('debería crear bracket con BYEs para 9 jugadores', () => {
      const players = Array.from({ length: 9 }, (_, i) => ({
        name: `Player ${i + 1}`,
        port: 3001 + i,
      }));

      const bracket = createBracketWithByes(players);
      expect(bracket).toHaveLength(4); // 9 jugadores -> 16 (siguiente potencia de 2) -> 4 rondas
      expect(bracket[0].matches).toHaveLength(8); // Primera ronda tiene 8 partidas

      // Verificar que se agregaron 7 BYEs (16 - 9 = 7)
      const firstRound = bracket[0];
      const byeCount = firstRound.matches.reduce((count, match) => {
        if (match.player1?.isBye) count++;
        if (match.player2?.isBye) count++;
        return count;
      }, 0);
      expect(byeCount).toBe(7);
    });

    test('debería crear bracket con BYEs para 10 jugadores', () => {
      const players = Array.from({ length: 10 }, (_, i) => ({
        name: `Player ${i + 1}`,
        port: 3001 + i,
      }));

      const bracket = createBracketWithByes(players);
      expect(bracket).toHaveLength(4); // 10 jugadores -> 16 (siguiente potencia de 2) -> 4 rondas
      expect(bracket[0].matches).toHaveLength(8); // Primera ronda tiene 8 partidas

      // Verificar que se agregaron 6 BYEs (16 - 10 = 6)
      const firstRound = bracket[0];
      const byeCount = firstRound.matches.reduce((count, match) => {
        if (match.player1?.isBye) count++;
        if (match.player2?.isBye) count++;
        return count;
      }, 0);
      expect(byeCount).toBe(6);
    });

    test('debería crear bracket con BYEs para 11 jugadores', () => {
      const players = Array.from({ length: 11 }, (_, i) => ({
        name: `Player ${i + 1}`,
        port: 3001 + i,
      }));

      const bracket = createBracketWithByes(players);
      expect(bracket).toHaveLength(4); // 11 jugadores -> 16 (siguiente potencia de 2) -> 4 rondas
      expect(bracket[0].matches).toHaveLength(8); // Primera ronda tiene 8 partidas

      // Verificar que se agregaron 5 BYEs (16 - 11 = 5)
      const firstRound = bracket[0];
      const byeCount = firstRound.matches.reduce((count, match) => {
        if (match.player1?.isBye) count++;
        if (match.player2?.isBye) count++;
        return count;
      }, 0);
      expect(byeCount).toBe(5);
    });

    test('debería crear bracket con BYEs para 12 jugadores', () => {
      const players = Array.from({ length: 12 }, (_, i) => ({
        name: `Player ${i + 1}`,
        port: 3001 + i,
      }));

      const bracket = createBracketWithByes(players);
      expect(bracket).toHaveLength(4); // 12 jugadores -> 16 (siguiente potencia de 2) -> 4 rondas
      expect(bracket[0].matches).toHaveLength(8); // Primera ronda tiene 8 partidas

      // Verificar que se agregaron 4 BYEs (16 - 12 = 4)
      const firstRound = bracket[0];
      const byeCount = firstRound.matches.reduce((count, match) => {
        if (match.player1?.isBye) count++;
        if (match.player2?.isBye) count++;
        return count;
      }, 0);
      expect(byeCount).toBe(4);
    });
  });

  describe('shufflePlayers', () => {
    test('debería mezclar array de jugadores', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
        { name: 'Player 3', port: 3003 },
        { name: 'Player 4', port: 3004 },
      ];

      const shuffled = shufflePlayers([...players]);
      expect(shuffled).toHaveLength(players.length);
      expect(shuffled).toEqual(expect.arrayContaining(players));
    });
  });

  describe('validateTournamentPlayers', () => {
    test('debería validar jugadores válidos', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
      ];

      expect(() => validateTournamentPlayers(players)).not.toThrow();
    });

    test('debería lanzar error para jugadores vacíos', () => {
      expect(() => validateTournamentPlayers([])).toThrow();
    });

    test('debería permitir jugadores que no son potencia de dos (hasta 12)', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
        { name: 'Player 3', port: 3003 },
      ];

      expect(() => validateTournamentPlayers(players)).not.toThrow();
    });

    test('debería permitir hasta 12 jugadores', () => {
      const players = Array.from({ length: 12 }, (_, i) => ({
        name: `Player ${i + 1}`,
        port: 3001 + i,
      }));

      expect(() => validateTournamentPlayers(players)).not.toThrow();
    });

    test('debería lanzar error para más de 12 jugadores', () => {
      const players = Array.from({ length: 13 }, (_, i) => ({
        name: `Player ${i + 1}`,
        port: 3001 + i,
      }));

      expect(() => validateTournamentPlayers(players)).toThrow(
        'El torneo puede tener máximo 12 jugadores'
      );
    });

    test('debería lanzar error para objetos de jugador inválidos', () => {
      const players = [
        { name: 'Player 1' }, // falta puerto
        { name: 'Player 2', port: 3002 },
      ];

      expect(() => validateTournamentPlayers(players)).toThrow();
    });
  });

  describe('getTournamentWinners', () => {
    test('debería retornar ganador y subcampeón', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
      ];
      const bracket = createBracket(players);

      const winners = getTournamentWinners(players, bracket);
      expect(winners).toHaveProperty('winner');
      expect(winners).toHaveProperty('runnerUp');
    });

    test('debería manejar caso donde player1 es null pero player2 existe', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
      ];
      const bracket = createBracket(players);

      // Modificar manualmente la partida final para tener player1 null pero player2 válido
      const lastRound = bracket[bracket.length - 1];
      const finalMatch = lastRound.matches[0];
      finalMatch.player1 = null;
      finalMatch.player2 = { name: 'Player 2', port: 3002 };

      const winners = getTournamentWinners(players, bracket);
      expect(winners).toHaveProperty('winner');
      expect(winners).toHaveProperty('runnerUp');
    });
  });

  describe('isTournamentComplete', () => {
    test('debería detectar torneo completo para 2 jugadores', () => {
      const bracket = createBracket([
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
      ]);

      expect(isTournamentComplete(bracket)).toBe(true);
    });

    test('debería detectar torneo incompleto para 4 jugadores', () => {
      const bracket = createBracket([
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
        { name: 'Player 3', port: 3003 },
        { name: 'Player 4', port: 3004 },
      ]);

      expect(isTournamentComplete(bracket)).toBe(false);
    });
  });

  describe('getRoundInfo', () => {
    test('debería retornar información correcta de ronda', () => {
      const info = getRoundInfo(1, 3);
      expect(info).toHaveProperty('round', 1);
      expect(info).toHaveProperty('totalRounds', 3);
      expect(info).toHaveProperty('isFirstRound', true);
      expect(info).toHaveProperty('isFinalRound', false);
    });
  });

  describe('calculateProgress', () => {
    test('debería calcular progreso correctamente', () => {
      const bracket = createBracket([
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
      ]);

      const progress = calculateProgress(bracket, 0);
      expect(progress).toHaveProperty('completedMatches', 0);
      expect(progress).toHaveProperty('totalMatches');
      expect(progress).toHaveProperty('percentage');
      expect(progress).toHaveProperty('remainingMatches');
    });
  });

  describe('executeRound', () => {
    test('debería ejecutar ronda con partidas exitosas', () => {
      const round = {
        round: 1,
        matches: [
          {
            player1: { name: 'Player 1', port: 3001 },
            player2: { name: 'Player 2', port: 3002 },
          },
          {
            player1: { name: 'Player 3', port: 3003 },
            player2: { name: 'Player 4', port: 3004 },
          },
        ],
      };

      const mockMatchFunction = match => {
        if (match.player1.name === 'Player 1') {
          return { winner: match.player1 };
        }
        return { winner: match.player2 };
      };

      const winners = executeRound(round, mockMatchFunction);
      expect(winners).toHaveLength(2);
      expect(winners[0]).toEqual({ name: 'Player 1', port: 3001 });
      expect(winners[1]).toEqual({ name: 'Player 4', port: 3004 });
    });

    test('debería manejar empate seleccionando player1', () => {
      const round = {
        round: 1,
        matches: [
          {
            player1: { name: 'Player 1', port: 3001 },
            player2: { name: 'Player 2', port: 3002 },
          },
        ],
      };

      const mockMatchFunction = () => null; // Simular empate

      const winners = executeRound(round, mockMatchFunction);
      expect(winners).toHaveLength(1);
      expect(winners[0]).toEqual({ name: 'Player 1', port: 3001 });
    });

    test('debería manejar error seleccionando player1', () => {
      const round = {
        round: 1,
        matches: [
          {
            player1: { name: 'Player 1', port: 3001 },
            player2: { name: 'Player 2', port: 3002 },
          },
        ],
      };

      const mockMatchFunction = () => {
        throw new Error('Partida fallida');
      };

      const winners = executeRound(round, mockMatchFunction);
      expect(winners).toHaveLength(1);
      expect(winners[0]).toEqual({ name: 'Player 1', port: 3001 });
    });

    test('debería manejar resultado sin ganador seleccionando player1', () => {
      const round = {
        round: 1,
        matches: [
          {
            player1: { name: 'Player 1', port: 3001 },
            player2: { name: 'Player 2', port: 3002 },
          },
        ],
      };

      const mockMatchFunction = () => ({ result: 'draw' }); // Resultado sin ganador

      const winners = executeRound(round, mockMatchFunction);
      expect(winners).toHaveLength(1);
      expect(winners[0]).toEqual({ name: 'Player 1', port: 3001 });
    });

    test('debería manejar partidas BYE avanzando automáticamente jugador no-BYE', () => {
      const round = {
        round: 1,
        matches: [
          {
            player1: { name: 'BYE', port: null, isBye: true },
            player2: { name: 'Player 2', port: 3002 },
          },
          {
            player1: { name: 'Player 3', port: 3003 },
            player2: { name: 'BYE', port: null, isBye: true },
          },
        ],
      };

      const mockMatchFunction = () => {
        throw new Error('Esto no debería ser llamado para partidas BYE');
      };

      const winners = executeRound(round, mockMatchFunction);
      expect(winners).toHaveLength(2);
      expect(winners[0]).toEqual({ name: 'Player 2', port: 3002 });
      expect(winners[1]).toEqual({ name: 'Player 3', port: 3003 });
    });

    test('debería manejar partidas mixtas BYE y regulares', () => {
      const round = {
        round: 1,
        matches: [
          {
            player1: { name: 'Player 1', port: 3001 },
            player2: { name: 'Player 2', port: 3002 },
          },
          {
            player1: { name: 'BYE', port: null, isBye: true },
            player2: { name: 'Player 4', port: 3004 },
          },
        ],
      };

      const mockMatchFunction = match => {
        if (match.player1.name === 'Player 1') {
          return { winner: match.player1 };
        }
        throw new Error('Esto no debería ser llamado para partidas BYE');
      };

      const winners = executeRound(round, mockMatchFunction);
      expect(winners).toHaveLength(2);
      expect(winners[0]).toEqual({ name: 'Player 1', port: 3001 });
      expect(winners[1]).toEqual({ name: 'Player 4', port: 3004 });
    });

    test('debería manejar jugadores nulos en rondas posteriores', () => {
      const round = {
        round: 2,
        matches: [
          {
            player1: { name: 'Player 1', port: 3001 },
            player2: null,
          },
          {
            player1: null,
            player2: { name: 'Player 2', port: 3002 },
          },
        ],
      };

      const mockMatchFunction = () => {
        throw new Error('Esto no debería ser llamado para jugadores nulos');
      };

      const winners = executeRound(round, mockMatchFunction);
      expect(winners).toHaveLength(2);
      expect(winners[0]).toEqual({ name: 'Player 1', port: 3001 });
      expect(winners[1]).toEqual({ name: 'Player 2', port: 3002 });
    });
  });

  describe('casos límite de validateTournamentPlayers', () => {
    test('debería lanzar error para entrada que no es array', () => {
      expect(() => validateTournamentPlayers('not an array')).toThrow(
        'Los jugadores deben ser un array'
      );
      expect(() => validateTournamentPlayers(null)).toThrow(
        'Los jugadores deben ser un array'
      );
      expect(() => validateTournamentPlayers(undefined)).toThrow(
        'Los jugadores deben ser un array'
      );
      expect(() => validateTournamentPlayers(123)).toThrow(
        'Los jugadores deben ser un array'
      );
    });

    test('debería lanzar error para jugador que no es objeto', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        'not an object', // Jugador inválido
        { name: 'Player 3', port: 3003 },
        { name: 'Player 4', port: 3004 },
      ];

      expect(() => validateTournamentPlayers(players)).toThrow(
        'Jugador 2 debe ser un objeto'
      );
    });

    test('debería lanzar error para jugador con nombre inválido', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: '', port: 3002 }, // Nombre vacío
        { name: 'Player 3', port: 3003 },
        { name: 'Player 4', port: 3004 },
      ];

      expect(() => validateTournamentPlayers(players)).toThrow(
        'Jugador 2 debe tener un nombre válido'
      );
    });

    test('debería lanzar error para jugador con nombre que no es string', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 123, port: 3002 }, // Nombre no-string
        { name: 'Player 3', port: 3003 },
        { name: 'Player 4', port: 3004 },
      ];

      expect(() => validateTournamentPlayers(players)).toThrow(
        'Jugador 2 debe tener un nombre válido'
      );
    });

    test('debería lanzar error para jugador con nombre null', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: null, port: 3002 }, // Nombre null
        { name: 'Player 3', port: 3003 },
        { name: 'Player 4', port: 3004 },
      ];

      expect(() => validateTournamentPlayers(players)).toThrow(
        'Jugador 2 debe tener un nombre válido'
      );
    });

    test('debería permitir jugadores BYE con puertos null', () => {
      const players = [
        { name: 'Player 1', port: 3001 },
        { name: 'BYE', port: null, isBye: true },
        { name: 'Player 3', port: 3003 },
      ];

      expect(() => validateTournamentPlayers(players)).not.toThrow();
    });

    test('debería lanzar error para rangos de puerto inválidos', () => {
      const players = [
        { name: 'Player 1', port: 2999 }, // Muy bajo
        { name: 'Player 2', port: 3002 },
      ];

      expect(() => validateTournamentPlayers(players)).toThrow(
        'Jugador 1 debe tener un puerto válido entre 3000-9999'
      );
    });

    test('debería lanzar error para rangos de puerto inválidos (muy alto)', () => {
      const players = [
        { name: 'Player 1', port: 10000 }, // Muy alto
        { name: 'Player 2', port: 3002 },
      ];

      expect(() => validateTournamentPlayers(players)).toThrow(
        'Jugador 1 debe tener un puerto válido entre 3000-9999'
      );
    });
  });
});
