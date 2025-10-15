/**
 * Servicio de Celebración
 * Servicio para lógica de negocio de pantalla de celebración - cuenta regresiva, cálculo de estadísticas
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

class CelebrationService {
  /**
   * Calcular estadísticas de juego desde resultado de partida o torneo
   * @param {Object|null} matchResult - Objeto resultado de partida
   * @param {Object|null} tournamentResult - Objeto resultado de torneo
   * @returns {Object} Objeto de estadísticas formateado
   */
  static calculateGameStatistics(matchResult, tournamentResult) {
    const result = matchResult || tournamentResult;

    if (!result) {
      return this.getEmptyStatistics();
    }

    const winner = result.winner;
    const history = result.history || [];
    const movesCount = history.length;
    const gameTime = result.gameTime || 'N/A';

    // Conteos de movimientos por jugador
    const player1Moves = history.filter(h => h.playerId === 'player1').length;
    const player2Moves = history.filter(h => h.playerId === 'player2').length;

    // Específico de torneo
    const totalRounds = tournamentResult?.totalRounds || 1;
    const totalMatches = tournamentResult?.totalMatches || 1;
    const averageTime = tournamentResult
      ? tournamentResult.averageTime || gameTime
      : gameTime;

    return {
      winner,
      movesCount,
      gameTime,
      player1Moves,
      player2Moves,
      totalRounds,
      totalMatches,
      averageTime,
    };
  }

  /**
   * Formatear movimientos de jugadores desde historial
   * @param {Array} history - Array de historial de juego
   * @returns {Object} Conteos de movimientos por jugador
   */
  static formatPlayerMoves(history) {
    if (!Array.isArray(history)) {
      return { player1Moves: 0, player2Moves: 0 };
    }

    return {
      player1Moves: history.filter(h => h.playerId === 'player1').length,
      player2Moves: history.filter(h => h.playerId === 'player2').length,
    };
  }

  /**
   * Obtener metadatos de juego desde resultado
   * @param {Object} result - Resultado de partida o torneo
   * @param {Object|null} tournamentResult - Resultado de torneo (opcional)
   * @returns {Object} Metadatos de juego
   */
  static getGameMetadata(result, tournamentResult) {
    if (!result) {
      return {
        gameMode: 'Individual',
        boardSize: '3x3',
        speed: 'normal',
        noTie: false,
        winningLine: null,
      };
    }

    return {
      gameMode: result.gameMode || (tournamentResult ? 'Torneo' : 'Individual'),
      boardSize: result.boardSize || '3x3',
      speed: result.speed || 'normal',
      noTie: result.noTie || false,
      winningLine: result.winningLine || null,
    };
  }

  /**
   * Crear temporizador de cuenta regresiva
   * @param {number} duration - Duración en segundos
   * @param {Function} onTick - Llamado cada segundo con tiempo restante
   * @param {Function} onComplete - Llamado cuando la cuenta regresiva llega a 0
   * @returns {Function} Función de limpieza para limpiar el temporizador
   */
  static createCountdownTimer(duration, onTick, onComplete) {
    let remaining = duration;

    const timer = setInterval(() => {
      remaining -= 1;

      // Siempre llamar onTick con el nuevo valor restante (incluyendo 0)
      if (onTick) {
        onTick(remaining);
      }

      // Verificar si la cuenta regresiva está completa
      if (remaining <= 0) {
        clearInterval(timer);
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }

  /**
   * Obtener objeto de estadísticas vacío
   * @returns {Object} Estadísticas vacías
   */
  static getEmptyStatistics() {
    return {
      winner: null,
      movesCount: 0,
      gameTime: 'N/A',
      player1Moves: 0,
      player2Moves: 0,
      totalRounds: 1,
      totalMatches: 1,
      averageTime: 'N/A',
    };
  }
}

export default CelebrationService;
