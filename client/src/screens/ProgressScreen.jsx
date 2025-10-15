import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { AnimatedButton } from '../components/ui';
import styles from './ProgressScreen.module.css';
import GameOptionsService from '../services/GameOptionsService';

/**
 * Progress Screen Component
 * Game board and real-time updates
 * @lastModified 2025-10-09
 * @version 1.1.0
 */

const ProgressScreen = ({
  config = {},
  onTournamentBracket = () => {},
  onGameComplete = () => {},
  onBack = () => {},
  onActivity = () => {},
}) => {
  const {
    gameState,
    board,
    history,
    moveCount,
    matchResult,
    currentMatch,
    tournament,
    submitMove,
    resetGame,
  } = useGame();

  // Use GameContext state directly - move queue handles delays

  // Call onActivity on mount (no useEffect needed for sync operations)
  useEffect(() => {
    // DEBUG: Log game config
    if (process.env.LOG_LEVEL === 'debug') {
      console.log('[DEBUG][ProgressScreen] Mounted with config:', {
        boardSize: config?.boardSize,
        speed: config?.speed,
        noTie: config?.noTie,
        gameMode: config?.gameMode,
      });
    }

    onActivity();
  }, [onActivity, config]);

  const getBoardSize = () => {
    return config?.boardSize === '5x5' ? 25 : 9;
  };

  const isHumanPlayerTurn = () => {
    if (!currentMatch || !currentMatch.players) return false;
    const currentPlayerIndex = moveCount % 2;
    const currentPlayer = currentMatch.players[currentPlayerIndex];
    return currentPlayer && currentPlayer.isHuman;
  };

  const handleCellClick = async position => {
    if (!isHumanPlayerTurn()) return;
    if (board[position] !== 0) return; // Cell already occupied

    try {
      await submitMove(position);
    } catch (error) {
      // Error is handled by GameContext
    }
  };

  const handleStopMatch = () => {
    // Stop current match/tournament
    if (confirm('¿Estás seguro de que deseas detener el juego?')) {
      resetGame();
      onBack(); // Return to config screen
    }
  };

  const renderBoard = () => {
    const size = getBoardSize();
    const boardArray = Array(size).fill(0);

    // Use board state directly - move queue handles delays
    board.forEach((cell, index) => {
      if (index < size) {
        boardArray[index] = cell;
      }
    });

    return (
      <div
        className={`${styles.gameBoard} ${
          styles[`gameBoard${config?.boardSize || '3x3'}`]
        }`}
      >
        {boardArray.map((cell, index) => (
          <div
            key={index}
            data-testid={`board-cell-${index}`}
            className={`${styles.boardCell} ${
              cell === 1
                ? `${styles.boardCellPlayer1} boardCellPlayer1`
                : cell === 2
                  ? `${styles.boardCellPlayer2} boardCellPlayer2`
                  : ''
            } ${isHumanPlayerTurn() && cell === 0 ? styles.clickableCell : ''}`}
            onClick={() => handleCellClick(index)}
            style={{
              cursor: isHumanPlayerTurn() && cell === 0 ? 'pointer' : 'default',
            }}
          >
            {cell === 1 ? (
              <span
                className={styles.playerSymbol}
                data-testid={`player-symbol-${index}`}
              >
                X
              </span>
            ) : cell === 2 ? (
              <span
                className={styles.playerSymbol}
                data-testid={`player-symbol-${index}`}
              >
                O
              </span>
            ) : (
              <span
                className={`${styles.cellNumber} cellNumber`}
                data-testid={`cell-number-${index}`}
              >
                {/* Empty cell - no number display */}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderGameInfo = () => {
    return (
      <div className={styles.gameInfo}>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Modo</div>
          <div className={styles.infoValue}>
            {config?.gameMode === 'tournament' ? 'Torneo' : 'Individual'}
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Tablero</div>
          <div className={styles.infoValue}>{config?.boardSize || '3x3'}</div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Velocidad</div>
          <div className={styles.infoValue}>
            {config?.speed === 'slow'
              ? 'Lenta'
              : config?.speed === 'fast'
                ? 'Rápida'
                : 'Normal'}
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Movimientos</div>
          <div className={styles.infoValue}>{moveCount}</div>
        </div>
      </div>
    );
  };

  const renderGameStatus = () => {
    if (gameState === 'completed') {
      return (
        <div className={styles.gameStatus}>
          <h2>Partida Completada</h2>
          {matchResult && matchResult.winner ? (
            <p>Ganador: {matchResult.winner.name}</p>
          ) : (
            <p>Empate</p>
          )}
          <button onClick={onGameComplete} className="btn btn-primary">
            Ver Resultado
          </button>
        </div>
      );
    }

    if (gameState === 'error') {
      return (
        <div className={styles.gameStatus}>
          <h2>Error en la Partida</h2>
          <p>Ha ocurrido un error durante el juego.</p>
          <button onClick={onBack} className="btn btn-secondary">
            Volver
          </button>
        </div>
      );
    }

    return (
      <div className={styles.gameStatus}>
        <h2>Partida en Progreso</h2>
        <p>Esperando movimientos...</p>
        {config?.gameMode === 'tournament' && (
          <button onClick={onTournamentBracket} className="btn btn-secondary">
            Ver Bracket
          </button>
        )}
      </div>
    );
  };

  const renderMoveHistory = () => {
    // Siempre renderizar sección de historial de movimientos para pruebas
    return (
      <div className={styles.moveHistory}>
        <h3>Historial de Movimientos</h3>
        <div className={styles.historyList}>
          {history && history.length > 0 ? (
            history.map((move, index) => (
              <div key={index} className={styles.historyItem}>
                <span className={styles.moveNumber}>{index + 1}.</span>
                <span className={styles.movePlayer}>
                  {GameOptionsService.getPlayerName(move.player)}
                </span>
                <span className={styles.movePosition}>
                  Posición: {move.position}
                </span>
              </div>
            ))
          ) : (
            <p>No hay movimientos registrados</p>
          )}
        </div>
      </div>
    );
  };

  // Render tournament context header if in tournament mode
  const renderTournamentContext = () => {
    if (!tournament || !currentMatch) return null;

    return (
      <div className={styles.tournamentContext}>
        <div className={styles.tournamentHeader}>
          <h2 className={styles.tournamentTitle}>Torneo en Progreso</h2>
          <div className={styles.matchInfo}>
            <span className={styles.matchLabel}>Partida Actual:</span>
            <span className={styles.matchPlayers}>
              {currentMatch.players?.[0]?.name || 'Jugador 1'} vs{' '}
              {currentMatch.players?.[1]?.name || 'Jugador 2'}
            </span>
          </div>
          <button
            onClick={onTournamentBracket}
            className={`${styles.bracketButton} btn btn-secondary`}
          >
            Ver Bracket Completo
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.progressScreen}>
      <div className={styles.progressContainer}>
        <div className={styles.progressHeader}>
          <button onClick={onBack} className="btn btn-secondary backButton">
            ← Volver
          </button>
          <h1 className={styles.progressTitle}>
            {tournament ? 'Partida del Torneo' : 'Partida en Progreso'}
          </h1>
          <AnimatedButton
            onClick={handleStopMatch}
            className={styles.stopButton}
            variant="danger"
          >
            ⏹ Detener
          </AnimatedButton>
        </div>

        {renderTournamentContext()}

        {renderGameInfo()}

        <div className={styles.gameSection}>
          <div className={styles.boardContainer}>{renderBoard()}</div>
        </div>

        {renderGameStatus()}
        {renderMoveHistory()}
      </div>
    </div>
  );
};

export default ProgressScreen;
