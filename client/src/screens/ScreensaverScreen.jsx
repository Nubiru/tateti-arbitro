import React, { useState, useEffect } from 'react';
import styles from './ScreensaverScreen.module.css';
import ScreensaverService from '../services/ScreensaverService';

/**
 * Screensaver Screen Component
 * UPC branding with animated elements
 * @lastModified 2025-10-09
 * @version 2.0.0
 */

const ScreensaverScreen = ({ onReturn, onActivity }) => {
  const [currentGame, setCurrentGame] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Get simulated games from service
  const simulatedGames = ScreensaverService.getSimulatedGames();

  useEffect(() => {
    setIsVisible(true);

    // Game cycler using service
    const cleanup = ScreensaverService.createGameCycler(
      simulatedGames,
      5000,
      newIndex => setCurrentGame(newIndex)
    );

    return cleanup;
  }, [simulatedGames]);

  const handleScreenClick = () => {
    onActivity();
    onReturn();
  };

  const currentGameData = simulatedGames[currentGame];

  return (
    <div className={styles.screensaverScreen} onClick={handleScreenClick}>
      <div className={styles.screensaverContainer}>
        {/* Animated UPC Logo */}
        <div
          className={`${styles.upcLogo} ${isVisible ? 'animate-fade-in' : ''}`}
        >
          <div className={`${styles.logoText} animate-bounce`}>UPC</div>
          <div className={styles.logoSubtitle}>Programación Full Stack</div>
        </div>

        {/* Floating Game Elements */}
        <div className={styles.gameElements}>
          <div className={styles.floatingBoard}>
            <div className={styles.miniBoard}>
              {Array(9)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className={styles.miniCell}>
                    {i < 6 && (i % 2 === 0 ? 'X' : 'O')}
                  </div>
                ))}
            </div>
          </div>

          <div className={styles.floatingSymbols}>
            <div className={`${styles.symbol} ${styles.symbolX}`}>X</div>
            <div className={`${styles.symbol} ${styles.symbolO}`}>O</div>
            <div className={`${styles.symbol} ${styles.symbolX}`}>X</div>
            <div className={`${styles.symbol} ${styles.symbolO}`}>O</div>
          </div>
        </div>

        {/* Simulated Game Display */}
        <div
          className={`${styles.simulatedGame} ${
            isVisible ? 'animate-fade-in' : ''
          }`}
        >
          <div className={styles.gameHeader}>
            <h3>Partida Simulada</h3>
            <div className={styles.gameStatus}>En Progreso</div>
          </div>
          <div className={styles.gamePlayers}>
            <div className={styles.playerInfo}>
              <span className={styles.playerName}>
                {currentGameData.player1}
              </span>
              <span className={styles.playerScore}>X</span>
            </div>
            <div className={styles.vs}>VS</div>
            <div className={styles.playerInfo}>
              <span className={styles.playerName}>
                {currentGameData.player2}
              </span>
              <span className={styles.playerScore}>O</span>
            </div>
          </div>
          <div className={styles.gameStats}>
            <div className={styles.stat}>
              Movimientos: {currentGameData.moves}
            </div>
            <div className={styles.stat}>Ganador: {currentGameData.winner}</div>
          </div>
        </div>

        {/* Tap to Return */}
        <div
          className={`${styles.returnHint} ${
            isVisible ? 'animate-fade-in' : ''
          }`}
        >
          <div className={styles.hintIcon}>👆</div>
          <div className={styles.hintText}>Toca la pantalla para continuar</div>
        </div>
      </div>
    </div>
  );
};

export default ScreensaverScreen;
