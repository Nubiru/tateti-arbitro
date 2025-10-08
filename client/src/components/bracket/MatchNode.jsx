import React from 'react';
import styles from './MatchNode.module.css';

/**
 * Match Node Component
 * Displays individual tournament match information
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const MatchNode = ({
  match,
  // isWinner,
  // isLoser,
  showResult = true,
  className = '',
}) => {
  if (!match) {
    return (
      <div className={`${styles.matchNode} ${styles.empty} ${className}`}>
        <div className={styles.emptyMatch}>-</div>
      </div>
    );
  }

  const { player1, player2, result, winner, matchId } = match;
  const isCompleted = result === 'completed' || result === 'win';
  const isError = result === 'error';
  const isDraw = result === 'draw';

  // Obtener información de visualización del jugador
  const getPlayerInfo = player => {
    if (!player) return { name: 'TBD', port: '', symbol: '' };
    return {
      name: player.name || 'Unknown',
      port: player.port || '',
      symbol: player.symbol || '',
    };
  };

  const player1Info = getPlayerInfo(player1);
  const player2Info = getPlayerInfo(player2);

  // Determinar clases de ganador/perdedor
  const getPlayerClass = player => {
    if (!isCompleted || !winner) return '';
    if (winner.id === player?.id) return styles.winner;
    return styles.loser;
  };

  return (
    <div className={`${styles.matchNode} ${className}`}>
      <div className={styles.matchHeader}>
        <span className={styles.matchId}>Match {matchId}</span>
        {isCompleted && (
          <span className={styles.matchStatus}>
            {isError ? 'Error' : isDraw ? 'Empate' : 'Completado'}
          </span>
        )}
      </div>

      <div className={styles.playersContainer}>
        {/* Player 1 */}
        <div className={`${styles.player} ${getPlayerClass(player1)}`}>
          <div className={styles.playerInfo}>
            <span className={styles.playerName}>
              {player1Info.name}
              {player1Info.port && `:${player1Info.port}`}
            </span>
            {player1Info.symbol && (
              <span className={styles.playerSymbol}>{player1Info.symbol}</span>
            )}
          </div>
        </div>

        {/* VS */}
        <div className={styles.vs}>vs</div>

        {/* Player 2 */}
        <div className={`${styles.player} ${getPlayerClass(player2)}`}>
          <div className={styles.playerInfo}>
            <span className={styles.playerName}>
              {player2Info.name}
              {player2Info.port && `:${player2Info.port}`}
            </span>
            {player2Info.symbol && (
              <span className={styles.playerSymbol}>{player2Info.symbol}</span>
            )}
          </div>
        </div>
      </div>

      {/* Match Result */}
      {showResult && isCompleted && winner && (
        <div className={styles.matchResult}>
          <span className={styles.winnerText}>Ganó: {winner.name}</span>
        </div>
      )}

      {showResult && isError && (
        <div className={styles.matchResult}>
          <span className={styles.errorText}>Error</span>
        </div>
      )}

      {showResult && isDraw && (
        <div className={styles.matchResult}>
          <span className={styles.drawText}>Empate</span>
        </div>
      )}
    </div>
  );
};

export default MatchNode;
