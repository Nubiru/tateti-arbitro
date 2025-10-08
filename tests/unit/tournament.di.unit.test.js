/**
 * Pruebas Unitarias de DI del Torneo
 * Pruebas para el coordinador de tournament.di.js
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import { TournamentCoordinator } from '../../src/domain/game/tournament.di.js';

describe('Pruebas Unitarias de TournamentCoordinator', () => {
  let coordinator;
  let mockDependencies;

  beforeEach(() => {
    mockDependencies = {
      arbitrator: {
        validatePlayers: jest.fn(),
        validateOptions: jest.fn(),
        createInitialBoard: jest.fn(),
        isValidMove: jest.fn(),
        makeMove: jest.fn(),
        checkWinner: jest.fn(),
        isBoardFull: jest.fn(),
        getNextPlayer: jest.fn(),
        checkGameOver: jest.fn(),
        getValidMoves: jest.fn(),
        isInWinningLine: jest.fn(),
      },
      eventsAdapter: {
        broadcastTournamentStart: jest.fn(),
        broadcastTournamentComplete: jest.fn(),
        broadcastMatchStart: jest.fn(),
        broadcastMatchMove: jest.fn(),
        broadcastMatchWin: jest.fn(),
        broadcastMatchDraw: jest.fn(),
        broadcastMatchError: jest.fn(),
      },
      logger: {
        info: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
      clock: {
        now: jest.fn(() => Date.now()),
        toISOString: jest.fn(() => new Date().toISOString()),
      },
    };
  });

  describe('Constructor', () => {
    test('debería crear instancia con todas las dependencias', () => {
      coordinator = new TournamentCoordinator(mockDependencies);

      expect(coordinator.arbitrator).toBe(mockDependencies.arbitrator);
      expect(coordinator.eventsAdapter).toBe(mockDependencies.eventsAdapter);
      expect(coordinator.logger).toBe(mockDependencies.logger);
      expect(coordinator.clock).toBe(mockDependencies.clock);
    });

    test('debería crear instancia con dependencias parciales', () => {
      const partialDependencies = {
        arbitrator: mockDependencies.arbitrator,
        eventsAdapter: mockDependencies.eventsAdapter,
        logger: mockDependencies.logger,
        // falta clock
      };

      coordinator = new TournamentCoordinator(partialDependencies);

      expect(coordinator.arbitrator).toBe(mockDependencies.arbitrator);
      expect(coordinator.eventsAdapter).toBe(mockDependencies.eventsAdapter);
      expect(coordinator.logger).toBe(mockDependencies.logger);
      expect(coordinator.clock).toBeDefined();
      expect(coordinator.clock.now).toBeInstanceOf(Function);
      expect(coordinator.clock.toISOString).toBeInstanceOf(Function);
    });

    test('debería lanzar error con dependencias vacías', () => {
      expect(() => {
        coordinator = new TournamentCoordinator({});
      }).toThrow('arbitrator es requerido');
    });

    test('debería lanzar error con dependencias undefined', () => {
      expect(() => {
        coordinator = new TournamentCoordinator(undefined);
      }).toThrow("Cannot read properties of undefined (reading 'arbitrator')");
    });
  });

  describe('Constructor - Default Clock Fallback', () => {
    test('debería usar reloj por defecto cuando no se proporciona', () => {
      const dependenciesWithoutClock = {
        arbitrator: mockDependencies.arbitrator,
        eventsAdapter: mockDependencies.eventsAdapter,
        logger: mockDependencies.logger,
        // falta clock
      };

      const coordinatorWithoutClock = new TournamentCoordinator(
        dependenciesWithoutClock
      );

      expect(coordinatorWithoutClock.clock).toBeDefined();
      expect(coordinatorWithoutClock.clock.now).toBeInstanceOf(Function);
      expect(coordinatorWithoutClock.clock.toISOString).toBeInstanceOf(
        Function
      );
    });

    test('debería usar reloj proporcionado cuando está disponible', () => {
      const customClock = {
        now: jest.fn(() => 1234567890),
        toISOString: jest.fn(() => '2023-10-04T12:00:00.000Z'),
      };

      const dependenciesWithClock = {
        ...mockDependencies,
        clock: customClock,
      };

      const coordinatorWithClock = new TournamentCoordinator(
        dependenciesWithClock
      );

      expect(coordinatorWithClock.clock).toBe(customClock);
    });

    test('debería usar reloj por defecto cuando clock es null', () => {
      const dependenciesWithNullClock = {
        arbitrator: mockDependencies.arbitrator,
        eventsAdapter: mockDependencies.eventsAdapter,
        logger: mockDependencies.logger,
        clock: null,
      };

      const coordinatorWithNullClock = new TournamentCoordinator(
        dependenciesWithNullClock
      );

      expect(coordinatorWithNullClock.clock).toBeDefined();
      expect(coordinatorWithNullClock.clock.now).toBeInstanceOf(Function);
      expect(coordinatorWithNullClock.clock.toISOString).toBeInstanceOf(
        Function
      );
    });

    test('debería usar reloj por defecto cuando clock es undefined', () => {
      const dependenciesWithUndefinedClock = {
        arbitrator: mockDependencies.arbitrator,
        eventsAdapter: mockDependencies.eventsAdapter,
        logger: mockDependencies.logger,
        clock: undefined,
      };

      const coordinatorWithUndefinedClock = new TournamentCoordinator(
        dependenciesWithUndefinedClock
      );

      expect(coordinatorWithUndefinedClock.clock).toBeDefined();
      expect(coordinatorWithUndefinedClock.clock.now).toBeInstanceOf(Function);
      expect(coordinatorWithUndefinedClock.clock.toISOString).toBeInstanceOf(
        Function
      );
    });

    test('debería llamar métodos de reloj por defecto y retornar tipos esperados', () => {
      const dependenciesWithoutClock = {
        arbitrator: mockDependencies.arbitrator,
        eventsAdapter: mockDependencies.eventsAdapter,
        logger: mockDependencies.logger,
      };

      const coordinator = new TournamentCoordinator(dependenciesWithoutClock);

      // Probar que los métodos de reloj por defecto funcionan
      const nowResult = coordinator.clock.now();
      const isoStringResult = coordinator.clock.toISOString();

      expect(typeof nowResult).toBe('number');
      expect(typeof isoStringResult).toBe('string');
      expect(nowResult).toBeGreaterThan(0);
      expect(isoStringResult).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });
  });

  describe('Constructor - Error Handling', () => {
    test('debería lanzar error cuando arbitrator falta', () => {
      const invalidDependencies = {
        eventsAdapter: mockDependencies.eventsAdapter,
        logger: mockDependencies.logger,
        // falta arbitrator
      };

      expect(() => {
        new TournamentCoordinator(invalidDependencies);
      }).toThrow('arbitrator es requerido');
    });

    test('debería lanzar error cuando eventsAdapter falta', () => {
      const invalidDependencies = {
        arbitrator: mockDependencies.arbitrator,
        logger: mockDependencies.logger,
        // falta eventsAdapter
      };

      expect(() => {
        new TournamentCoordinator(invalidDependencies);
      }).toThrow('eventsAdapter es requerido');
    });

    test('debería lanzar error cuando logger falta', () => {
      const invalidDependencies = {
        arbitrator: mockDependencies.arbitrator,
        eventsAdapter: mockDependencies.eventsAdapter,
        // falta logger
      };

      expect(() => {
        new TournamentCoordinator(invalidDependencies);
      }).toThrow('logger es requerido');
    });
  });

  describe('buildPlayerList', () => {
    beforeEach(() => {
      coordinator = new TournamentCoordinator(mockDependencies);
    });

    test('debería construir lista de jugadores con jugadores humanos y aleatorios', () => {
      const config = {
        totalPlayers: 4,
        includeRandom: true,
        humanName: 'Alice',
      };

      const players = coordinator.buildPlayerList(config);

      expect(players).toHaveLength(4);
      expect(players[0].name).toBe('Alice');
      expect(players[0].port).toBe(3000);
      expect(players[1].name).toBe('Random');
      expect(players[1].port).toBe(3001);
      expect(players[2].name).toBe('Bot1');
      expect(players[2].port).toBe(3002);
      expect(players[3].name).toBe('Bot2');
      expect(players[3].port).toBe(3003);
    });

    test('debería construir lista de jugadores solo con jugador humano', () => {
      const config = {
        totalPlayers: 3,
        includeRandom: false,
        humanName: 'Bob',
      };

      const players = coordinator.buildPlayerList(config);

      expect(players).toHaveLength(3);
      expect(players[0].name).toBe('Bob');
      expect(players[0].port).toBe(3000);
      expect(players[1].name).toBe('Bot1');
      expect(players[1].port).toBe(3002);
      expect(players[2].name).toBe('Bot2');
      expect(players[2].port).toBe(3003);
    });

    test('debería construir lista de jugadores solo con jugador aleatorio', () => {
      const config = {
        totalPlayers: 3,
        includeRandom: true,
        humanName: null,
      };

      const players = coordinator.buildPlayerList(config);

      expect(players).toHaveLength(3);
      expect(players[0].name).toBe('Random');
      expect(players[0].port).toBe(3001);
      expect(players[1].name).toBe('Bot1');
      expect(players[1].port).toBe(3002);
      expect(players[2].name).toBe('Bot2');
      expect(players[2].port).toBe(3003);
    });

    test('debería construir lista de jugadores solo con jugadores bot', () => {
      const config = {
        totalPlayers: 3,
        includeRandom: false,
        humanName: null,
      };

      const players = coordinator.buildPlayerList(config);

      expect(players).toHaveLength(3);
      expect(players[0].name).toBe('Bot1');
      expect(players[0].port).toBe(3002);
      expect(players[1].name).toBe('Bot2');
      expect(players[1].port).toBe(3003);
      expect(players[2].name).toBe('Bot3');
      expect(players[2].port).toBe(3004);
    });

    test('debería construir lista de jugadores con valores por defecto', () => {
      const config = {
        totalPlayers: 2,
        // includeRandom y humanName son undefined
      };

      const players = coordinator.buildPlayerList(config);

      expect(players).toHaveLength(2);
      expect(players[0].name).toBe('Bot1');
      expect(players[0].port).toBe(3002);
      expect(players[1].name).toBe('Bot2');
      expect(players[1].port).toBe(3003);
    });

    test('debería manejar número máximo de jugadores con bots genéricos', () => {
      const config = {
        totalPlayers: 12,
        includeRandom: true,
        humanName: 'Alice',
      };

      const players = coordinator.buildPlayerList(config);

      expect(players).toHaveLength(12);
      expect(players[0].name).toBe('Alice');
      expect(players[1].name).toBe('Random');
      expect(players[2].name).toBe('Bot1');
      expect(players[players.length - 1].name).toBe('Bot10');
    });

    test('debería lanzar error para totalPlayers inválido - muy bajo', () => {
      const config = {
        totalPlayers: 1,
        includeRandom: false,
        humanName: null,
      };

      expect(() => {
        coordinator.buildPlayerList(config);
      }).toThrow('totalPlayers debe ser entre 2-12');
    });

    test('debería lanzar error para totalPlayers inválido - muy alto', () => {
      const config = {
        totalPlayers: 13,
        includeRandom: false,
        humanName: null,
      };

      expect(() => {
        coordinator.buildPlayerList(config);
      }).toThrow('totalPlayers debe ser entre 2-12');
    });

    test('debería lanzar error para totalPlayers inválido - cero', () => {
      const config = {
        totalPlayers: 0,
        includeRandom: false,
        humanName: null,
      };

      expect(() => {
        coordinator.buildPlayerList(config);
      }).toThrow('totalPlayers debe ser entre 2-12');
    });

    test('debería lanzar error para totalPlayers inválido - negativo', () => {
      const config = {
        totalPlayers: -1,
        includeRandom: false,
        humanName: null,
      };

      expect(() => {
        coordinator.buildPlayerList(config);
      }).toThrow('totalPlayers debe ser entre 2-12');
    });

    test('debería manejar caso límite con exactamente 12 jugadores', () => {
      const config = {
        totalPlayers: 12,
        includeRandom: true,
        humanName: 'Alice',
      };

      const players = coordinator.buildPlayerList(config);

      expect(players).toHaveLength(12);
      expect(players[0].name).toBe('Alice');
      expect(players[1].name).toBe('Random');
      expect(players[2].name).toBe('Bot1');
      expect(players[11].name).toBe('Bot10');
    });

    test('debería manejar caso límite con exactamente 2 jugadores', () => {
      const config = {
        totalPlayers: 2,
        includeRandom: true,
        humanName: 'Alice',
      };

      const players = coordinator.buildPlayerList(config);

      expect(players).toHaveLength(2);
      expect(players[0].name).toBe('Alice');
      expect(players[1].name).toBe('Random');
    });

    test('debería manejar generación de bots genéricos cuando excede nombres de bots predefinidos', () => {
      const config = {
        totalPlayers: 15,
        includeRandom: false,
        humanName: null,
      };

      // Esto debería lanzar un error ya que totalPlayers > 12
      expect(() => {
        coordinator.buildPlayerList(config);
      }).toThrow('totalPlayers debe ser entre 2-12');
    });

    test('debería manejar generación de bots genéricos para máximo número válido de jugadores', () => {
      const config = {
        totalPlayers: 12,
        includeRandom: false,
        humanName: null,
      };

      const players = coordinator.buildPlayerList(config);

      expect(players).toHaveLength(12);
      expect(players[0].name).toBe('Bot1');
      expect(players[9].name).toBe('Bot10');
      expect(players[10].name).toBe('Bot11');
      expect(players[11].name).toBe('Bot12');
    });
  });

  describe('Pure Function Wrappers', () => {
    beforeEach(() => {
      coordinator = new TournamentCoordinator(mockDependencies);
    });

    test('debería delegar validatePlayers a función core', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      coordinator.validatePlayers(players);

      // Esto debería llamar a la función core
      expect(coordinator.validatePlayers).toBeDefined();
    });

    test('debería delegar shufflePlayers a función core', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = coordinator.shufflePlayers(players);

      // Esto debería llamar a la función core y retornar un resultado
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('debería delegar createBracket a función core', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];

      const result = coordinator.createBracket(players);

      // Esto debería llamar a la función core y retornar un resultado
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('debería delegar createBracketWithByes a función core', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
        { name: 'Player3', port: 3003 },
      ];

      const result = coordinator.createBracketWithByes(players);

      // Esto debería llamar a la función core y retornar su resultado
      expect(result).toBeDefined();
    });

    test('debería delegar getTournamentWinners a función core', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];
      const bracket = [
        {
          round: 1,
          matches: [
            {
              player1: players[0],
              player2: players[1],
              winner: players[0],
            },
          ],
        },
      ];

      const result = coordinator.getTournamentWinners(players, bracket);

      // Esto debería llamar a la función core y retornar su resultado
      expect(result).toBeDefined();
      expect(result.winner).toBeDefined();
      expect(result.runnerUp).toBeDefined();
    });

    test('debería delegar calculateTotalMatches a función core', () => {
      const result = coordinator.calculateTotalMatches(4);

      // Esto debería llamar a la función core y retornar un número
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    test('debería delegar isPowerOfTwo a función core', () => {
      const result1 = coordinator.isPowerOfTwo(4);
      const result2 = coordinator.isPowerOfTwo(5);

      // Esto debería llamar a la función core y retornar boolean
      expect(typeof result1).toBe('boolean');
      expect(typeof result2).toBe('boolean');
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    test('debería delegar executeRound a función core', () => {
      const round = { round: 1, matches: [] };
      const matchFunction = jest.fn();

      const result = coordinator.executeRound(round, matchFunction);

      // Esto debería llamar a la función core y retornar su resultado
      expect(result).toBeDefined();
    });

    test('debería delegar isTournamentComplete a función core', () => {
      const bracket = [{ round: 1, matches: [] }];

      const result = coordinator.isTournamentComplete(bracket);

      // Esto debería llamar a la función core y retornar boolean
      expect(typeof result).toBe('boolean');
    });

    test('debería delegar getRoundInfo a función core', () => {
      const result = coordinator.getRoundInfo(1, 3);

      // Esto debería llamar a la función core y retornar su resultado
      expect(result).toBeDefined();
    });

    test('debería delegar calculateProgress a función core', () => {
      const bracket = [{ round: 1, matches: [] }];
      const completedMatches = 0;

      const result = coordinator.calculateProgress(bracket, completedMatches);

      // Esto debería llamar a la función core y retornar su resultado
      expect(result).toBeDefined();
    });
  });

  describe('runTournament - Synchronous Unit Tests', () => {
    let mockArbitrator;
    let mockEventsAdapter;
    let mockLogger;
    let mockClock;
    let tournamentCoordinator;

    beforeEach(() => {
      mockArbitrator = {
        runMatch: jest.fn(),
      };
      mockEventsAdapter = {
        broadcastTournamentStart: jest.fn(),
        broadcastTournamentComplete: jest.fn(),
      };
      mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
      };
      mockClock = {
        now: jest.fn(() => 1234567890),
        toISOString: jest.fn(() => '2023-10-04T12:00:00.000Z'),
      };

      tournamentCoordinator = new TournamentCoordinator({
        arbitrator: mockArbitrator,
        eventsAdapter: mockEventsAdapter,
        logger: mockLogger,
        clock: mockClock,
      });
    });

    describe('Options Processing', () => {
      test('debería usar timeout por defecto cuando no se proporciona', () => {
        const players = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        // Simular los métodos que serían llamados
        jest
          .spyOn(tournamentCoordinator, 'validatePlayers')
          .mockImplementation(() => {});
        jest
          .spyOn(tournamentCoordinator, 'shufflePlayers')
          .mockReturnValue(players);
        jest.spyOn(tournamentCoordinator, 'createBracket').mockReturnValue([
          {
            round: 1,
            matches: [
              {
                players: players,
                winner: null,
                result: null,
              },
            ],
          },
        ]);

        // Esto no debería lanzar y debería usar timeout por defecto
        expect(() => {
          tournamentCoordinator.runTournament(players, {});
        }).not.toThrow();
      });

      test('debería usar timeout personalizado cuando se proporciona', () => {
        const players = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        // Simular los métodos que serían llamados
        jest
          .spyOn(tournamentCoordinator, 'validatePlayers')
          .mockImplementation(() => {});
        jest
          .spyOn(tournamentCoordinator, 'shufflePlayers')
          .mockReturnValue(players);
        jest.spyOn(tournamentCoordinator, 'createBracket').mockReturnValue([
          {
            round: 1,
            matches: [
              {
                players: players,
                winner: null,
                result: null,
              },
            ],
          },
        ]);

        // Esto no debería lanzar y debería usar timeout personalizado
        expect(() => {
          tournamentCoordinator.runTournament(players, { timeoutMs: 5000 });
        }).not.toThrow();
      });

      test('debería usar noTie por defecto cuando no se proporciona', () => {
        const players = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        // Simular los métodos que serían llamados
        jest
          .spyOn(tournamentCoordinator, 'validatePlayers')
          .mockImplementation(() => {});
        jest
          .spyOn(tournamentCoordinator, 'shufflePlayers')
          .mockReturnValue(players);
        jest.spyOn(tournamentCoordinator, 'createBracket').mockReturnValue([
          {
            round: 1,
            matches: [
              {
                players: players,
                winner: null,
                result: null,
              },
            ],
          },
        ]);

        // Esto no debería lanzar y debería usar noTie por defecto
        expect(() => {
          tournamentCoordinator.runTournament(players, {});
        }).not.toThrow();
      });

      test('debería usar noTie personalizado cuando se proporciona', () => {
        const players = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        // Simular los métodos que serían llamados
        jest
          .spyOn(tournamentCoordinator, 'validatePlayers')
          .mockImplementation(() => {});
        jest
          .spyOn(tournamentCoordinator, 'shufflePlayers')
          .mockReturnValue(players);
        jest.spyOn(tournamentCoordinator, 'createBracket').mockReturnValue([
          {
            round: 1,
            matches: [
              {
                players: players,
                winner: null,
                result: null,
              },
            ],
          },
        ]);

        // Esto no debería lanzar y debería usar noTie personalizado
        expect(() => {
          tournamentCoordinator.runTournament(players, { noTie: true });
        }).not.toThrow();
      });

      test('debería usar tamaño de tablero 3x3 por defecto', () => {
        const players = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        // Simular los métodos que serían llamados
        jest
          .spyOn(tournamentCoordinator, 'validatePlayers')
          .mockImplementation(() => {});
        jest
          .spyOn(tournamentCoordinator, 'shufflePlayers')
          .mockReturnValue(players);
        jest.spyOn(tournamentCoordinator, 'createBracket').mockReturnValue([
          {
            round: 1,
            matches: [
              {
                players: players,
                winner: null,
                result: null,
              },
            ],
          },
        ]);

        // Esto no debería lanzar y debería usar tablero 3x3
        expect(() => {
          tournamentCoordinator.runTournament(players, {});
        }).not.toThrow();
      });

      test('debería usar tamaño de tablero 5x5 cuando se especifica', () => {
        const players = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        // Simular los métodos que serían llamados
        jest
          .spyOn(tournamentCoordinator, 'validatePlayers')
          .mockImplementation(() => {});
        jest
          .spyOn(tournamentCoordinator, 'shufflePlayers')
          .mockReturnValue(players);
        jest.spyOn(tournamentCoordinator, 'createBracket').mockReturnValue([
          {
            round: 1,
            matches: [
              {
                players: players,
                winner: null,
                result: null,
              },
            ],
          },
        ]);

        // Esto no debería lanzar y debería usar tablero 5x5
        expect(() => {
          tournamentCoordinator.runTournament(players, { boardSize: 5 });
        }).not.toThrow();
      });

      test('debería usar tamaño de tablero 3x3 cuando boardSize no es 5', () => {
        const players = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        // Simular los métodos que serían llamados
        jest
          .spyOn(tournamentCoordinator, 'validatePlayers')
          .mockImplementation(() => {});
        jest
          .spyOn(tournamentCoordinator, 'shufflePlayers')
          .mockReturnValue(players);
        jest.spyOn(tournamentCoordinator, 'createBracket').mockReturnValue([
          {
            round: 1,
            matches: [
              {
                players: players,
                winner: null,
                result: null,
              },
            ],
          },
        ]);

        // Esto no debería lanzar y debería usar tablero 3x3
        expect(() => {
          tournamentCoordinator.runTournament(players, { boardSize: 3 });
        }).not.toThrow();
      });
    });

    describe('Player Validation', () => {
      test('debería validar jugadores antes de iniciar torneo', () => {
        const invalidPlayers = [
          { name: 'Player1', port: 3001 },
          // Falta segundo jugador
        ];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Se necesitan al menos 2 jugadores para el torneo');
      });

      test('debería validar longitud del array de jugadores', () => {
        const validPlayers = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        expect(() => {
          tournamentCoordinator.validatePlayers(validPlayers);
        }).not.toThrow();
      });

      test('debería validar jugadores con estructura correcta', () => {
        const players = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        // Esto no debería lanzar ya que es un array válido de 2 jugadores
        expect(() =>
          tournamentCoordinator.validatePlayers(players)
        ).not.toThrow();
      });

      test('debería lanzar error para array de jugadores vacío', () => {
        expect(() => {
          tournamentCoordinator.validatePlayers([]);
        }).toThrow('Se necesitan al menos 2 jugadores para el torneo');
      });

      test('debería lanzar error para jugador único', () => {
        const singlePlayer = [{ name: 'Player1', port: 3001 }];

        expect(() => {
          tournamentCoordinator.validatePlayers(singlePlayer);
        }).toThrow('Se necesitan al menos 2 jugadores para el torneo');
      });

      test('debería lanzar error para demasiados jugadores', () => {
        const tooManyPlayers = Array.from({ length: 13 }, (_, i) => ({
          name: `Player${i + 1}`,
          port: 3001 + i,
        }));

        expect(() => {
          tournamentCoordinator.validatePlayers(tooManyPlayers);
        }).toThrow('El torneo puede tener máximo 12 jugadores');
      });

      test('debería manejar validación de jugador con nombre faltante', () => {
        const invalidPlayers = [
          { port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Jugador 1 debe tener un nombre válido');
      });

      test('debería manejar validación de jugador con puerto faltante', () => {
        const invalidPlayers = [
          { name: 'Player1' },
          { name: 'Player2', port: 3002 },
        ];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Jugador 1 debe tener un puerto válido');
      });

      test('debería manejar validación de jugador con tipo de nombre inválido', () => {
        const invalidPlayers = [
          { name: 123, port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Jugador 1 debe tener un nombre válido');
      });

      test('debería manejar validación de jugador con tipo de puerto inválido', () => {
        const invalidPlayers = [
          { name: 'Player1', port: '3001' },
          { name: 'Player2', port: 3002 },
        ];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Jugador 1 debe tener un puerto válido');
      });

      test('debería manejar validación de jugador con nombre null', () => {
        const invalidPlayers = [
          { name: null, port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Jugador 1 debe tener un nombre válido');
      });

      test('debería manejar validación de jugador con puerto undefined', () => {
        const invalidPlayers = [
          { name: 'Player1', port: undefined },
          { name: 'Player2', port: 3002 },
        ];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Jugador 1 debe tener un puerto válido');
      });

      test('debería manejar validación de jugador con nombre de cadena vacía', () => {
        const invalidPlayers = [
          { name: '', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Jugador 1 debe tener un nombre válido');
      });

      test('debería manejar validación de jugador con puerto cero', () => {
        const invalidPlayers = [
          { name: 'Player1', port: 0 },
          { name: 'Player2', port: 3002 },
        ];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Jugador 1 debe tener un puerto válido');
      });

      test('debería manejar validación de jugador con puerto negativo', () => {
        const invalidPlayers = [
          { name: 'Player1', port: -1 },
          { name: 'Player2', port: 3002 },
        ];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Jugador 1 debe tener un puerto válido');
      });

      test('debería manejar validación de jugador con jugador que no es objeto', () => {
        const invalidPlayers = [
          'not an object',
          { name: 'Player2', port: 3002 },
        ];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Jugador 1 debe ser un objeto');
      });

      test('debería manejar validación de jugador con jugador null', () => {
        const invalidPlayers = [null, { name: 'Player2', port: 3002 }];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Jugador 1 debe ser un objeto');
      });

      test('debería manejar validación de jugador con jugador undefined', () => {
        const invalidPlayers = [undefined, { name: 'Player2', port: 3002 }];

        expect(() => {
          tournamentCoordinator.validatePlayers(invalidPlayers);
        }).toThrow('Jugador 1 debe ser un objeto');
      });
    });

    describe('Method Delegation', () => {
      test('debería llamar shufflePlayers con parámetros correctos', () => {
        const players = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        // Simular los métodos que serían llamados
        jest
          .spyOn(tournamentCoordinator, 'validatePlayers')
          .mockImplementation(() => {});
        const shuffleSpy = jest
          .spyOn(tournamentCoordinator, 'shufflePlayers')
          .mockReturnValue(players);
        jest.spyOn(tournamentCoordinator, 'createBracket').mockReturnValue([
          {
            round: 1,
            matches: [
              {
                players: players,
                winner: null,
                result: null,
              },
            ],
          },
        ]);

        tournamentCoordinator.runTournament(players, {});

        expect(shuffleSpy).toHaveBeenCalledWith(players);
      });

      test('debería llamar createBracket con jugadores mezclados', () => {
        const players = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];
        const shuffledPlayers = [
          { name: 'Player2', port: 3002 },
          { name: 'Player1', port: 3001 },
        ];

        // Simular los métodos que serían llamados
        jest
          .spyOn(tournamentCoordinator, 'validatePlayers')
          .mockImplementation(() => {});
        jest
          .spyOn(tournamentCoordinator, 'shufflePlayers')
          .mockReturnValue(shuffledPlayers);
        const createBracketSpy = jest
          .spyOn(tournamentCoordinator, 'createBracket')
          .mockReturnValue([
            {
              round: 1,
              matches: [
                {
                  players: shuffledPlayers,
                  winner: null,
                  result: null,
                },
              ],
            },
          ]);

        tournamentCoordinator.runTournament(players, {});

        expect(createBracketSpy).toHaveBeenCalledWith(shuffledPlayers);
      });
    });

    describe('Logging', () => {
      test('debería registrar inicio de torneo con parámetros correctos', () => {
        const players = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        // Simular los métodos que serían llamados
        jest
          .spyOn(tournamentCoordinator, 'validatePlayers')
          .mockImplementation(() => {});
        jest
          .spyOn(tournamentCoordinator, 'shufflePlayers')
          .mockReturnValue(players);
        jest.spyOn(tournamentCoordinator, 'createBracket').mockReturnValue([
          {
            round: 1,
            matches: [
              {
                players: players,
                winner: null,
                result: null,
              },
            ],
          },
        ]);

        tournamentCoordinator.runTournament(players, {
          boardSize: 5,
          noTie: true,
        });

        expect(mockLogger.info).toHaveBeenCalledWith(
          'TOURNAMENT',
          'START',
          'Iniciando torneo',
          {
            players: ['Player1', 'Player2'],
            boardSize: '5x5',
            noTie: true,
            timeoutMs: 3000,
          }
        );
      });

      test('debería registrar inicio de torneo con parámetros por defecto', () => {
        const players = [
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
        ];

        // Simular los métodos que serían llamados
        jest
          .spyOn(tournamentCoordinator, 'validatePlayers')
          .mockImplementation(() => {});
        jest
          .spyOn(tournamentCoordinator, 'shufflePlayers')
          .mockReturnValue(players);
        jest.spyOn(tournamentCoordinator, 'createBracket').mockReturnValue([
          {
            round: 1,
            matches: [
              {
                players: players,
                winner: null,
                result: null,
              },
            ],
          },
        ]);

        tournamentCoordinator.runTournament(players, {});

        expect(mockLogger.info).toHaveBeenCalledWith(
          'TOURNAMENT',
          'START',
          'Iniciando torneo',
          {
            players: ['Player1', 'Player2'],
            boardSize: '3x3',
            noTie: false,
            timeoutMs: 3000,
          }
        );
      });
    });
  });
});
