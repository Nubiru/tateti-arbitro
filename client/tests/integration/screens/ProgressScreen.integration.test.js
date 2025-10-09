import React from 'react';
import { render } from '@testing-library/react';
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

describe('Componente ProgressScreen - Pruebas de Integración Simples', () => {
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

  test('debería renderizar componente completo', () => {
    render(<ProgressScreen {...defaultProps} />);

    // Verificar si el componente se renderiza primero
    expect(document.body.innerHTML).toContain('Partida en Progreso');
    expect(document.body.innerHTML).toContain('Modo');
    expect(document.body.innerHTML).toContain('Tablero');
    expect(document.body.innerHTML).toContain('Velocidad');
    expect(document.body.innerHTML).toContain('Movimientos');
  });

  test('debería manejar modo torneo', () => {
    const tournamentProps = {
      ...defaultProps,
      config: {
        ...defaultProps.config,
        gameMode: 'tournament',
      },
    };

    render(<ProgressScreen {...tournamentProps} />);
    expect(document.body.innerHTML).toContain('Partida en Progreso');
  });

  test('debería manejar tablero 5x5', () => {
    const largeBoardProps = {
      ...defaultProps,
      config: {
        ...defaultProps.config,
        boardSize: '5x5',
      },
    };

    render(<ProgressScreen {...largeBoardProps} />);
    expect(document.body.innerHTML).toContain('Partida en Progreso');
  });

  test('debería llamar callbacks', () => {
    render(<ProgressScreen {...defaultProps} />);
    expect(defaultProps.onActivity).toHaveBeenCalled();
  });
});
