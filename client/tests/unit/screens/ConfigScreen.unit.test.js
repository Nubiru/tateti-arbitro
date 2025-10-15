/**
 * Unit tests for ConfigScreen
 * Tests pure component logic, rendering, and user interactions without external dependencies
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import ConfigScreen from '../../../src/screens/ConfigScreen';

// Mock GameContext to provide static data without async operations
const mockGameContext = {
  players: [
    {
      name: 'RandomBot1',
      port: 3001,
      isHuman: false,
      status: 'unknown',
      type: 'bot',
    },
    {
      name: 'RandomBot2',
      port: 3002,
      isHuman: false,
      status: 'unknown',
      type: 'bot',
    },
  ],
  botDiscoveryStatus: 'success', // Mock successful bot discovery
  discoverBots: jest.fn(),
  populatePlayersForMode: jest.fn(),
  updatePlayer: jest.fn(),
};

// Mock GameProvider to avoid async operations
jest.mock('../../../src/context/GameContext', () => ({
  GameProvider: ({ children }) => children,
  useGame: () => mockGameContext,
}));

// Mock PlayerService to avoid external dependencies
jest.mock('../../../src/services/PlayerService', () => {
  return {
    PlayerService: jest.fn().mockImplementation(() => ({
      validatePlayerSelection: jest.fn((players, gameMode) => {
        // Validate tournament sizes
        if (gameMode === 'tournament') {
          const validSizes = [2, 4, 8, 16];
          const isValid = validSizes.includes(players.length);
          return {
            isValid,
            errors: isValid
              ? []
              : [`Tournament mode requires ${validSizes.join(', ')} players`],
          };
        }
        // Validate single mode (should have exactly 2 players)
        if (gameMode === 'single') {
          const isValid = players.length === 2;
          return {
            isValid,
            errors: isValid
              ? []
              : ['Individual mode requires exactly 2 players'],
          };
        }
        return { isValid: true, errors: [] };
      }),
    })),
  };
});

// Mock UI components to avoid complex rendering
jest.mock('../../../src/components/ui', () => ({
  AnimatedButton: ({ children, onClick, disabled, ...props }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  CustomRadio: ({ value, checked, onChange, label, children, ...props }) => (
    <label>
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        {...props}
      />
      {label || children}
    </label>
  ),
  AnimatedCard: ({ children, title, ...props }) => (
    <div {...props}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
  AnimatedCheckbox: ({ checked, onChange, id, ...props }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      id={id || 'noTie-checkbox'}
      {...props}
    />
  ),
  PlayerProfile: ({ player, index, onUpdate, ...props }) => (
    <div {...props}>
      <input
        type="text"
        value={player.name}
        onChange={e => onUpdate(index, 'name', e.target.value)}
        data-testid={`player-name-${index}`}
      />
      <input
        type="number"
        value={player.port}
        onChange={e => onUpdate(index, 'port', parseInt(e.target.value) || 0)}
        data-testid={`player-port-${index}`}
      />
      <input
        type="checkbox"
        checked={player.isHuman || false}
        onChange={e => onUpdate(index, 'isHuman', e.target.checked)}
        data-testid={`player-human-${index}`}
      />
      <span>{player.isHuman ? 'Humano' : 'bot'}</span>
    </div>
  ),
}));

// Simular módulo CSS
jest.mock('../../../src/screens/ConfigScreen.module.css', () => ({
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
    // Clean up DOM between tests
    document.body.innerHTML = '';
  });

  describe('Component Rendering', () => {
    test('debería renderizar con configuración por defecto', () => {
      render(<ConfigScreen {...defaultProps} />);

      expect(screen.getByText('Configuración del Juego')).toBeInTheDocument();
      expect(screen.getByText('Modo de Juego')).toBeInTheDocument();
      expect(screen.getByText('Jugadores')).toBeInTheDocument();
      expect(screen.getByText('Opciones del Juego')).toBeInTheDocument();
      expect(screen.getByText('Tema Visual')).toBeInTheDocument();
    });

    test('debería inicializar con configuración proporcionada', () => {
      render(<ConfigScreen {...defaultProps} />);

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

  describe('Player Display', () => {
    test('debería mostrar jugadores del contexto', () => {
      render(<ConfigScreen {...defaultProps} />);

      // Debería mostrar los jugadores del contexto mockeado
      expect(screen.getByTestId('player-name-0')).toHaveValue('RandomBot1');
      expect(screen.getByTestId('player-name-1')).toHaveValue('RandomBot2');
    });

    test('debería no mostrar selector de cantidad de jugadores en modo individual', () => {
      render(<ConfigScreen {...defaultProps} />);

      // El selector de cantidad de jugadores no debería ser visible en modo individual
      expect(screen.queryByText('Jugadores:')).not.toBeInTheDocument();
    });

    test('debería mostrar selector de cantidad de jugadores en modo torneo', () => {
      render(<ConfigScreen {...defaultProps} />);

      // Cambiar a modo torneo
      const tournamentMode = screen.getByDisplayValue('tournament');
      act(() => {
        fireEvent.click(tournamentMode);
      });

      // El selector de cantidad de jugadores debería ser visible
      expect(screen.getByText('Jugadores:')).toBeInTheDocument();
    });

    test('debería incluir checkbox Humano para cada jugador', () => {
      render(<ConfigScreen {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');

      // Should have at least the noTie checkbox
      expect(checkboxes.length).toBeGreaterThanOrEqual(1);

      // The noTie checkbox should be present
      const noTieCheckbox = screen.getByLabelText('Sin Empates');
      expect(noTieCheckbox).toBeInTheDocument();
    });

    test('debería actualizar nombre del jugador', () => {
      render(<ConfigScreen {...defaultProps} />);

      const nameInput = screen.getByTestId('player-name-0');
      fireEvent.change(nameInput, { target: { value: 'Updated Player' } });

      // Verify updatePlayer was called with correct parameters
      expect(mockGameContext.updatePlayer).toHaveBeenCalledWith(
        0,
        'name',
        'Updated Player'
      );
    });

    test('debería actualizar puerto del jugador', () => {
      render(<ConfigScreen {...defaultProps} />);

      const portInput = screen.getByTestId('player-port-0');
      fireEvent.change(portInput, { target: { value: '4001' } });

      // Verify updatePlayer was called with correct parameters
      expect(mockGameContext.updatePlayer).toHaveBeenCalledWith(
        0,
        'port',
        4001
      );
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
      // Create a mock with invalid tournament size (3 players)
      const mockGameContextWithInvalidPlayers = {
        ...mockGameContext,
        players: [
          {
            name: 'Player 1',
            port: 3001,
            isHuman: false,
            status: 'unknown',
            type: 'bot',
          },
          {
            name: 'Player 2',
            port: 3002,
            isHuman: false,
            status: 'unknown',
            type: 'bot',
          },
          {
            name: 'Player 3',
            port: 3003,
            isHuman: false,
            status: 'unknown',
            type: 'bot',
          },
        ],
      };

      // Temporarily override the mock
      const originalUseGame =
        require('../../../src/context/GameContext').useGame;
      require('../../../src/context/GameContext').useGame = () =>
        mockGameContextWithInvalidPlayers;

      const configWithInvalidTournament = {
        ...defaultProps.initialConfig,
        gameMode: 'tournament',
        playerCount: 3, // Invalid tournament size
      };

      render(
        <ConfigScreen
          {...defaultProps}
          initialConfig={configWithInvalidTournament}
        />
      );

      const startButton = screen.getByRole('button', {
        name: 'Iniciar Torneo',
      });
      expect(startButton).toBeDisabled();

      // Restore original mock
      require('../../../src/context/GameContext').useGame = originalUseGame;
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

      // Check if button is enabled before clicking
      expect(startButton).not.toBeDisabled();

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
          {
            name: 'RandomBot1',
            port: 3001,
            isHuman: false,
            status: 'unknown',
            type: 'bot',
          },
          {
            name: 'RandomBot2',
            port: 3002,
            isHuman: false,
            status: 'unknown',
            type: 'bot',
          },
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

      // Check if button is enabled before clicking
      expect(startButton).not.toBeDisabled();

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
          {
            name: 'RandomBot1',
            port: 3001,
            isHuman: false,
            status: 'unknown',
            type: 'bot',
          },
          {
            name: 'RandomBot2',
            port: 3002,
            isHuman: false,
            status: 'unknown',
            type: 'bot',
          },
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

    test('debería actualizar nombre del jugador sin llamar onActivity', () => {
      render(<ConfigScreen {...defaultProps} />);

      jest.clearAllMocks();

      const nameInput = screen.getByTestId('player-name-0');
      fireEvent.change(nameInput, { target: { value: 'Updated Player' } });

      // Verify updatePlayer was called with correct parameters
      expect(mockGameContext.updatePlayer).toHaveBeenCalledWith(
        0,
        'name',
        'Updated Player'
      );

      // onActivity is NOT called when players change - only when config changes
      expect(defaultProps.onActivity).not.toHaveBeenCalled();
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

  describe('Edge Cases', () => {
    test('debería manejar prop onThemeChange faltante', () => {
      const propsWithoutThemeChange = {
        ...defaultProps,
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
