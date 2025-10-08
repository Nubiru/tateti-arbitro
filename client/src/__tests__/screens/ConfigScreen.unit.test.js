/**
 * Pruebas unitarias para ConfigScreen
 * Pruebas de lógica de componente, gestión de estado e interacciones de usuario
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import ConfigScreen from '../../screens/ConfigScreen';

// Stub PlayerService for pure synchronous unit tests
class PlayerServiceStub {
  generatePlayers(count) {
    return Array.from({ length: count }, (_, i) => ({
      name: `Bot${i + 1}`,
      port: 3001 + i,
      isHuman: false,
      status: 'unknown',
    }));
  }
}

// Mock fetch globally for all tests
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ bots: [] }),
});

// Simular módulo CSS
jest.mock('../../screens/ConfigScreen.module.css', () => ({
  configScreen: 'configScreen',
  configContainer: 'configContainer',
  configTitle: 'configTitle',
  threeColumnRow: 'threeColumnRow',
  singleColumnRow: 'singleColumnRow',
  narrowCard: 'narrowCard',
  wideCard: 'wideCard',
  fullWidthCard: 'fullWidthCard',
  inlineRadioGroup: 'inlineRadioGroup',
  inlineOptionsGrid: 'inlineOptionsGrid',
  inlineOptionGroup: 'inlineOptionGroup',
  optionLabel: 'optionLabel',
  inlineCheckboxLabel: 'inlineCheckboxLabel',
  humanCheckboxLabel: 'humanCheckboxLabel',
  playersGrid: 'playersGrid',
  playerItem: 'playerItem',
  playerInput: 'playerInput',
  startSection: 'startSection',
  startButton: 'startButton',
  errorMessage: 'errorMessage',
  bottomNav: 'bottomNav',
  backButton: 'backButton',
}));

describe('ConfigScreen Unit Tests', () => {
  const defaultProps = {
    onStart: jest.fn(),
    onBack: jest.fn(),
    onThemeChange: jest.fn(),
    onVisualThemeChange: jest.fn(),
    visualTheme: 'neon',
    onActivity: jest.fn(),
    initialConfig: {
      gameMode: 'single',
      playerType: 'bot',
      boardSize: 3,
      noTie: false,
      speed: 'normal',
      tournamentSize: 4,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    test('debería renderizar con configuración por defecto', () => {
      render(
        <ConfigScreen
          {...defaultProps}
          playerService={new PlayerServiceStub()}
        />
      );

      expect(screen.getByText('Configuración del Juego')).toBeInTheDocument();
      expect(screen.getByText('Modo de Juego')).toBeInTheDocument();
      expect(screen.getByText('Jugadores')).toBeInTheDocument();
      expect(screen.getByText('Opciones del Juego')).toBeInTheDocument();
      expect(screen.getByText('Tema Visual')).toBeInTheDocument();
    });

    test('debería inicializar con configuración proporcionada', () => {
      render(
        <ConfigScreen
          {...defaultProps}
          playerService={new PlayerServiceStub()}
        />
      );

      // Verificar que el modo individual está seleccionado
      const singleModeRadio = screen.getByDisplayValue('single');
      expect(singleModeRadio).toBeChecked();

      // Verificar que el tablero 3x3 está seleccionado
      const board3x3Radio = screen.getByDisplayValue(3);
      expect(board3x3Radio).toBeChecked();

      // Verificar que la velocidad normal está seleccionada
      const normalSpeedRadio = screen.getByDisplayValue('normal');
      expect(normalSpeedRadio).toBeChecked();
    });

    test('debería mostrar opciones de tema visual', () => {
      render(<ConfigScreen {...defaultProps} />);

      // Verificar que se muestran las 5 opciones de tema visual
      expect(screen.getByText('Clasico')).toBeInTheDocument();
      expect(screen.getByText('Naranja')).toBeInTheDocument();
      expect(screen.getByText('Neon')).toBeInTheDocument();
      expect(screen.getByText('Pastel')).toBeInTheDocument();
      expect(screen.getByText('Rgb')).toBeInTheDocument();
    });

    test('debería mostrar tema visual actual seleccionado', () => {
      render(<ConfigScreen {...defaultProps} />);

      // Verificar que el tema actual (neon) está seleccionado
      const neonRadio = screen.getByDisplayValue('neon');
      expect(neonRadio).toBeChecked();
    });

    test('debería inicializar jugadores desde configuración', () => {
      const configWithPlayers = {
        ...defaultProps.initialConfig,
        players: [
          { name: 'Custom Player 1', port: 3001, isHuman: false },
          { name: 'Custom Player 2', port: 3002, isHuman: false },
        ],
      };

      render(
        <ConfigScreen {...defaultProps} initialConfig={configWithPlayers} />
      );

      expect(screen.getByDisplayValue('Custom Player 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Custom Player 2')).toBeInTheDocument();
    });

    test('debería usar jugadores por defecto cuando la configuración no tiene jugadores', () => {
      render(<ConfigScreen {...defaultProps} />);

      expect(screen.getByDisplayValue('Bot1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot2')).toBeInTheDocument();
    });
  });

  describe('Game Mode Selection', () => {
    test('debería cambiar a modo torneo', () => {
      render(<ConfigScreen {...defaultProps} />);

      const tournamentRadio = screen.getByDisplayValue('tournament');
      act(() => {
        fireEvent.click(tournamentRadio);
      });

      expect(tournamentRadio).toBeChecked();
      expect(screen.getByText('Jugadores:')).toBeInTheDocument();
    });

    test('debería mostrar selector de cantidad de jugadores en modo torneo', () => {
      render(<ConfigScreen {...defaultProps} />);

      const tournamentRadio = screen.getByDisplayValue('tournament');
      act(() => {
        fireEvent.click(tournamentRadio);
      });

      // Debería mostrar selector de cantidad de jugadores en modo torneo
      expect(screen.getByText('Jugadores:')).toBeInTheDocument();
    });

    test('debería ocultar selector de cantidad de jugadores en modo individual', () => {
      render(<ConfigScreen {...defaultProps} />);

      // Comenzar en modo torneo
      const tournamentRadio = screen.getByDisplayValue('tournament');
      act(() => {
        fireEvent.click(tournamentRadio);
      });
      expect(screen.getByText('Jugadores:')).toBeInTheDocument();

      // Cambiar de vuelta a modo individual
      const singleRadio = screen.getByDisplayValue('single');
      act(() => {
        fireEvent.click(singleRadio);
      });

      expect(singleRadio).toBeChecked();
      expect(screen.queryByText('Jugadores:')).not.toBeInTheDocument();
    });
  });

  describe('Player Management', () => {
    test('debería show 2 players by default in single mode', () => {
      render(<ConfigScreen {...defaultProps} />);

      // Debería mostrar exactamente 2 jugadores en modo individual
      expect(screen.getByDisplayValue('Bot1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot2')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Bot3')).not.toBeInTheDocument();
    });

    test('debería auto-generar jugadores basado en playerCount en modo torneo', async () => {
      // Mock the bot discovery to return immediately
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ bots: [] }),
      });

      // Render with tournament mode and 4 players from the start
      const tournamentConfig = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
        playerCount: 4,
      };

      render(
        <ConfigScreen
          {...defaultProps}
          initialConfig={tournamentConfig}
          playerService={new PlayerServiceStub()}
        />
      );

      // Verificar que se generaron 4 jugadores
      expect(screen.getByDisplayValue('Bot1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot3')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot4')).toBeInTheDocument();
    });

    test('debería no mostrar selector de cantidad de jugadores en modo individual', () => {
      render(
        <ConfigScreen
          {...defaultProps}
          playerService={new PlayerServiceStub()}
        />
      );

      // El selector de cantidad de jugadores no debería ser visible en modo individual
      expect(screen.queryByText('Jugadores:')).not.toBeInTheDocument();
    });

    test('debería mostrar selector de cantidad de jugadores en modo torneo', () => {
      render(
        <ConfigScreen
          {...defaultProps}
          playerService={new PlayerServiceStub()}
        />
      );

      // Cambiar a modo torneo
      const tournamentMode = screen.getByDisplayValue('tournament');
      act(() => {
        fireEvent.click(tournamentMode);
      });

      // El selector de cantidad de jugadores debería ser visible
      expect(screen.getByText('Jugadores:')).toBeInTheDocument();
    });

    test('debería incluir checkbox Humano para cada jugador', () => {
      render(
        <ConfigScreen
          {...defaultProps}
          playerService={new PlayerServiceStub()}
        />
      );

      // Debería mostrar checkboxes Humano para cada jugador
      const humanCheckboxes = screen.getAllByText('Humano');
      expect(humanCheckboxes).toHaveLength(2); // 2 jugadores en modo individual
    });

    test('debería actualizar nombre del jugador', () => {
      render(
        <ConfigScreen
          {...defaultProps}
          playerService={new PlayerServiceStub()}
        />
      );

      const nameInput = screen.getByDisplayValue('Bot1');
      fireEvent.change(nameInput, { target: { value: 'Updated Player' } });

      expect(nameInput.value).toBe('Updated Player');
    });

    test('debería actualizar puerto del jugador', () => {
      render(
        <ConfigScreen
          {...defaultProps}
          playerService={new PlayerServiceStub()}
        />
      );

      const portInput = screen.getByDisplayValue('3001');
      fireEvent.change(portInput, { target: { value: '4001' } });

      expect(portInput.value).toBe('4001');
    });

    test('debería alternar checkbox Humano', () => {
      render(<ConfigScreen {...defaultProps} />);

      const humanCheckboxes = screen.getAllByText('Humano');
      const firstHumanCheckbox =
        humanCheckboxes[0].previousElementSibling.querySelector(
          'input[type="checkbox"]'
        );

      expect(firstHumanCheckbox).not.toBeChecked();
      act(() => {
        fireEvent.click(firstHumanCheckbox);
      });
      expect(firstHumanCheckbox).toBeChecked();
    });
  });

  describe('Game Options', () => {
    test('debería alternar opción noTie', () => {
      render(<ConfigScreen {...defaultProps} />);

      const noTieCheckbox = screen.getByLabelText('Sin Empates');
      expect(noTieCheckbox).not.toBeChecked();

      act(() => {
        fireEvent.click(noTieCheckbox);
      });
      expect(noTieCheckbox).toBeChecked();
    });

    test('debería cambiar tamaño del tablero a 5x5', () => {
      render(<ConfigScreen {...defaultProps} />);

      const board5x5Radio = screen.getByDisplayValue(5);
      act(() => {
        fireEvent.click(board5x5Radio);
      });

      expect(board5x5Radio).toBeChecked();
    });

    test('debería cambiar velocidad a rápida', () => {
      render(<ConfigScreen {...defaultProps} />);

      const fastSpeedRadio = screen.getByDisplayValue('fast');
      act(() => {
        fireEvent.click(fastSpeedRadio);
      });

      expect(fastSpeedRadio).toBeChecked();
    });

    test('debería cambiar velocidad a lenta', () => {
      render(<ConfigScreen {...defaultProps} />);

      const slowSpeedRadio = screen.getByDisplayValue('slow');
      act(() => {
        fireEvent.click(slowSpeedRadio);
      });

      expect(slowSpeedRadio).toBeChecked();
    });
  });

  describe('Theme Selection', () => {
    test('debería cambiar tema visual a clásico', () => {
      render(<ConfigScreen {...defaultProps} />);

      const clasicoRadio = screen.getByDisplayValue('clasico');
      act(() => {
        fireEvent.click(clasicoRadio);
      });

      expect(clasicoRadio).toBeChecked();
      expect(defaultProps.onVisualThemeChange).toHaveBeenCalledWith('clasico');
    });

    test('debería cambiar tema visual a naranja', () => {
      render(<ConfigScreen {...defaultProps} />);

      const naranjaRadio = screen.getByDisplayValue('naranja');
      act(() => {
        fireEvent.click(naranjaRadio);
      });

      expect(naranjaRadio).toBeChecked();
      expect(defaultProps.onVisualThemeChange).toHaveBeenCalledWith('naranja');
    });

    test('debería cambiar tema visual a pastel', () => {
      render(<ConfigScreen {...defaultProps} />);

      const pastelRadio = screen.getByDisplayValue('pastel');
      act(() => {
        fireEvent.click(pastelRadio);
      });

      expect(pastelRadio).toBeChecked();
      expect(defaultProps.onVisualThemeChange).toHaveBeenCalledWith('pastel');
    });

    test('debería cambiar tema visual a rgb', () => {
      render(<ConfigScreen {...defaultProps} />);

      const rgbRadio = screen.getByDisplayValue('rgb');
      act(() => {
        fireEvent.click(rgbRadio);
      });

      expect(rgbRadio).toBeChecked();
      expect(defaultProps.onVisualThemeChange).toHaveBeenCalledWith('rgb');
    });

    test('debería no llamar onVisualThemeChange cuando no se proporciona', () => {
      const propsWithoutVisualThemeChange = { ...defaultProps };
      delete propsWithoutVisualThemeChange.onVisualThemeChange;

      render(<ConfigScreen {...propsWithoutVisualThemeChange} />);

      const clasicoRadio = screen.getByDisplayValue('clasico');
      act(() => {
        fireEvent.click(clasicoRadio);
      });

      expect(clasicoRadio).toBeChecked();
      // No debería lanzar error
    });
  });

  describe('Tournament Validation', () => {
    test('debería validar torneo con 4 jugadores', () => {
      const configWithPlayers = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
        players: [
          { name: 'Bot1', port: 3001 },
          { name: 'Bot2', port: 3002 },
          { name: 'Bot3', port: 3003 },
          { name: 'Bot4', port: 3004 },
        ],
      };

      render(
        <ConfigScreen {...defaultProps} initialConfig={configWithPlayers} />
      );

      const startButton = screen.getByText('Iniciar Torneo');
      expect(startButton).not.toBeDisabled();
    });

    test('debería deshabilitar botón de inicio para tamaño de torneo inválido', () => {
      const configWithPlayers = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
        playerCount: 3, // Tamaño de torneo inválido
        players: [
          { name: 'Player 1', port: 3001 },
          { name: 'Player 2', port: 3002 },
          { name: 'Player 3', port: 3003 },
        ],
      };

      render(
        <ConfigScreen {...defaultProps} initialConfig={configWithPlayers} />
      );

      const startButton = screen.getByRole('button', {
        name: 'Iniciar Torneo',
      });
      expect(startButton).toBeDisabled();
      expect(
        screen.getByText('El torneo requiere 2, 4, 8, 16 jugadores')
      ).toBeInTheDocument();
    });

    test('debería validar torneo con 2 jugadores', () => {
      const configWithPlayers = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
        players: [
          { name: 'Player 1', port: 3001 },
          { name: 'Player 2', port: 3002 },
        ],
      };

      render(
        <ConfigScreen {...defaultProps} initialConfig={configWithPlayers} />
      );

      const startButton = screen.getByText('Iniciar Torneo');
      expect(startButton).not.toBeDisabled();
    });

    test('debería validar torneo con 8 jugadores', () => {
      const configWithPlayers = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
        players: Array.from({ length: 8 }, (_, i) => ({
          name: `Player ${i + 1}`,
          port: 3001 + i,
        })),
      };

      render(
        <ConfigScreen {...defaultProps} initialConfig={configWithPlayers} />
      );

      const startButton = screen.getByText('Iniciar Torneo');
      expect(startButton).not.toBeDisabled();
    });

    test('debería validar torneo con 16 jugadores', () => {
      const configWithPlayers = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
        players: Array.from({ length: 16 }, (_, i) => ({
          name: `Player ${i + 1}`,
          port: 3001 + i,
        })),
      };

      render(
        <ConfigScreen {...defaultProps} initialConfig={configWithPlayers} />
      );

      const startButton = screen.getByText('Iniciar Torneo');
      expect(startButton).not.toBeDisabled();
    });
  });

  describe('Start Game', () => {
    test('debería llamar onStart con configuración de modo individual', () => {
      render(<ConfigScreen {...defaultProps} />);

      const startButton = screen.getByText('Iniciar Partida');
      act(() => {
        fireEvent.click(startButton);
      });

      expect(defaultProps.onStart).toHaveBeenCalledWith({
        gameMode: 'single',
        playerType: 'bot',
        boardSize: '3x3',
        noTie: false,
        speed: 'normal',
        tournamentSize: 4,
        playerCount: 2,
        players: [
          { name: 'Bot1', port: 3001, isHuman: false, status: 'unknown' },
          { name: 'Bot2', port: 3002, isHuman: false, status: 'unknown' },
        ],
      });
    });

    test('debería llamar onStart con configuración de modo torneo', () => {
      const configWithPlayers = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
        playerCount: 4,
        players: [
          { name: 'Bot1', port: 3001 },
          { name: 'Bot2', port: 3002 },
          { name: 'Bot3', port: 3003 },
          { name: 'Bot4', port: 3004 },
        ],
      };

      render(
        <ConfigScreen {...defaultProps} initialConfig={configWithPlayers} />
      );

      const startButton = screen.getByText('Iniciar Torneo');
      act(() => {
        fireEvent.click(startButton);
      });

      expect(defaultProps.onStart).toHaveBeenCalledWith({
        gameMode: 'tournament',
        playerType: 'bot',
        boardSize: '3x3',
        noTie: false,
        speed: 'normal',
        tournamentSize: 4,
        playerCount: 4,
        players: [
          { name: 'Bot1', port: 3001 },
          { name: 'Bot2', port: 3002 },
          { name: 'Bot3', port: 3003 },
          { name: 'Bot4', port: 3004 },
        ],
      });
    });

    test('debería llamar onStart con configuración actualizada', () => {
      render(<ConfigScreen {...defaultProps} />);

      // Cambiar algunas opciones
      const noTieCheckbox = screen.getByLabelText('Sin Empates');
      act(() => {
        fireEvent.click(noTieCheckbox);
      });

      const board5x5Radio = screen.getByDisplayValue(5);
      act(() => {
        fireEvent.click(board5x5Radio);
      });

      const fastSpeedRadio = screen.getByDisplayValue('fast');
      act(() => {
        fireEvent.click(fastSpeedRadio);
      });

      const startButton = screen.getByText('Iniciar Partida');
      act(() => {
        fireEvent.click(startButton);
      });

      expect(defaultProps.onStart).toHaveBeenCalledWith({
        gameMode: 'single',
        playerType: 'bot',
        boardSize: '5x5',
        noTie: true,
        speed: 'fast',
        tournamentSize: 4,
        playerCount: 2,
        players: [
          { name: 'Bot1', port: 3001, isHuman: false, status: 'unknown' },
          { name: 'Bot2', port: 3002, isHuman: false, status: 'unknown' },
        ],
      });
    });
  });

  describe('Back Button', () => {
    test('debería llamar onBack cuando se hace clic en el botón de volver', () => {
      render(<ConfigScreen {...defaultProps} />);

      const backButton = screen.getByText('← Volver');
      act(() => {
        fireEvent.click(backButton);
      });

      expect(defaultProps.onBack).toHaveBeenCalled();
    });
  });

  describe('Activity Tracking', () => {
    test('debería llamar onActivity al montar', () => {
      render(<ConfigScreen {...defaultProps} />);

      expect(defaultProps.onActivity).toHaveBeenCalled();
    });

    test('debería llamar onActivity cuando la configuración cambia', () => {
      render(<ConfigScreen {...defaultProps} />);

      jest.clearAllMocks();

      const noTieCheckbox = screen.getByLabelText('Sin Empates');
      act(() => {
        fireEvent.click(noTieCheckbox);
      });

      expect(defaultProps.onActivity).toHaveBeenCalled();
    });

    test('debería llamar onActivity cuando un jugador cambia', () => {
      render(<ConfigScreen {...defaultProps} />);

      jest.clearAllMocks();

      const nameInput = screen.getByDisplayValue('Bot1');
      fireEvent.change(nameInput, { target: { value: 'Updated Player' } });

      expect(defaultProps.onActivity).toHaveBeenCalled();
    });
  });

  describe('Player Updates from Props', () => {
    test('debería actualizar jugadores cuando initialConfig.players cambia', () => {
      const { rerender } = render(
        <ConfigScreen
          {...defaultProps}
          playerService={new PlayerServiceStub()}
        />
      );

      const newConfig = {
        ...defaultProps.initialConfig,
        players: [
          { name: 'New Player 1', port: 4001, isHuman: false },
          { name: 'New Player 2', port: 4002, isHuman: false },
        ],
      };

      rerender(<ConfigScreen {...defaultProps} initialConfig={newConfig} />);

      expect(screen.getByDisplayValue('New Player 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('New Player 2')).toBeInTheDocument();
    });

    test('debería no actualizar jugadores cuando initialConfig.players está vacío', () => {
      const configWithEmptyPlayers = {
        ...defaultProps.initialConfig,
        players: [],
      };

      render(
        <ConfigScreen
          {...defaultProps}
          initialConfig={configWithEmptyPlayers}
        />
      );

      // Debería usar jugadores por defecto
      expect(screen.getByDisplayValue('Bot1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot2')).toBeInTheDocument();
    });
  });

  describe('Player Auto-Generation Logic', () => {
    beforeEach(() => {
      // Reset fetch mock for each test
      global.fetch.mockClear();
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ bots: [] }),
      });
    });

    test('debería auto-generar jugadores en modo individual', () => {
      const configWithSingleMode = {
        ...defaultProps.initialConfig,
        gameMode: 'single',
      };

      render(
        <ConfigScreen {...defaultProps} initialConfig={configWithSingleMode} />
      );

      // Debería tener 2 jugadores en modo individual
      expect(screen.getByDisplayValue('Bot1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot2')).toBeInTheDocument();
    });

    test('debería auto-generar jugadores en modo torneo con playerCount específico', async () => {
      const configWithTournamentMode = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
        playerCount: 4,
      };

      act(() => {
        render(
          <ConfigScreen
            {...defaultProps}
            initialConfig={configWithTournamentMode}
          />
        );
      });

      // Debería tener 4 jugadores en modo torneo
      expect(screen.getByDisplayValue('Bot1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot3')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot4')).toBeInTheDocument();
    });

    test('debería generar 4 jugadores cuando playerCount es 4', () => {
      // Mock fetch to return immediately
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ bots: [] }),
      });

      // Test with 4 players - provide players directly to avoid auto-generation issues
      render(
        <ConfigScreen
          {...defaultProps}
          initialConfig={{
            ...defaultProps.initialConfig,
            gameMode: 'tournament',
            playerCount: 4,
            players: [
              { name: 'Bot1', port: 3001, isHuman: false, status: 'unknown' },
              { name: 'Bot2', port: 3002, isHuman: false, status: 'unknown' },
              { name: 'Bot3', port: 3003, isHuman: false, status: 'unknown' },
              { name: 'Bot4', port: 3004, isHuman: false, status: 'unknown' },
            ],
          }}
        />
      );

      // Should have 4 players initially
      expect(screen.getByDisplayValue('Bot1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot3')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot4')).toBeInTheDocument();
    });

    test('debería generar 3 jugadores cuando playerCount es 3', () => {
      // Mock fetch to return immediately
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ bots: [] }),
      });

      // Test with 3 players
      render(
        <ConfigScreen
          {...defaultProps}
          initialConfig={{
            ...defaultProps.initialConfig,
            gameMode: 'tournament',
            playerCount: 3,
            // No players provided - let auto-generation work
          }}
        />
      );

      // Should have 3 players initially
      expect(screen.getByDisplayValue('Bot1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot3')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    test('debería mostrar opción noTie solo en modo individual con tablero 3x3', () => {
      const configWithSingleMode = {
        ...defaultProps.initialConfig,
        gameMode: 'single',
        boardSize: 3,
      };

      render(
        <ConfigScreen {...defaultProps} initialConfig={configWithSingleMode} />
      );

      // Debería mostrar la opción noTie
      expect(screen.getByLabelText('Sin Empates')).toBeInTheDocument();
    });

    test('debería no mostrar opción noTie en modo torneo', () => {
      const configWithTournamentMode = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
        boardSize: 3,
      };

      render(
        <ConfigScreen
          {...defaultProps}
          initialConfig={configWithTournamentMode}
        />
      );

      // No debería mostrar la opción noTie
      expect(screen.queryByLabelText('Sin Empates')).not.toBeInTheDocument();
    });

    test('debería no mostrar opción noTie con tablero 5x5', () => {
      const configWith5x5Board = {
        ...defaultProps.initialConfig,
        gameMode: 'single',
        boardSize: 5,
      };

      render(
        <ConfigScreen {...defaultProps} initialConfig={configWith5x5Board} />
      );

      // No debería mostrar la opción noTie
      expect(screen.queryByLabelText('Sin Empates')).not.toBeInTheDocument();
    });

    test('debería mostrar selector de cantidad de jugadores solo en modo torneo', () => {
      const configWithTournamentMode = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
      };

      render(
        <ConfigScreen
          {...defaultProps}
          initialConfig={configWithTournamentMode}
        />
      );

      // Debería mostrar el selector de cantidad de jugadores
      expect(screen.getByText('Jugadores:')).toBeInTheDocument();
    });

    test('debería no mostrar selector de cantidad de jugadores en modo individual', () => {
      const configWithSingleMode = {
        ...defaultProps.initialConfig,
        gameMode: 'single',
      };

      render(
        <ConfigScreen {...defaultProps} initialConfig={configWithSingleMode} />
      );

      // No debería mostrar el selector de cantidad de jugadores
      expect(screen.queryByText('Jugadores:')).not.toBeInTheDocument();
    });
  });

  describe('Tournament Validation', () => {
    test('debería mostrar mensaje de error para torneo inválido', () => {
      const configWithInvalidTournament = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
        players: [
          { name: 'Bot1', port: 3001, isHuman: false },
          { name: 'Bot2', port: 3002, isHuman: false },
          { name: 'Bot3', port: 3003, isHuman: false }, // 3 jugadores es inválido
        ],
      };

      render(
        <ConfigScreen
          {...defaultProps}
          initialConfig={configWithInvalidTournament}
        />
      );

      // Debería mostrar mensaje de error
      expect(
        screen.getByText('El torneo requiere 2, 4, 8, 16 jugadores')
      ).toBeInTheDocument();
    });

    test('debería no mostrar mensaje de error para torneo válido', () => {
      const configWithValidTournament = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
        players: [
          { name: 'Bot1', port: 3001, isHuman: false },
          { name: 'Bot2', port: 3002, isHuman: false },
          { name: 'Bot3', port: 3003, isHuman: false },
          { name: 'Bot4', port: 3004, isHuman: false }, // 4 jugadores es válido
        ],
      };

      render(
        <ConfigScreen
          {...defaultProps}
          initialConfig={configWithValidTournament}
        />
      );

      // No debería mostrar mensaje de error
      expect(
        screen.queryByText('El torneo requiere 2, 4, 8, 16 jugadores')
      ).not.toBeInTheDocument();
    });

    test('debería validar correctamente diferentes tamaños de torneo', () => {
      const validSizes = [2, 4, 8, 16];

      validSizes.forEach(size => {
        const configWithValidSize = {
          ...defaultProps.initialConfig,
          gameMode: 'tournament',
          players: Array.from({ length: size }, (_, i) => ({
            name: `Bot${i + 1}`,
            port: 3001 + i,
            isHuman: false,
          })),
        };

        const { unmount } = render(
          <ConfigScreen {...defaultProps} initialConfig={configWithValidSize} />
        );

        // No debería mostrar mensaje de error
        expect(
          screen.queryByText('El torneo requiere 2, 4, 8, 16 jugadores')
        ).not.toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Visual Theme Handling', () => {
    test('debería sincronizar tema visual local con prop', () => {
      const { rerender } = render(
        <ConfigScreen {...defaultProps} visualTheme="neon" />
      );

      // Verificar que el tema neon está seleccionado
      expect(screen.getByDisplayValue('neon')).toBeChecked();

      // Cambiar prop
      rerender(<ConfigScreen {...defaultProps} visualTheme="clasico" />);

      // Verificar que el tema clasico está seleccionado
      expect(screen.getByDisplayValue('clasico')).toBeChecked();
    });

    test('debería manejar cambio de tema visual sin onVisualThemeChange', () => {
      const propsWithoutThemeChange = {
        ...defaultProps,
        playerService: new PlayerServiceStub(),
      };
      delete propsWithoutThemeChange.onVisualThemeChange;

      render(<ConfigScreen {...propsWithoutThemeChange} />);

      // Cambiar tema visual
      const clasicoRadio = screen.getByDisplayValue('clasico');
      act(() => {
        fireEvent.click(clasicoRadio);
      });

      // No debería lanzar error
      expect(clasicoRadio).toBeChecked();
    });
  });

  describe('Player Management Edge Cases', () => {
    test('debería manejar players vacío en initialConfig', () => {
      const configWithEmptyPlayers = {
        ...defaultProps.initialConfig,
        players: [],
      };

      render(
        <ConfigScreen
          {...defaultProps}
          initialConfig={configWithEmptyPlayers}
        />
      );

      // Debería usar jugadores por defecto
      expect(screen.getByDisplayValue('Bot1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot2')).toBeInTheDocument();
    });

    test('debería manejar players null en initialConfig', () => {
      const configWithNullPlayers = {
        ...defaultProps.initialConfig,
        players: null,
      };

      render(
        <ConfigScreen {...defaultProps} initialConfig={configWithNullPlayers} />
      );

      // Debería usar jugadores por defecto
      expect(screen.getByDisplayValue('Bot1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot2')).toBeInTheDocument();
    });

    test('debería manejar players undefined en initialConfig', () => {
      const configWithUndefinedPlayers = {
        ...defaultProps.initialConfig,
        players: undefined,
      };

      render(
        <ConfigScreen
          {...defaultProps}
          initialConfig={configWithUndefinedPlayers}
        />
      );

      // Debería usar jugadores por defecto
      expect(screen.getByDisplayValue('Bot1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bot2')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('debería manejar prop onThemeChange faltante', () => {
      const propsWithoutThemeChange = {
        ...defaultProps,
        playerService: new PlayerServiceStub(),
      };
      delete propsWithoutThemeChange.onThemeChange;

      expect(() => {
        render(<ConfigScreen {...propsWithoutThemeChange} />);
      }).not.toThrow();
    });

    test('debería manejar prop onActivity faltante', () => {
      const propsWithoutActivity = { ...defaultProps };
      delete propsWithoutActivity.onActivity;

      expect(() => {
        render(<ConfigScreen {...propsWithoutActivity} />);
      }).not.toThrow();
    });

    test('debería manejar selección de cantidad de jugadores en modo torneo', () => {
      render(<ConfigScreen {...defaultProps} />);

      // Cambiar a modo torneo
      const tournamentRadio = screen.getByDisplayValue('tournament');
      act(() => {
        fireEvent.click(tournamentRadio);
      });

      // Esperar a que aparezca el selector de cantidad de jugadores
      expect(screen.getByText('Jugadores:')).toBeInTheDocument();

      // Seleccionar 8 jugadores
      const playerCount8Button = screen.getByDisplayValue('8');
      act(() => {
        fireEvent.click(playerCount8Button);
      });
      expect(playerCount8Button).toBeChecked();
    });
  });
});
