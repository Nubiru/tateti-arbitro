import React, { useState, useEffect } from 'react';
import styles from './CelebrationScreen.module.css';
import GameOptionsService from '../services/GameOptionsService';
import CelebrationService from '../services/CelebrationService';

/**
 * Celebration Screen Component
 * Winner celebration with auto-return
 * @lastModified 2025-10-09
 * @version 2.0.0
 */

const CelebrationScreen = ({
  matchResult,
  tournamentResult,
  onReturn,
  onActivity,
}) => {
  const [countdown, setCountdown] = useState(60);
  const [isVisible, setIsVisible] = useState(false);

  // Extract statistics using service
  const stats = CelebrationService.calculateGameStatistics(
    matchResult,
    tournamentResult
  );
  const metadata = CelebrationService.getGameMetadata(
    matchResult || tournamentResult,
    tournamentResult
  );

  const {
    winner,
    movesCount,
    gameTime,
    player1Moves,
    player2Moves,
    totalRounds,
    totalMatches,
    averageTime,
  } = stats;
  const {
    gameMode,
    boardSize,
    speed,
    noTie: noTieMode,
    winningLine,
  } = metadata;

  // Winner's winning line/pattern - using GameOptionsService
  const winningPattern = GameOptionsService.formatWinningLine(winningLine);

  useEffect(() => {
    onActivity();
    setIsVisible(true);

    // Countdown timer using service
    const cleanup = CelebrationService.createCountdownTimer(
      60,
      remaining => setCountdown(remaining),
      () => onReturn()
    );

    return cleanup;
  }, [onReturn, onActivity]);

  const handleReturnClick = () => {
    onActivity();
    onReturn();
  };

  return (
    <div className={styles.celebrationScreen}>
      <div className={styles.celebrationContainer}>
        {/* Confetti Animation */}
        <div className={styles.confetti}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`${styles.confettiPiece} ${
                styles[`confetti${i % 5}`]
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Winner Display */}
        <div
          className={`${styles.winnerDisplay} ${
            isVisible ? 'animate-fade-in' : ''
          }`}
        >
          <div className={`${styles.winnerIcon} animate-bounce`}>🏆</div>
          <h1 className={styles.winnerTitle}>¡Felicidades!</h1>
          <h2 className={styles.winnerName}>
            {winner
              ? `${GameOptionsService.getPlayerName(winner)} ganó!`
              : tournamentResult
                ? 'Ganador del Torneo'
                : 'Partida Completada'}
          </h2>
          <p className={styles.winnerMessage}>
            {winner
              ? `${GameOptionsService.getPlayerName(winner)} ha demostrado ser el mejor jugador de Ta-Te-Ti`
              : 'La partida ha terminado'}
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className={`${styles.celebrationActions} ${
            isVisible ? 'animate-fade-in' : ''
          }`}
        >
          <button
            className={`btn btn-primary ${styles.returnButton}`}
            onClick={handleReturnClick}
          >
            Volver al Inicio
          </button>
          <div className={styles.countdown}>
            Regresando automáticamente en {countdown}s
          </div>
        </div>

        {/* Enhanced Stats Display */}
        <div
          className={`${styles.celebrationStats} ${
            isVisible ? 'animate-fade-in' : ''
          }`}
        >
          {/* All Statistics in Flex Inline Layout */}
          <div className={styles.statsSection}>
            <h3 className={styles.statsSectionTitle}>Estadísticas del Juego</h3>
            <div className={styles.statsInlineGrid}>
              {/* Game Configuration */}
              <div className={styles.statItem}>
                <div className={styles.statIcon}>🎯</div>
                <div className={styles.statLabel}>Modo</div>
                <div className={styles.statValue}>{gameMode}</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statIcon}>📐</div>
                <div className={styles.statLabel}>Tablero</div>
                <div className={styles.statValue}>{boardSize}</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statIcon}>⚡</div>
                <div className={styles.statLabel}>Velocidad</div>
                <div className={styles.statValue}>{speed}</div>
              </div>
              {noTieMode && (
                <div className={styles.statItem}>
                  <div className={styles.statIcon}>♾️</div>
                  <div className={styles.statLabel}>Sin Empates</div>
                  <div className={styles.statValue}>Sí</div>
                </div>
              )}

              {/* Game Statistics */}
              <div className={styles.statItem}>
                <div className={styles.statIcon}>🎮</div>
                <div className={styles.statLabel}>Total Movimientos</div>
                <div className={styles.statValue}>{movesCount}</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statIcon}>⏱️</div>
                <div className={styles.statLabel}>Duración</div>
                <div className={styles.statValue}>{gameTime}</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statIcon}>🏆</div>
                <div className={styles.statLabel}>Patrón Ganador</div>
                <div className={styles.statValue}>{winningPattern}</div>
              </div>

              {/* Per-Player Statistics */}
              <div className={styles.statItem}>
                <div className={styles.statIcon}>👤</div>
                <div className={styles.statLabel}>Jugador 1</div>
                <div className={styles.statValue}>{player1Moves}</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statIcon}>👤</div>
                <div className={styles.statLabel}>Jugador 2</div>
                <div className={styles.statValue}>{player2Moves}</div>
              </div>
            </div>
          </div>

          {/* Tournament Statistics (if applicable) */}
          {tournamentResult && (
            <div className={styles.statsSection}>
              <h3 className={styles.statsSectionTitle}>
                Estadísticas del Torneo
              </h3>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statIcon}>🏆</div>
                  <div className={styles.statLabel}>Rondas</div>
                  <div className={styles.statValue}>{totalRounds}</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statIcon}>🎮</div>
                  <div className={styles.statLabel}>Partidas</div>
                  <div className={styles.statValue}>{totalMatches}</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statIcon}>⏱️</div>
                  <div className={styles.statLabel}>Tiempo Promedio</div>
                  <div className={styles.statValue}>{averageTime}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CelebrationScreen;
