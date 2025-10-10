import React from 'react';
import { useGame } from '../../context/GameContext';
import styles from './Board.module.css';

/**
 * Board Component
 * Reusable game board for 3x3 and 5x5 games
 * @lastModified 2025-10-09
 * @version 1.1.0
 */

const Board = ({
  board,
  boardSize = '3x3',
  currentPlayer,
  moveCount = 0,
  winningLine = [],
  onCellClick,
  showNumbers = true,
  title,
  className = '',
}) => {
  // Get infinity mode state for pulsating animation
  const { nextRemovalPosition } = useGame();
  const is3x3 = boardSize === '3x3';
  const dimension = is3x3 ? 3 : 5;
  const totalCells = dimension * dimension;

  const getBoardClass = () => {
    return is3x3 ? styles.board3x3 : styles.board5x5;
  };

  const getPlayerSymbol = playerId => {
    return playerId === 1 ? 'X' : playerId === 2 ? 'O' : '';
  };

  const getPlayerClass = playerId => {
    return playerId ? styles[`player${playerId}`] : '';
  };

  const isWinningCell = index => {
    return winningLine.includes(index);
  };

  const renderCell = (cell, index) => {
    // Cell pulsates when it's the next to be removed (infinity mode)
    const isPulsating = nextRemovalPosition === index && board[index] !== 0;

    const cellClasses = [
      styles.cell,
      getPlayerClass(cell),
      isWinningCell(index) ? styles.winning : '',
      isPulsating ? styles.pulsating : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        key={index}
        className={cellClasses}
        onClick={() => onCellClick && onCellClick(index)}
      >
        {cell ? (
          <span className={styles.symbol}>{getPlayerSymbol(cell)}</span>
        ) : (
          showNumbers && <span className={styles.cellNumber}>{index}</span>
        )}
      </div>
    );
  };

  const boardClasses = [styles.board, getBoardClass(), className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.boardContainer}>
      {title && <h3 className={styles.boardTitle}>{title}</h3>}

      <div className={styles.boardInfo}>
        {currentPlayer && (
          <div className={styles.currentPlayer}>
            Turno: Jugador {currentPlayer}
          </div>
        )}
        <div className={styles.moveCount}>Movimientos: {moveCount}</div>
      </div>

      <div className={boardClasses}>
        {Array(totalCells)
          .fill(0)
          .map((_, index) => renderCell(board[index] || 0, index))}
      </div>
    </div>
  );
};

export default Board;
