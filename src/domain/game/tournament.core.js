/**
 * Lógica Central del Torneo
 * Lógica de dominio pura para gestión de torneos
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

/**
 * Verificar si un número es una potencia de dos
 * @param {number} n - Número a verificar
 * @returns {boolean} Verdadero si es potencia de dos
 */
export function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Calcular total de partidas necesarias para el torneo
 * @param {number} playerCount - Número de jugadores
 * @returns {number} Total de partidas necesarias
 */
export function calculateTotalMatches(playerCount) {
  return playerCount - 1;
}

/**
 * Crear llave de torneo con BYEs para conteos de jugadores que no son potencia de dos
 * @param {Array} players - Array de jugadores
 * @returns {Array} Estructura de llave de torneo
 */
export function createBracketWithByes(players) {
  const playerCount = players.length;
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(playerCount)));
  const byesNeeded = nextPowerOfTwo - playerCount;

  // Crear array de jugadores con BYEs
  const playersWithByes = [...players];
  for (let i = 0; i < byesNeeded; i++) {
    playersWithByes.push({ name: 'BYE', port: null, isBye: true });
  }

  // Mezclar para distribuir BYEs más uniformemente
  for (let i = playersWithByes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playersWithByes[i], playersWithByes[j]] = [
      playersWithByes[j],
      playersWithByes[i],
    ];
  }

  const totalRounds = Math.log2(nextPowerOfTwo);
  const bracket = [];

  // Primera ronda
  const firstRound = {
    round: 1,
    matches: [],
  };

  for (let i = 0; i < nextPowerOfTwo; i += 2) {
    firstRound.matches.push({
      player1: playersWithByes[i],
      player2: playersWithByes[i + 1],
    });
  }

  bracket.push(firstRound);

  // Rondas subsecuentes
  for (let round = 2; round <= totalRounds; round++) {
    const roundMatches = Math.pow(2, totalRounds - round);
    const roundData = {
      round: round,
      matches: [],
    };

    for (let i = 0; i < roundMatches; i++) {
      roundData.matches.push({
        player1: null, // Será llenado por los ganadores
        player2: null,
      });
    }

    bracket.push(roundData);
  }

  return bracket;
}

/**
 * Crear llave de torneo
 * @param {Array} players - Array de jugadores
 * @returns {Array} Estructura de llave de torneo
 */
export function createBracket(players) {
  const playerCount = players.length;

  if (isPowerOfTwo(playerCount)) {
    // Usar lógica original para potencia de dos
    const totalRounds = Math.log2(playerCount);
    const bracket = [];

    // Primera ronda
    const firstRound = {
      round: 1,
      matches: [],
    };

    for (let i = 0; i < playerCount; i += 2) {
      firstRound.matches.push({
        player1: players[i],
        player2: players[i + 1],
      });
    }

    bracket.push(firstRound);

    // Rondas subsecuentes
    for (let round = 2; round <= totalRounds; round++) {
      const roundMatches = Math.pow(2, totalRounds - round);
      const roundData = {
        round: round,
        matches: [],
      };

      for (let i = 0; i < roundMatches; i++) {
        roundData.matches.push({
          player1: null, // Será llenado por los ganadores
          player2: null,
        });
      }

      bracket.push(roundData);
    }

    return bracket;
  } else {
    // Usar lógica BYE para no potencia de dos
    return createBracketWithByes(players);
  }
}

/**
 * Ejecutar una sola ronda de partidas
 * @param {Array} round - Datos de la ronda
 * @param {Function} matchFunction - Función para ejecutar cada partida
 * @returns {Array} Array de ganadores
 */
export function executeRound(round, matchFunction) {
  const winners = [];

  for (const match of round.matches) {
    // Manejar partidas BYE - avanzar automáticamente al jugador no-BYE
    if (match.player1 && match.player1.isBye) {
      winners.push(match.player2);
    } else if (match.player2 && match.player2.isBye) {
      winners.push(match.player1);
    } else if (match.player1 && match.player2) {
      // Ambos jugadores son reales - ejecutar la partida
      try {
        const result = matchFunction(match);
        if (result && result.winner) {
          winners.push(result.winner);
        } else {
          // Manejar empate o error seleccionando jugador1
          winners.push(match.player1);
        }
      } catch (error) {
        // Manejar error seleccionando jugador1
        winners.push(match.player1);
      }
    } else {
      // Uno o ambos jugadores son null (no debería pasar en la primera ronda)
      // Esto maneja casos donde la ronda anterior no llenó todos los espacios
      if (match.player1) {
        winners.push(match.player1);
      } else if (match.player2) {
        winners.push(match.player2);
      }
    }
  }

  return winners;
}

/**
 * Verificar si el torneo está completo
 * @param {Array} bracket - Llave de torneo
 * @returns {boolean} Verdadero si el torneo está completo
 */
export function isTournamentComplete(bracket) {
  const lastRound = bracket[bracket.length - 1];
  const finalMatch = lastRound.matches[0];

  // El torneo está completo cuando la partida final tiene ambos jugadores determinados
  // (es decir, tanto player1 como player2 no son null)
  return (
    lastRound.matches.length === 1 &&
    finalMatch.player1 !== null &&
    finalMatch.player2 !== null
  );
}

/**
 * Obtener ganadores del torneo (ganador y subcampeón)
 * @param {Array} players - Array original de jugadores
 * @param {Array} bracket - Llave de torneo
 * @returns {Object} Ganador y subcampeón
 */
export function getTournamentWinners(players, bracket) {
  const lastRound = bracket[bracket.length - 1];
  const finalMatch = lastRound.matches[0];

  return {
    winner: finalMatch.player1,
    runnerUp: finalMatch.player2,
  };
}

/**
 * Mezclar array de jugadores
 * @param {Array} players - Array de jugadores
 * @returns {Array} Array mezclado
 */
export function shufflePlayers(players) {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Validar jugadores para el torneo
 * @param {Array} players - Array de jugadores
 * @throws {Error} Si la validación falla
 */
export function validateTournamentPlayers(players) {
  if (!Array.isArray(players)) {
    throw new Error('Los jugadores deben ser un array');
  }

  if (players.length < 2) {
    throw new Error('Se necesitan al menos 2 jugadores para el torneo');
  }

  if (players.length > 12) {
    throw new Error('El torneo puede tener máximo 12 jugadores');
  }

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (!player || typeof player !== 'object') {
      throw new Error(`Jugador ${i + 1} debe ser un objeto`);
    }
    if (!player.name || typeof player.name !== 'string') {
      throw new Error(`Jugador ${i + 1} debe tener un nombre válido`);
    }
    // Permitir puertos null para jugadores BYE
    if (
      player.port !== null &&
      (typeof player.port !== 'number' ||
        player.port < 3000 ||
        player.port > 9999)
    ) {
      throw new Error(
        `Jugador ${i + 1} debe tener un puerto válido entre 3000-9999`
      );
    }
  }
}

/**
 * Obtener información de la ronda
 * @param {number} roundNumber - Número de ronda
 * @param {number} totalRounds - Total de rondas en el torneo
 * @returns {Object} Información de la ronda
 */
export function getRoundInfo(roundNumber, totalRounds) {
  return {
    round: roundNumber,
    totalRounds: totalRounds,
    isFirstRound: roundNumber === 1,
    isFinalRound: roundNumber === totalRounds,
    isSemiFinal: roundNumber === totalRounds - 1,
  };
}

/**
 * Calcular progreso del torneo
 * @param {Array} bracket - Llave de torneo
 * @param {number} completedMatches - Número de partidas completadas
 * @returns {Object} Información de progreso
 */
export function calculateProgress(bracket, completedMatches) {
  const totalMatches = calculateTotalMatches(bracket[0].matches.length * 2);
  const percentage = Math.round((completedMatches / totalMatches) * 100);

  return {
    completedMatches,
    totalMatches,
    percentage,
    remainingMatches: totalMatches - completedMatches,
  };
}
