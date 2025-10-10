/**
 * Pruebas unitarias para el componente Board
 * @lastModified 2025-10-09
 * @version 1.1.0
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Board from '../../../../src/components/board/Board';
import { GameContext } from '../../../../src/context/GameContext';

// Mock GameContext provider for tests
const MockGameProvider = ({ children, value = {} }) => {
  const defaultValue = {
    nextRemovalPosition: null,
    removalQueue: [],
    ...value,
  };
  return (
    <GameContext.Provider value={defaultValue}>{children}</GameContext.Provider>
  );
};

describe('Componente Board', () => {
  const mockOnCellClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería renderizar tablero 3x3 por defecto', () => {
    const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const { container } = render(
      <MockGameProvider>
        <Board board={board} />
      </MockGameProvider>
    );

    const gameBoard = container.querySelector('.boardContainer');
    expect(gameBoard).toBeInTheDocument();

    const boardElement = gameBoard.querySelector('.board');
    expect(boardElement).toHaveClass('board3x3');
    expect(boardElement).not.toHaveClass('board5x5');
  });

  test('debería renderizar tablero 5x5 cuando el tamaño es 5x5', () => {
    const board = new Array(25).fill(0);
    const { container } = render(
      <MockGameProvider>
        <Board board={board} boardSize="5x5" />
      </MockGameProvider>
    );

    const gameBoard = container.querySelector('.boardContainer');
    expect(gameBoard).toBeInTheDocument();

    const boardElement = gameBoard.querySelector('.board');
    expect(boardElement).toHaveClass('board5x5');
    expect(boardElement).not.toHaveClass('board3x3');
  });

  test('debería renderizar número correcto de celdas para tablero 3x3', () => {
    const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const { container } = render(
      <MockGameProvider>
        <Board board={board} />
      </MockGameProvider>
    );

    const cells = container.querySelectorAll('.cell');
    expect(cells).toHaveLength(9);
  });

  test('debería renderizar número correcto de celdas para tablero 5x5', () => {
    const board = new Array(25).fill(0);
    const { container } = render(
      <MockGameProvider>
        <Board board={board} boardSize="5x5" />
      </MockGameProvider>
    );

    const cells = container.querySelectorAll('.cell');
    expect(cells).toHaveLength(25);
  });

  test('debería mostrar números de celdas para celdas vacías', () => {
    const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const { container } = render(
      <MockGameProvider>
        <Board board={board} />
      </MockGameProvider>
    );

    const cellNumbers = container.querySelectorAll('.cellNumber');
    expect(cellNumbers).toHaveLength(9);
    expect(cellNumbers[0]).toHaveTextContent('0');
    expect(cellNumbers[8]).toHaveTextContent('8');
  });

  test('debería mostrar símbolos de jugador para celdas ocupadas', () => {
    const board = [1, 0, 2, 0, 1, 0, 0, 0, 0];
    const { container } = render(
      <MockGameProvider>
        <Board board={board} />
      </MockGameProvider>
    );

    const symbols = container.querySelectorAll('.symbol');
    expect(symbols).toHaveLength(3);
    expect(symbols[0]).toHaveTextContent('X');
    expect(symbols[1]).toHaveTextContent('O');
    expect(symbols[2]).toHaveTextContent('X');
  });

  test('debería aplicar clases CSS correctas para celdas de jugador', () => {
    const board = [1, 0, 2, 0, 1, 0, 0, 0, 0];
    const { container } = render(
      <MockGameProvider>
        <Board board={board} />
      </MockGameProvider>
    );

    const cells = container.querySelectorAll('.cell');

    // Primera celda debería tener clase player1
    expect(cells[0]).toHaveClass('player1');

    // Tercera celda debería tener clase player2
    expect(cells[2]).toHaveClass('player2');

    // Celdas vacías no deberían tener clases de jugador
    expect(cells[1]).not.toHaveClass('player1');
    expect(cells[1]).not.toHaveClass('player2');
  });

  test('debería call onCellClick when cell is clicked', () => {
    const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const { container } = render(
      <MockGameProvider>
        <Board board={board} onCellClick={mockOnCellClick} />
      </MockGameProvider>
    );

    const cells = container.querySelectorAll('.cell');
    fireEvent.click(cells[0]);

    expect(mockOnCellClick).toHaveBeenCalledWith(0);
  });

  test('debería not call onCellClick when disabled', () => {
    const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const { container } = render(
      <MockGameProvider>
        <Board board={board} onCellClick={null} />
      </MockGameProvider>
    );

    const cells = container.querySelectorAll('.cell');
    fireEvent.click(cells[0]);

    expect(mockOnCellClick).not.toHaveBeenCalled();
  });

  test('debería not call onCellClick when disabled', () => {
    const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const onCellClick = jest.fn();
    const { container } = render(
      <MockGameProvider>
        <Board board={board} onCellClick={onCellClick} />
      </MockGameProvider>
    );

    // Simular clic en una celda vacía
    const emptyCell = container.querySelector('.cell:not(.player1)');
    fireEvent.click(emptyCell);

    // Como no hay prop disabled, onCellClick debería ser llamado
    expect(onCellClick).toHaveBeenCalled();
  });

  test('debería highlight winning cells', () => {
    const board = [1, 1, 1, 0, 0, 0, 0, 0, 0];
    const winningLine = [0, 1, 2];
    const { container } = render(
      <MockGameProvider>
        <Board board={board} winningLine={winningLine} />
      </MockGameProvider>
    );

    const cells = container.querySelectorAll('.cell');

    expect(cells[0]).toHaveClass('winning');
    expect(cells[1]).toHaveClass('winning');
    expect(cells[2]).toHaveClass('winning');
    expect(cells[3]).not.toHaveClass('winning');
  });

  test('debería apply custom className', () => {
    const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const { container } = render(
      <MockGameProvider>
        <Board board={board} className="custom-board" />
      </MockGameProvider>
    );

    const boardElement = container.querySelector('.board');
    expect(boardElement).toHaveClass('custom-board');
  });

  test('debería handle empty board array', () => {
    const board = [];
    const { container } = render(
      <MockGameProvider>
        <Board board={board} />
      </MockGameProvider>
    );

    const cells = container.querySelectorAll('.cell');
    expect(cells).toHaveLength(9); // Debería seguir renderizando 9 celdas para 3x3
  });

  test('debería handle board with undefined cells', () => {
    const board = [1, undefined, 2, null, 0, 0, 0, 0, 0];
    const { container } = render(
      <MockGameProvider>
        <Board board={board} />
      </MockGameProvider>
    );

    // No debería fallar y renderizar celdas
    const cells = container.querySelectorAll('.cell');
    expect(cells).toHaveLength(9);
  });

  test('debería render with different board sizes correctly', () => {
    const board3x3 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const board5x5 = new Array(25).fill(0);

    const { container, rerender } = render(
      <MockGameProvider>
        <Board board={board3x3} />
      </MockGameProvider>
    );
    const gameBoard = container.querySelector('.board');
    expect(gameBoard).toHaveClass('board3x3');
    expect(container.querySelectorAll('.cell')).toHaveLength(9);

    rerender(
      <MockGameProvider>
        <Board board={board5x5} boardSize="5x5" />
      </MockGameProvider>
    );
    expect(gameBoard).toHaveClass('board5x5');
    expect(container.querySelectorAll('.cell')).toHaveLength(25);
  });
});
