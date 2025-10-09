import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressScreen from '../../../src/screens/ProgressScreen.jsx';

// Simulación simple para GameContext
const mockGameContext = {
  gameState: 'playing',
  board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  history: [],
  moveCount: 0,
  matchResult: null,
  startMatch: jest.fn(),
  startTournament: jest.fn(),
};

jest.mock('../../../src/context/GameContext', () => ({
  useGame: jest.fn(() => mockGameContext),
}));

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
    // Verificar si existe el contenedor del tablero - usar la clase CSS real
    const boardContainer = document.querySelector('[class*="boardContainer"]');
    expect(boardContainer).toBeInTheDocument();
  });

  test('debería manejar props faltantes de manera elegante', () => {
    render(<ProgressScreen />);
    // Verificar si el componente se renderiza primero
    expect(document.body.innerHTML).toContain('Partida en Progreso');
  });
});
