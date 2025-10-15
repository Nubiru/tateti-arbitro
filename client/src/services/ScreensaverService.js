/**
 * Servicio de Protector de Pantalla
 * Servicio para lógica de negocio de pantalla de protector de pantalla - juegos simulados, ciclado
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

class ScreensaverService {
  /**
   * Obtener juegos simulados para visualización de protector de pantalla
   * @returns {Array} Array de objetos de juego simulados
   */
  static getSimulatedGames() {
    return [
      {
        player1: 'Bot Alpha',
        player2: 'Bot Beta',
        moves: 7,
        winner: 'Bot Alpha',
      },
      {
        player1: 'AI Master',
        player2: 'Code Warrior',
        moves: 5,
        winner: 'Code Warrior',
      },
      {
        player1: 'Logic King',
        player2: 'Strategy Pro',
        moves: 9,
        winner: 'Logic King',
      },
      {
        player1: 'Algorithm Ace',
        player2: 'Data Genius',
        moves: 6,
        winner: 'Data Genius',
      },
      {
        player1: 'Cyber Player',
        player2: 'Digital Mind',
        moves: 8,
        winner: 'Cyber Player',
      },
    ];
  }

  /**
   * Crear ciclador de juegos que rota a través de los juegos
   * @param {Array} games - Array de objetos de juego
   * @param {number} interval - Intervalo en milisegundos
   * @param {Function} onGameChange - Callback con nuevo índice de juego
   * @returns {Function} Función de limpieza para limpiar el intervalo
   */
  static createGameCycler(games, interval, onGameChange) {
    if (!Array.isArray(games) || games.length === 0) {
      return () => {}; // Limpieza sin operación
    }

    let currentIndex = 0;

    const cycler = setInterval(() => {
      currentIndex = this.getNextGame(currentIndex, games.length);
      if (onGameChange) {
        onGameChange(currentIndex);
      }
    }, interval);

    return () => clearInterval(cycler);
  }

  /**
   * Obtener siguiente índice de juego con envoltura
   * @param {number} currentIndex - Índice actual de juego
   * @param {number} totalGames - Número total de juegos
   * @returns {number} Siguiente índice de juego
   */
  static getNextGame(currentIndex, totalGames) {
    if (totalGames === 0) {
      return 0;
    }
    return (currentIndex + 1) % totalGames;
  }
}

export default ScreensaverService;
