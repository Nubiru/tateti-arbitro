/**
 * Regla del Modo Infinito - Mecánica de Ventana Deslizante
 * Cada jugador solo puede tener 3 marcas en el tablero en cualquier momento.
 * Cuando se juega el 6to movimiento, se elimina el movimiento más antiguo.
 *
 * Inspirado en la variante "Tic Tac Infinity" que previene empates
 * eliminando automáticamente la marca más antigua cuando el tablero alcanza 6 piezas.
 *
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

/**
 * Umbral para modo infinito - cuándo comenzar a eliminar movimientos
 * Cada jugador puede tener máximo 3 marcas (6 total en el tablero)
 * @constant {number}
 */
export const INFINITY_THRESHOLD = 6;

/**
 * Determina si el movimiento más antiguo debe ser eliminado
 * @param {Array} moveHistory - Array de objetos de historial de movimientos
 * @returns {boolean} True si la longitud de moveHistory >= INFINITY_THRESHOLD
 */
export function shouldRemoveOldestMove(moveHistory) {
  if (!moveHistory || !Array.isArray(moveHistory)) return false;
  return moveHistory.length >= INFINITY_THRESHOLD;
}

/**
 * Obtiene la posición del movimiento más antiguo a ser eliminado
 * @param {Array} moveHistory - Array de objetos de historial de movimientos con propiedad 'move'
 * @returns {number|null} Posición a eliminar, o null si no se necesita eliminación
 */
export function getRemovalPosition(moveHistory) {
  if (!shouldRemoveOldestMove(moveHistory)) return null;
  if (!moveHistory[0] || typeof moveHistory[0].move !== 'number') return null;
  return moveHistory[0].move;
}

/**
 * Obtiene la información del jugador para el movimiento que se está eliminando
 * @param {Array} moveHistory - Array de objetos de historial de movimientos con propiedad 'playerId'
 * @param {Array} players - Array de objetos de jugador con propiedades 'id' y 'name'
 * @returns {Object|null} Objeto jugador con id y name, o null si no se necesita eliminación
 */
export function getRemovalPlayer(moveHistory, players) {
  if (!shouldRemoveOldestMove(moveHistory)) return null;
  if (!moveHistory[0] || !moveHistory[0].playerId) return null;
  if (!Array.isArray(players) || players.length < 2) return null;

  const oldest = moveHistory[0];
  return {
    id: oldest.playerId,
    name: oldest.playerId === players[0].id ? players[0].name : players[1].name,
  };
}
