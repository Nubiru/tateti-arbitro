/**
 * Pruebas Unitarias: gameHelpers - Todas las funciones auxiliares
 * Pruebas de funciones puras - ejecución síncrona e instantánea
 * @lastModified 2025-10-10
 * @version 1.0.0
 */

import {
  getDelayForSpeed,
  validateMoveRequest,
  createMoveQueueItem,
  getPlayerIdForTurn,
  formatGameConfig,
} from '../../../src/context/gameHelpers';

describe('getDelayForSpeed', () => {
  test('debería retornar 3000ms para slow', () => {
    expect(getDelayForSpeed('slow')).toBe(3000);
  });

  test('debería retornar 2000ms para normal', () => {
    expect(getDelayForSpeed('normal')).toBe(2000);
  });

  test('debería retornar 1000ms para fast', () => {
    expect(getDelayForSpeed('fast')).toBe(1000);
  });

  test('debería usar 2000ms por defecto para velocidad desconocida', () => {
    expect(getDelayForSpeed('unknown')).toBe(2000);
  });

  test('debería usar 2000ms por defecto para null', () => {
    expect(getDelayForSpeed(null)).toBe(2000);
  });

  test('debería usar 2000ms por defecto para undefined', () => {
    expect(getDelayForSpeed(undefined)).toBe(2000);
  });

  test('debería usar 2000ms por defecto para string vacío', () => {
    expect(getDelayForSpeed('')).toBe(2000);
  });
});

describe('validateMoveRequest', () => {
  test('no debería lanzar error para movimiento 3x3 válido', () => {
    expect(() => {
      validateMoveRequest('match-123', 4, 9);
    }).not.toThrow();
  });

  test('no debería lanzar error para movimiento 5x5 válido', () => {
    expect(() => {
      validateMoveRequest('match-456', 12, 25);
    }).not.toThrow();
  });

  test('debería lanzar error si matchId es null', () => {
    expect(() => {
      validateMoveRequest(null, 4, 9);
    }).toThrow('No active match found');
  });

  test('debería lanzar error si matchId es undefined', () => {
    expect(() => {
      validateMoveRequest(undefined, 4, 9);
    }).toThrow('No active match found');
  });

  test('debería lanzar error si matchId es string vacío', () => {
    expect(() => {
      validateMoveRequest('', 4, 9);
    }).toThrow('No active match found');
  });

  test('debería lanzar error si position no es un número', () => {
    expect(() => {
      validateMoveRequest('match-123', '4', 9);
    }).toThrow('Invalid position: must be a number');
  });

  test('debería lanzar error si position < 0', () => {
    expect(() => {
      validateMoveRequest('match-123', -1, 9);
    }).toThrow('Invalid position: must be between 0 and 8');
  });

  test('debería lanzar error si position >= boardSize', () => {
    expect(() => {
      validateMoveRequest('match-123', 9, 9);
    }).toThrow('Invalid position: must be between 0 and 8');
  });

  test('debería lanzar error si position > 24 para tablero 5x5', () => {
    expect(() => {
      validateMoveRequest('match-456', 25, 25);
    }).toThrow('Invalid position: must be between 0 and 24');
  });

  test('debería usar boardSize por defecto de 9', () => {
    expect(() => {
      validateMoveRequest('match-123', 8);
    }).not.toThrow();
  });
});

describe('createMoveQueueItem', () => {
  test('debería crear elemento de cola con estructura correcta', () => {
    const data = {
      player: { name: 'Player1' },
      move: 4,
      board: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    };

    const result = createMoveQueueItem(data);

    expect(result.type).toBe('move');
    expect(result.data).toEqual(data);
    expect(result.timestamp).toBeGreaterThan(0);
    expect(typeof result.timestamp).toBe('number');
  });

  test('debería crear timestamps únicos para llamadas secuenciales', () => {
    const item1 = createMoveQueueItem({ move: 0 });
    const item2 = createMoveQueueItem({ move: 1 });

    expect(item2.timestamp).toBeGreaterThanOrEqual(item1.timestamp);
  });
});

describe('getPlayerIdForTurn', () => {
  test('debería retornar player1 para moveCount par', () => {
    expect(getPlayerIdForTurn(0)).toBe('player1');
    expect(getPlayerIdForTurn(2)).toBe('player1');
    expect(getPlayerIdForTurn(4)).toBe('player1');
  });

  test('debería retornar player2 para moveCount impar', () => {
    expect(getPlayerIdForTurn(1)).toBe('player2');
    expect(getPlayerIdForTurn(3)).toBe('player2');
    expect(getPlayerIdForTurn(5)).toBe('player2');
  });
});

describe('formatGameConfig', () => {
  test('debería aplicar valores por defecto para opciones vacías', () => {
    const result = formatGameConfig({});

    expect(result).toEqual({
      speed: 'normal',
      boardSize: '3x3',
      noTie: false,
    });
  });

  test('debería aplicar valores por defecto para undefined', () => {
    const result = formatGameConfig(undefined);

    expect(result).toEqual({
      speed: 'normal',
      boardSize: '3x3',
      noTie: false,
    });
  });

  test('debería preservar valores proporcionados', () => {
    const result = formatGameConfig({
      speed: 'slow',
      boardSize: '5x5',
      noTie: true,
    });

    expect(result).toEqual({
      speed: 'slow',
      boardSize: '5x5',
      noTie: true,
    });
  });

  test('debería mezclar valores proporcionados y por defecto', () => {
    const result = formatGameConfig({
      speed: 'fast',
    });

    expect(result).toEqual({
      speed: 'fast',
      boardSize: '3x3',
      noTie: false,
    });
  });
});
