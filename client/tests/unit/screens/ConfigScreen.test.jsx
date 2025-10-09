/**
 * Pruebas unitarias para el componente ConfigScreen
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import ConfigScreen from '../../../src/screens/ConfigScreen';

describe('ConfigScreen', () => {
  const mockOnStart = jest.fn();
  const mockOnBack = jest.fn();
  // const mockOnThemeChange = jest.fn();
  const mockOnActivity = jest.fn();

  // Simular fetch para descubrimiento de bots
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            bots: [
              {
                name: 'RandomBot1',
                port: 3001,
                status: 'healthy',
                type: 'random',
                capabilities: ['3x3', '5x5'],
              },
              {
                name: 'RandomBot2',
                port: 3002,
                status: 'healthy',
                type: 'random',
                capabilities: ['3x3', '5x5'],
              },
              {
                name: 'RandomBot3',
                port: 3003,
                status: 'healthy',
                type: 'random',
                capabilities: ['3x3', '5x5'],
              },
              {
                name: 'RandomBot4',
                port: 3004,
                status: 'healthy',
                type: 'random',
                capabilities: ['3x3', '5x5'],
              },
            ],
          }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockConfig = {
    gameMode: 'single',
    boardSize: 3,
    noTie: false,
    speed: 'normal',
    tournamentSize: 4,
    playerCount: 2,
    players: [
      { name: 'Jugador1', port: 3001, isHuman: false },
      { name: 'Jugador2', port: 3002, isHuman: false },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería renderizar las secciones principales', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

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

  test('debería renderizar los botones de atrás e iniciar', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /iniciar partida/i })
    ).toBeInTheDocument();
  });

  test('debería cambiar el modo de juego cuando se selecciona', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    const tournamentRadio = screen.getByDisplayValue('tournament');
    fireEvent.click(tournamentRadio);

    expect(tournamentRadio).toBeChecked();
  });

  test('debería cambiar el tamaño del tablero cuando se selecciona', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    const board5x5Radio = screen.getByLabelText(/5x5/i);
    fireEvent.click(board5x5Radio);

    expect(board5x5Radio).toBeChecked();
  });

  test('debería activar/desactivar el modo sin empates', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    const noTieCheckbox = screen.getByLabelText(/sin empates/i);
    fireEvent.click(noTieCheckbox);

    expect(noTieCheckbox).toBeChecked();
  });

  test('debería cambiar el tema cuando se selecciona', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    const neonThemeButton = screen.getByLabelText(/neon/i);
    fireEvent.click(neonThemeButton);

    expect(neonThemeButton).toBeChecked();
  });

  test('debería cambiar la velocidad cuando se selecciona', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    const fastSpeedRadio = screen.getByLabelText(/rápido/i);
    fireEvent.click(fastSpeedRadio);

    expect(fastSpeedRadio).toBeChecked();
  });

  test('debería mostrar el selector de jugadores cuando se selecciona el modo torneo', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    const tournamentRadio = screen.getByDisplayValue('tournament');
    fireEvent.click(tournamentRadio);

    expect(screen.getByText('Jugadores:')).toBeInTheDocument();
  });

  test('debería llamar onStart con la configuración correcta cuando se hace clic en el botón iniciar', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
        connectionStatus="connected"
      />
    );

    const startButton = screen.getByRole('button', {
      name: /iniciar partida/i,
    });
    fireEvent.click(startButton);

    expect(mockOnStart).toHaveBeenCalledWith(
      expect.objectContaining({
        gameMode: 'single',
        boardSize: '3x3',
        noTie: false,
        speed: 'normal',
      })
    );
  });

  test('debería llamar onBack cuando se hace clic en el botón atrás', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    const backButton = screen.getByRole('button', { name: /volver/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  test('debería actualizar los nombres de los jugadores cuando se editan', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    const player1Input = screen.getByDisplayValue('Jugador1');

    act(() => {
      fireEvent.change(player1Input, { target: { value: 'Bot Inteligente' } });
    });

    expect(player1Input.value).toBe('Bot Inteligente');
  });

  test('debería actualizar los puertos de los jugadores cuando se editan', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    const port1Input = screen.getByDisplayValue('3001');
    fireEvent.change(port1Input, { target: { value: '4001' } });

    expect(port1Input.value).toBe('4001');
  });

  test('debería mostrar selector de jugadores solo en modo torneo', () => {
    const tournamentConfig = {
      ...mockConfig,
      gameMode: 'tournament',
      playerCount: 2,
      players: [
        { name: 'Bot1', port: 3001, isHuman: false },
        { name: 'Bot2', port: 3002, isHuman: false },
      ],
    };

    render(
      <ConfigScreen
        initialConfig={tournamentConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    // Debería mostrar selector de cantidad de jugadores en modo torneo
    expect(screen.getByText('Jugadores:')).toBeInTheDocument();
  });

  test('no debería mostrar selector de jugadores en modo individual', () => {
    render(
      <ConfigScreen
        initialConfig={mockConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    // No debería mostrar selector de cantidad de jugadores en modo individual
    expect(screen.queryByText('Jugadores:')).not.toBeInTheDocument();
  });

  test('debería auto-generar jugadores cuando se cambia el playerCount en modo torneo', async () => {
    // Mock fetch para bot discovery
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ bots: [] }),
    });

    const { players, ...configWithoutPlayers } = mockConfig;
    const tournamentConfig = {
      ...configWithoutPlayers,
      gameMode: 'tournament',
      playerCount: 4,
      // No proporcionar jugadores - dejar que la auto-generación funcione
    };

    render(
      <ConfigScreen
        initialConfig={tournamentConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    // Debería tener ahora 4 jugadores - contar los campos de entrada de jugadores
    // Wait for auto-generation to complete
    await waitFor(() => {
      const playerInputs = screen.getAllByPlaceholderText('Nombre');
      expect(playerInputs).toHaveLength(4);
    });
  });

  test('debería reducir jugadores cuando se cambia el playerCount a un número menor', () => {
    const { players, ...configWithoutPlayers } = mockConfig;
    const tournamentConfig = {
      ...configWithoutPlayers,
      gameMode: 'tournament',
      playerCount: 2,
      // No proporcionar jugadores - dejar que la auto-generación funcione
    };

    render(
      <ConfigScreen
        initialConfig={tournamentConfig}
        onBack={mockOnBack}
        onStart={mockOnStart}
        onActivity={mockOnActivity}
      />
    );

    // Debería tener ahora 2 jugadores
    const playerInputs = screen.getAllByPlaceholderText('Nombre');
    expect(playerInputs).toHaveLength(2);
  });
});
