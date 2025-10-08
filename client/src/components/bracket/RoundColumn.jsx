import React from 'react';
import MatchNode from './MatchNode';
import styles from './RoundColumn.module.css';

/**
 * Round Column Component
 * Displays a column of matches for a tournament round
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const RoundColumn = ({
  round,
  roundIndex,
  totalRounds,
  showRoundTitle = true,
  className = '',
}) => {
  if (!round || !round.matches) {
    return (
      <div className={`${styles.roundColumn} ${className}`}>
        <div className={styles.emptyRound}>
          <span className={styles.emptyText}>No hay partidas</span>
        </div>
      </div>
    );
  }

  const { matches, roundNumber } = round;
  const isFinal = roundIndex === totalRounds - 1;
  const roundTitle = isFinal ? 'Final' : `Ronda ${roundNumber}`;

  // Calcular estadísticas de ronda
  const totalMatches = matches.length;
  const completedMatches = matches.filter(
    match =>
      match.result === 'completed' ||
      match.result === 'win' ||
      match.result === 'error' ||
      match.result === 'draw'
  ).length;

  return (
    <div className={`${styles.roundColumn} ${className}`}>
      {showRoundTitle && (
        <div className={styles.roundHeader}>
          <h3 className={styles.roundTitle}>{roundTitle}</h3>
          <div className={styles.roundStats}>
            <span className={styles.matchCount}>
              {completedMatches}/{totalMatches}
            </span>
            <span className={styles.matchLabel}>partidas</span>
          </div>
        </div>
      )}

      <div className={styles.matchesContainer}>
        {matches.map((match, matchIndex) => (
          <MatchNode
            key={match.matchId || matchIndex}
            match={match}
            showResult={true}
            className={styles.matchNode}
          />
        ))}
      </div>

      {/* Round Progress Bar */}
      {totalMatches > 0 && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${(completedMatches / totalMatches) * 100}%`,
              }}
            />
          </div>
          <span className={styles.progressText}>
            {Math.round((completedMatches / totalMatches) * 100)}% completado
          </span>
        </div>
      )}
    </div>
  );
};

export default RoundColumn;
