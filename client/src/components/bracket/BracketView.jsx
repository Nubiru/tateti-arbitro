import React from 'react';
import styles from './BracketView.module.css';

/**
 * BracketView Component
 * Visualizes the tournament bracket
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const BracketView = ({ tournament, config }) => {
  if (!tournament || !tournament.bracket || tournament.bracket.length === 0) {
    return (
      <div className={styles.bracketPlaceholder}>
        <div className={styles.placeholderIcon}>🏆</div>
        <h2>No hay datos del torneo disponibles</h2>
        <p>Esperando datos del torneo para generar el bracket.</p>
        {config && config.gameMode === 'tournament' && (
          <p>
            Configuración: {config.tournamentSize} jugadores,{' '}
            {config.noTie ? 'sin empate' : 'con empate'}
          </p>
        )}
      </div>
    );
  }

  const getPlayerColor = playerId => {
    const colors = [
      '#3B82F6',
      '#EF4444',
      '#10B981',
      '#F59E0B',
      '#8B5CF6',
      '#EC4899',
      '#06B6D4',
      '#84CC16',
    ];
    return colors[playerId % colors.length];
  };

  const renderMatch = (match, roundIndex) => {
    const isCompleted = match.result === 'completed' || match.result === 'win';
    const isWinner = player => match.winner && match.winner.id === player.id;
    const isLoser = player => match.winner && match.winner.id !== player.id;

    return (
      <div key={match.matchId} className={styles.matchCard}>
        <div className={styles.matchHeader}>
          <span className={styles.matchId}>Match {roundIndex + 1}</span>
          <span className={styles.matchStatus}>
            {isCompleted ? '✅' : match.result === 'pending' ? '⏸️' : '⏳'}
          </span>
        </div>

        <div className={styles.playersContainer}>
          <div
            className={`${styles.player} ${
              isWinner(match.player1)
                ? styles.winner
                : isLoser(match.player1)
                  ? styles.loser
                  : ''
            }`}
            style={{
              backgroundColor: isWinner(match.player1)
                ? getPlayerColor(match.player1.id)
                : '#f3f4f6',
              color: isWinner(match.player1) ? 'white' : '#374151',
            }}
          >
            <span className={styles.playerName}>
              {match.player1.name}
              <span className={styles.playerPort}>:{match.player1.port}</span>
            </span>
            {isWinner(match.player1) && (
              <span className={styles.winnerBadge}>👑</span>
            )}
          </div>

          <div className={styles.vs}>vs</div>

          <div
            className={`${styles.player} ${
              isWinner(match.player2)
                ? styles.winner
                : isLoser(match.player2)
                  ? styles.loser
                  : ''
            }`}
            style={{
              backgroundColor: isWinner(match.player2)
                ? getPlayerColor(match.player2.id)
                : '#f3f4f6',
              color: isWinner(match.player2) ? 'white' : '#374151',
            }}
          >
            <span className={styles.playerName}>
              {match.player2.name}
              <span className={styles.playerPort}>:{match.player2.port}</span>
            </span>
            {isWinner(match.player2) && (
              <span className={styles.winnerBadge}>👑</span>
            )}
          </div>
        </div>

        {isCompleted && match.winner && (
          <div className={styles.matchResult}>
            <span className={styles.winnerText}>Ganó: {match.winner.name}</span>
          </div>
        )}

        {match.result === 'error' && (
          <div className={styles.matchResult}>
            <span className={styles.errorText}>Error</span>
          </div>
        )}

        {match.result === 'draw' && (
          <div className={styles.matchResult}>
            <span className={styles.drawText}>Empate</span>
          </div>
        )}
      </div>
    );
  };

  const renderRound = (round, roundIndex) => {
    const roundTitle =
      roundIndex === tournament.bracket.length - 1
        ? 'Final'
        : `Ronda ${round.roundNumber}`;

    return (
      <div key={roundIndex} className={styles.tournamentRound}>
        <div className={styles.roundHeader}>
          <h3 className={styles.roundTitle}>{roundTitle}</h3>
          <span className={styles.roundStatus}>
            {round.status === 'completed'
              ? '✅ Completada'
              : round.status === 'in_progress'
                ? '⚡ En Progreso'
                : '⏳ Pendiente'}
          </span>
        </div>

        <div className={styles.roundMatches}>
          {round.matches.map(match => renderMatch(match, roundIndex))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.bracketView}>
      <div className={styles.bracketHeader}>
        <h2 className={styles.bracketTitle}>Llave del Torneo</h2>
        <div className={styles.tournamentInfo}>
          <span className={styles.infoItem}>
            <strong>Jugadores:</strong> {tournament.players?.length || 0}
          </span>
          <span className={styles.infoItem}>
            <strong>Partidas:</strong> {tournament.totalMatches || 0}
          </span>
          <span className={styles.infoItem}>
            <strong>Completadas:</strong> {tournament.completedMatches || 0}
          </span>
          {config && (
            <span className={styles.infoItem}>
              <strong>Modo:</strong>{' '}
              {config.noTie ? 'Sin Empate' : 'Con Empate'}
            </span>
          )}
        </div>
      </div>

      <div className={styles.bracketContent}>
        {tournament.bracket.map((round, index) => renderRound(round, index))}
      </div>

      {tournament.winner && (
        <div className={styles.tournamentWinner}>
          <div className={styles.winnerCrown}>👑</div>
          <h3 className={styles.winnerName}>{tournament.winner.name}</h3>
          <p className={styles.winnerMessage}>¡Campeón!</p>
          <p className={styles.winnerPort}>Puerto: {tournament.winner.port}</p>
        </div>
      )}

      {tournament.runnerUp && (
        <div className={styles.tournamentRunnerUp}>
          <h4 className={styles.runnerUpTitle}>Subcampeón</h4>
          <p className={styles.runnerUpName}>{tournament.runnerUp.name}</p>
        </div>
      )}
    </div>
  );
};

export default BracketView;
