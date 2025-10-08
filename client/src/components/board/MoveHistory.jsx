import React from 'react';
import styles from './MoveHistory.module.css';

/**
 * Move History Component
 * Displays a list of recent moves
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const MoveHistory = ({
  history = [],
  maxMoves = 10,
  showNumbers = true,
  className = '',
}) => {
  // Obtener movimientos recientes (últimos maxMoves)
  const recentMoves = history.slice(-maxMoves);

  // Formatear movimiento para visualización
  const formatMove = (move, index) => {
    if (!move) return null;

    const { player, position, symbol } = move;
    const moveNumber = showNumbers ? index + 1 : '';

    return {
      number: moveNumber,
      player: player || 'Unknown',
      position: position !== undefined ? position : 'N/A',
      symbol: symbol || '?',
    };
  };

  return (
    <div className={`${styles.moveHistory} ${className}`}>
      <h4 className={styles.historyTitle}>Historial de Movimientos</h4>
      <div className={styles.movesList}>
        {recentMoves.length === 0 ? (
          <div className={styles.noMoves}>
            <span className={styles.noMovesIcon}>📝</span>
            <span className={styles.noMovesText}>No hay movimientos aún</span>
          </div>
        ) : (
          recentMoves.map((move, index) => {
            const formattedMove = formatMove(move, index);
            if (!formattedMove) return null;

            return (
              <div key={index} className={styles.moveItem}>
                {showNumbers && (
                  <span className={styles.moveNumber}>
                    {formattedMove.number}.
                  </span>
                )}
                <span className={styles.movePlayer}>
                  {formattedMove.player}
                </span>
                <span className={styles.moveSymbol}>
                  {formattedMove.symbol}
                </span>
                <span className={styles.movePosition}>
                  Pos: {formattedMove.position}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
