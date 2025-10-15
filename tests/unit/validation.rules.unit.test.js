/**
 * Pruebas unitarias para Reglas de Validación
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import {
  validatePlayerShape,
  validatePlayerName,
  validatePlayerPort,
  validateBoardSize,
  validateNoTie,
  validateSpeed,
  validatePlayersArray,
  validateTotalPlayers,
  validateIncludeRandom,
  validateHumanName,
  validateService,
} from '../../src/middleware/validation.rules.js';

describe('Pruebas Unitarias de Reglas de Validación', () => {
  describe('validatePlayerShape', () => {
    test('debería validar objeto jugador correcto', () => {
      const player = { name: 'Player1', port: 3001 };
      const result = validatePlayerShape(player, 'player1');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería rechazar jugador null', () => {
      const result = validatePlayerShape(null, 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Se necesitan dos jugadores para iniciar la partida.'
      );
    });

    test('debería rechazar jugador undefined', () => {
      const result = validatePlayerShape(undefined, 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Se necesitan dos jugadores para iniciar la partida.'
      );
    });

    test('debería rechazar jugador que no es objeto', () => {
      const result = validatePlayerShape('not an object', 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('player1 debe ser un objeto');
    });

    test('debería rechazar jugador sin nombre', () => {
      const player = { port: 3001 };
      const result = validatePlayerShape(player, 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('player1 debe tener name y (port o url)');
    });

    test('debería rechazar jugador sin puerto', () => {
      const player = { name: 'Player1' };
      const result = validatePlayerShape(player, 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('player1 debe tener name y (port o url)');
    });

    test('debería rechazar jugador con nombre vacío', () => {
      const player = { name: '', port: 3001 };
      const result = validatePlayerShape(player, 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('player1 debe tener name y (port o url)');
    });

    test('debería rechazar jugador con puerto null', () => {
      const player = { name: 'Player1', port: null };
      const result = validatePlayerShape(player, 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('player1 debe tener name y (port o url)');
    });
  });

  describe('validatePlayerName', () => {
    test('debería validar nombre de jugador correcto', () => {
      const result = validatePlayerName('Player1', 'player1');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería rechazar nombre que no es string', () => {
      const result = validatePlayerName(123, 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'player1.name debe ser una cadena de 1-50 caracteres'
      );
    });

    test('debería rechazar nombre vacío', () => {
      const result = validatePlayerName('', 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'player1.name debe ser una cadena de 1-50 caracteres'
      );
    });

    test('debería rechazar nombre muy largo', () => {
      const longName = 'a'.repeat(51);
      const result = validatePlayerName(longName, 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'player1.name debe ser una cadena de 1-50 caracteres'
      );
    });

    test('debería rechazar nombre con etiqueta script XSS', () => {
      const result = validatePlayerName(
        '<script>alert("xss")</script>',
        'player1'
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'player1.name contiene caracteres no permitidos'
      );
    });

    test('debería rechazar nombre con protocolo javascript:', () => {
      const result = validatePlayerName('javascript:alert("xss")', 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'player1.name contiene caracteres no permitidos'
      );
    });

    test('debería rechazar nombre con manejador onclick', () => {
      const result = validatePlayerName('onclick="alert(\'xss\')"', 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'player1.name contiene caracteres no permitidos'
      );
    });

    test('debería aceptar nombre con caracteres especiales', () => {
      const result = validatePlayerName('Player-1_Test', 'player1');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar nombre con números', () => {
      const result = validatePlayerName('Player123', 'player1');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('validatePlayerPort', () => {
    test('debería validar número de puerto correcto', () => {
      const result = validatePlayerPort(3001, 'player1');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar número de puerto mínimo', () => {
      const result = validatePlayerPort(3000, 'player1');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar número de puerto máximo', () => {
      const result = validatePlayerPort(9999, 'player1');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería rechazar puerto que no es número', () => {
      const result = validatePlayerPort('3001', 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'player1.port debe ser un número entre 3000-9999'
      );
    });

    test('debería rechazar puerto que no es entero', () => {
      const result = validatePlayerPort(3001.5, 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'player1.port debe ser un número entre 3000-9999'
      );
    });

    test('debería rechazar puerto muy bajo', () => {
      const result = validatePlayerPort(2999, 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'player1.port debe ser un número entre 3000-9999'
      );
    });

    test('debería rechazar puerto muy alto', () => {
      const result = validatePlayerPort(10000, 'player1');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'player1.port debe ser un número entre 3000-9999'
      );
    });
  });

  describe('validateBoardSize', () => {
    test('debería validar tamaño de tablero 3x3', () => {
      const result = validateBoardSize('3x3');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar tamaño de tablero 5x5', () => {
      const result = validateBoardSize('5x5');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar tamaño de tablero undefined', () => {
      const result = validateBoardSize(undefined);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar tamaño de tablero null', () => {
      const result = validateBoardSize(null);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería rechazar tamaño de tablero inválido', () => {
      const result = validateBoardSize('4x4');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('boardSize debe ser 3x3 o 5x5');
    });

    test('debería rechazar tamaño de tablero vacío', () => {
      const result = validateBoardSize('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('boardSize debe ser 3x3 o 5x5');
    });
  });

  describe('validateNoTie', () => {
    test('debería validar noTie true', () => {
      const result = validateNoTie(true);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar noTie false', () => {
      const result = validateNoTie(false);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar noTie undefined', () => {
      const result = validateNoTie(undefined);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar noTie null', () => {
      const result = validateNoTie(null);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería rechazar noTie que no es booleano', () => {
      const result = validateNoTie('true');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('noTie debe ser un booleano');
    });

    test('debería rechazar noTie número', () => {
      const result = validateNoTie(1);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('noTie debe ser un booleano');
    });
  });

  describe('validateSpeed', () => {
    test('debería validar velocidad lenta', () => {
      const result = validateSpeed('slow');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar velocidad normal', () => {
      const result = validateSpeed('normal');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar velocidad rápida', () => {
      const result = validateSpeed('fast');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar velocidad undefined', () => {
      const result = validateSpeed(undefined);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar velocidad null', () => {
      const result = validateSpeed(null);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería rechazar velocidad inválida', () => {
      const result = validateSpeed('very-fast');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('speed debe ser slow, normal o fast');
    });

    test('debería rechazar velocidad vacía', () => {
      const result = validateSpeed('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('speed debe ser slow, normal o fast');
    });
  });

  describe('validatePlayersArray', () => {
    test('debería validar array de jugadores correcto', () => {
      const players = [
        { name: 'Player1', port: 3001 },
        { name: 'Player2', port: 3002 },
      ];
      const result = validatePlayersArray(players);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar array de jugadores máximo', () => {
      const players = Array(12)
        .fill()
        .map((_, i) => ({
          name: `Player${i + 1}`,
          port: 3001 + i,
        }));
      const result = validatePlayersArray(players);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería rechazar jugadores que no es array', () => {
      const result = validatePlayersArray('not an array');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('players debe ser un array de 2-12 jugadores');
    });

    test('debería rechazar array de jugadores vacío', () => {
      const result = validatePlayersArray([]);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('players debe ser un array de 2-12 jugadores');
    });

    test('debería rechazar array de jugador único', () => {
      const players = [{ name: 'Player1', port: 3001 }];
      const result = validatePlayersArray(players);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('players debe ser un array de 2-12 jugadores');
    });

    test('debería rechazar array de demasiados jugadores', () => {
      const players = Array(13)
        .fill()
        .map((_, i) => ({
          name: `Player${i + 1}`,
          port: 3001 + i,
        }));
      const result = validatePlayersArray(players);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('players debe ser un array de 2-12 jugadores');
    });
  });

  describe('validateTotalPlayers', () => {
    test('debería validar total de jugadores correcto', () => {
      const result = validateTotalPlayers(4);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar total de jugadores mínimo', () => {
      const result = validateTotalPlayers(2);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar total de jugadores máximo', () => {
      const result = validateTotalPlayers(12);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería rechazar total de jugadores que no es número', () => {
      const result = validateTotalPlayers('4');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'totalPlayers debe ser un número entero entre 2-12'
      );
    });

    test('debería rechazar total de jugadores que no es entero', () => {
      const result = validateTotalPlayers(4.5);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'totalPlayers debe ser un número entero entre 2-12'
      );
    });

    test('debería rechazar total de jugadores muy bajo', () => {
      const result = validateTotalPlayers(1);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'totalPlayers debe ser un número entero entre 2-12'
      );
    });

    test('debería rechazar total de jugadores muy alto', () => {
      const result = validateTotalPlayers(13);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'totalPlayers debe ser un número entero entre 2-12'
      );
    });

    test('debería rechazar total de jugadores cero', () => {
      const result = validateTotalPlayers(0);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'totalPlayers debe ser un número entero entre 2-12'
      );
    });

    test('debería rechazar total de jugadores negativo', () => {
      const result = validateTotalPlayers(-1);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'totalPlayers debe ser un número entero entre 2-12'
      );
    });
  });

  describe('validateIncludeRandom', () => {
    test('debería validar includeRandom true', () => {
      const result = validateIncludeRandom(true);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar includeRandom false', () => {
      const result = validateIncludeRandom(false);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar includeRandom undefined', () => {
      const result = validateIncludeRandom(undefined);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar includeRandom null', () => {
      const result = validateIncludeRandom(null);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería rechazar includeRandom que no es booleano', () => {
      const result = validateIncludeRandom('true');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('includeRandom debe ser un booleano');
    });

    test('debería rechazar includeRandom número', () => {
      const result = validateIncludeRandom(1);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('includeRandom debe ser un booleano');
    });

    test('debería rechazar includeRandom string', () => {
      const result = validateIncludeRandom('false');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('includeRandom debe ser un booleano');
    });
  });

  describe('validateHumanName', () => {
    test('debería validar nombre humano correcto', () => {
      const result = validateHumanName('HumanPlayer');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar nombre humano de longitud mínima', () => {
      const result = validateHumanName('H');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar nombre humano de longitud máxima', () => {
      const longName = 'H'.repeat(32);
      const result = validateHumanName(longName);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar nombre humano undefined', () => {
      const result = validateHumanName(undefined);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar nombre humano null', () => {
      const result = validateHumanName(null);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería rechazar nombre humano que no es string', () => {
      const result = validateHumanName(123);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'humanName debe ser una cadena de 1-32 caracteres'
      );
    });

    test('debería rechazar nombre humano vacío', () => {
      const result = validateHumanName('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'humanName debe ser una cadena de 1-32 caracteres'
      );
    });

    test('debería rechazar nombre humano muy largo', () => {
      const longName = 'H'.repeat(33);
      const result = validateHumanName(longName);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'humanName debe ser una cadena de 1-32 caracteres'
      );
    });

    test('debería rechazar nombre humano con etiqueta script XSS', () => {
      const result = validateHumanName('<script>alert("xss")</script>');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('humanName contiene caracteres no permitidos');
    });

    test('debería rechazar nombre humano con protocolo javascript:', () => {
      const result = validateHumanName('javascript:alert("xss")');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('humanName contiene caracteres no permitidos');
    });

    test('debería rechazar nombre humano con manejador onclick', () => {
      const result = validateHumanName('onclick="alert(\'xss\')"');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('humanName contiene caracteres no permitidos');
    });

    test('debería aceptar nombre humano con caracteres especiales', () => {
      const result = validateHumanName('Human-Player_Test');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar nombre humano con números', () => {
      const result = validateHumanName('Human123');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar nombre humano con espacios', () => {
      const result = validateHumanName('Human Player');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('validateService', () => {
    test('debería validar servicio arbitrator', () => {
      const result = validateService('arbitrator');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar servicio player', () => {
      const result = validateService('player');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería validar servicio all', () => {
      const result = validateService('all');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar servicio undefined', () => {
      const result = validateService(undefined);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería aceptar servicio null', () => {
      const result = validateService(null);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('debería rechazar servicio inválido', () => {
      const result = validateService('invalid');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('service debe ser arbitrator, player o all');
    });

    test('debería rechazar servicio vacío', () => {
      const result = validateService('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('service debe ser arbitrator, player o all');
    });
  });
});
