import React, { useState, useEffect } from 'react';
import Board from '../components/board/Board';

/**
 * Board Container
 * Manages board state and game logic
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const BoardContainer = ({
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
  const [localBoard, setLocalBoard] = useState(board);
  const [localMoveCount, setLocalMoveCount] = useState(moveCount);

  // Actualizar estado local cuando cambian las props
  useEffect(() => {
    setLocalBoard(board);
  }, [board]);

  useEffect(() => {
    setLocalMoveCount(moveCount);
  }, [moveCount]);

  // Manejar clic en celda
  const handleCellClick = index => {
    if (onCellClick) {
      onCellClick(index);
    }
  };

  // Obtener visualización del jugador actual
  const getCurrentPlayerDisplay = () => {
    if (!currentPlayer) return null;
    return currentPlayer;
  };

  return (
    <Board
      board={localBoard}
      boardSize={boardSize}
      currentPlayer={getCurrentPlayerDisplay()}
      moveCount={localMoveCount}
      winningLine={winningLine}
      onCellClick={handleCellClick}
      showNumbers={showNumbers}
      title={title}
      className={className}
    />
  );
};

export default BoardContainer;
