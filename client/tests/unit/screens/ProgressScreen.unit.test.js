/**
 * ProgressScreen Unit Tests
 * @lastModified 2025-10-15
 * @version 1.0.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressScreen from '../../../src/screens/ProgressScreen.jsx';

// Mock the GameContext
const mockGameContext = {
  board: [1, 0, 2, 0, 1, 0, 0, 0, 0],
  config: { boardSize: '3x3', speed: 'normal' },
  currentMatch: { id: 'test-match' },
  gameState: 'playing',
  moveCount: 3,
  history: [],
  nextRemovalPosition: null,
  matchResult: null,
  tournament: null,
  submitMove: jest.fn(),
  resetGame: jest.fn(),
};

// Mock the useGame hook
jest.mock('../../../src/context/GameContext', () => ({
  useGame: jest.fn(() => mockGameContext),
}));

// Mock the AnimatedButton component
jest.mock('../../../src/components/ui', () => ({
  AnimatedButton: ({ children, ...props }) => (
    <button {...props}>{children}</button>
  ),
}));

// Mock the CSS module
jest.mock('../../../src/screens/ProgressScreen.module.css', () => ({
  progressScreen: 'progressScreen',
  progressContainer: 'progressContainer',
  progressHeader: 'progressHeader',
  progressTitle: 'progressTitle',
  stopButton: 'stopButton',
  gameInfo: 'gameInfo',
  infoCard: 'infoCard',
  infoLabel: 'infoLabel',
  infoValue: 'infoValue',
  gameSection: 'gameSection',
  boardContainer: 'boardContainer',
  gameBoard: 'gameBoard',
  gameBoard3x3: 'gameBoard3x3',
  gameBoard5x5: 'gameBoard5x5',
  boardCell: 'boardCell',
  boardCellPlayer1: 'boardCellPlayer1',
  boardCellPlayer2: 'boardCellPlayer2',
  clickableCell: 'clickableCell',
  playerSymbol: 'playerSymbol',
  cellNumber: 'cellNumber',
  gameStatus: 'gameStatus',
  moveHistory: 'moveHistory',
  historyTitle: 'historyTitle',
  historyList: 'historyList',
  historyItem: 'historyItem',
  moveNumber: 'moveNumber',
  movePlayer: 'movePlayer',
  movePosition: 'movePosition',
  tournamentContext: 'tournamentContext',
  tournamentHeader: 'tournamentHeader',
  tournamentTitle: 'tournamentTitle',
  matchInfo: 'matchInfo',
  matchLabel: 'matchLabel',
  matchPlayers: 'matchPlayers',
  bracketButton: 'bracketButton',
}));

// Mock the GameOptionsService
jest.mock('../../../src/services/GameOptionsService', () => ({
  getDelayForSpeed: jest.fn(() => 2000),
  isGameInProgress: jest.fn(() => true),
  isGameCompleted: jest.fn(() => false),
  getGameStateText: jest.fn(() => 'playing'),
  getPlayerName: jest.fn(player => player?.name || 'Unknown Player'),
}));

const renderWithProvider = (props = {}) => {
  return render(<ProgressScreen {...props} />);
};

describe('ProgressScreen - Pruebas Unitarias Simples', () => {
  const defaultProps = {
    config: {
      gameMode: 'single',
      boardSize: '3x3',
      speed: 'normal',
      players: [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
      ],
    },
    onTournamentBracket: jest.fn(),
    onGameComplete: jest.fn(),
    onBack: jest.fn(),
    onActivity: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería renderizar título principal', () => {
    render(<ProgressScreen {...defaultProps} />);
    // Verificar si el componente se renderiza primero
    expect(document.body.innerHTML).toContain('Partida en Progreso');
  });

  test('debería llamar onActivity al montar', () => {
    render(<ProgressScreen {...defaultProps} />);
    expect(defaultProps.onActivity).toHaveBeenCalled();
  });

  test('debería renderizar etiquetas de información del juego', () => {
    render(<ProgressScreen {...defaultProps} />);
    expect(screen.getByText('Modo')).toBeInTheDocument();
    expect(screen.getByText('Tablero')).toBeInTheDocument();
    expect(screen.getByText('Velocidad')).toBeInTheDocument();
    expect(screen.getByText('Movimientos')).toBeInTheDocument();
  });

  test('debería renderizar tablero', () => {
    render(<ProgressScreen {...defaultProps} />);
    // Verificar si existen las celdas del tablero usando data-testid
    const boardCells = screen.getAllByTestId(/board-cell-/);
    expect(boardCells).toHaveLength(9); // 3x3 board should have 9 cells
  });

  test('debería manejar props faltantes de manera elegante', () => {
    render(<ProgressScreen />);
    // Verificar si el componente se renderiza primero
    expect(document.body.innerHTML).toContain('Partida en Progreso');
  });
});

describe('ProgressScreen - Board Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle undefined board state gracefully', () => {
    const contextWithUndefinedBoard = {
      ...mockGameContext,
      board: undefined,
    };

    // Mock the context to return undefined board
    jest.spyOn(React, 'useContext').mockReturnValue(contextWithUndefinedBoard);

    const defaultProps = {
      config: { gameMode: 'single', boardSize: '3x3', speed: 'normal' },
      onTournamentBracket: jest.fn(),
      onGameComplete: jest.fn(),
      onBack: jest.fn(),
      onActivity: jest.fn(),
    };

    // Should not crash with undefined board
    expect(() => render(<ProgressScreen {...defaultProps} />)).not.toThrow();
  });

  test('should handle null board state gracefully', () => {
    const contextWithNullBoard = {
      ...mockGameContext,
      board: null,
    };

    jest.spyOn(React, 'useContext').mockReturnValue(contextWithNullBoard);

    const defaultProps = {
      config: { gameMode: 'single', boardSize: '3x3', speed: 'normal' },
      onTournamentBracket: jest.fn(),
      onGameComplete: jest.fn(),
      onBack: jest.fn(),
      onActivity: jest.fn(),
    };

    // Should not crash with null board
    expect(() => render(<ProgressScreen {...defaultProps} />)).not.toThrow();
  });

  test('should handle empty board array', () => {
    const contextWithEmptyBoard = {
      ...mockGameContext,
      board: [],
    };

    jest.spyOn(React, 'useContext').mockReturnValue(contextWithEmptyBoard);

    const defaultProps = {
      config: { gameMode: 'single', boardSize: '3x3', speed: 'normal' },
      onTournamentBracket: jest.fn(),
      onGameComplete: jest.fn(),
      onBack: jest.fn(),
      onActivity: jest.fn(),
    };

    // Should not crash with empty board
    expect(() => render(<ProgressScreen {...defaultProps} />)).not.toThrow();
  });

  test('should handle board with different sizes', () => {
    const contextWith5x5Board = {
      ...mockGameContext,
      board: Array(25).fill(0),
      config: { boardSize: '5x5', speed: 'normal' },
    };

    jest.spyOn(React, 'useContext').mockReturnValue(contextWith5x5Board);

    const defaultProps = {
      config: { gameMode: 'single', boardSize: '5x5', speed: 'normal' },
      onTournamentBracket: jest.fn(),
      onGameComplete: jest.fn(),
      onBack: jest.fn(),
      onActivity: jest.fn(),
    };

    // Should not crash with 5x5 board
    expect(() => render(<ProgressScreen {...defaultProps} />)).not.toThrow();
  });
});

describe('ProgressScreen - Error Handling', () => {
  test('should not crash on maximum call stack exceeded', () => {
    // Simulate the error condition
    const problematicContext = {
      ...mockGameContext,
      board: undefined,
    };

    jest.spyOn(React, 'useContext').mockReturnValue(problematicContext);

    const defaultProps = {
      config: { gameMode: 'single', boardSize: '3x3', speed: 'normal' },
      onTournamentBracket: jest.fn(),
      onGameComplete: jest.fn(),
      onBack: jest.fn(),
      onActivity: jest.fn(),
    };

    // Should handle gracefully without throwing
    expect(() => render(<ProgressScreen {...defaultProps} />)).not.toThrow();
  });
});
