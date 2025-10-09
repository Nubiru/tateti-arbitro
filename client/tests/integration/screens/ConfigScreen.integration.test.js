import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfigScreen from '../../../src/screens/ConfigScreen.jsx';

describe('ConfigScreen - Pruebas de Integración Simples', () => {
  const defaultProps = {
    initialConfig: {
      gameMode: 'single',
      boardSize: '3x3',
      speed: 'normal',
      noTie: false,
      theme: 'classic',
      players: [
        { name: 'Player 1', port: 3001 },
        { name: 'Player 2', port: 3002 },
      ],
    },
    onStart: jest.fn(),
    onBack: jest.fn(),
    onActivity: jest.fn(),
    onThemeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería renderizar componente completo', () => {
    render(<ConfigScreen {...defaultProps} />);

    // Verificar elementos principales
    expect(
      screen.getByRole('heading', {
        name: /configuración del juego/i,
        level: 1,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Modo de Juego')).toBeInTheDocument();
    expect(screen.getByText('Opciones del Juego')).toBeInTheDocument();
    expect(screen.getByText('Jugadores')).toBeInTheDocument();
    expect(screen.getByText('Tema Visual')).toBeInTheDocument();
  });

  test('debería manejar modo individual', () => {
    render(<ConfigScreen {...defaultProps} />);
    // Verificar si el componente se renderiza primero
    expect(document.body.innerHTML).toContain('Individual');
  });

  test('debería manejar modo torneo', () => {
    const tournamentProps = {
      ...defaultProps,
      initialConfig: {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
      },
    };

    render(<ConfigScreen {...tournamentProps} />);
    expect(screen.getByText('Torneo')).toBeInTheDocument();
  });

  test('debería llamar onActivity al montar', () => {
    render(<ConfigScreen {...defaultProps} />);
    expect(defaultProps.onActivity).toHaveBeenCalled();
  });

  test('debería manejar clic en botón de inicio', () => {
    render(<ConfigScreen {...defaultProps} />);

    // Verificar si el componente se renderiza primero
    expect(document.body.innerHTML).toContain('Iniciar Partida');

    const startButton = screen.getByText('Iniciar Partida');
    fireEvent.click(startButton);

    expect(defaultProps.onStart).toHaveBeenCalled();
  });

  test('debería manejar clic en botón de volver', () => {
    render(<ConfigScreen {...defaultProps} />);

    const backButton = screen.getByText('← Volver');
    fireEvent.click(backButton);

    expect(defaultProps.onBack).toHaveBeenCalled();
  });
});
