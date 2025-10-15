/**
 * Pruebas Unitarias de GameContainer
 * Pruebas para el componente GameContainer
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameContainer from '../../../src/containers/GameContainer';

// Simular el GameContext
const mockUseGame = jest.fn();
jest.mock('../../../src/context/GameContext', () => ({
  useGame: () => mockUseGame(),
}));

// Simular componentes hijos
jest.mock('../../../src/screens/PresentationScreen', () => {
  return function MockPresentationScreen({ onStart, onActivity }) {
    return (
      <div data-testid="presentation-screen">
        <button onClick={onStart}>Iniciar Juego</button>
        <button onClick={onActivity}>Actividad</button>
      </div>
    );
  };
});

jest.mock('../../../src/screens/ConfigScreen', () => {
  return function MockConfigScreen({ onBack, onActivity }) {
    return (
      <div data-testid="config-screen">
        <button onClick={onBack}>Atrás</button>
        <button onClick={onActivity}>Actividad</button>
      </div>
    );
  };
});

jest.mock('../../../src/screens/ProgressScreen', () => {
  return function MockProgressScreen({
    config,
    onTournamentBracket,
    onGameComplete,
    onBack,
    onActivity,
  }) {
    return (
      <div data-testid="progress-screen">
        <div data-testid="config-data">{JSON.stringify(config)}</div>
        <button onClick={onTournamentBracket}>Llave del Torneo</button>
        <button onClick={onGameComplete}>Juego Completado</button>
        <button onClick={onBack}>Atrás</button>
        <button onClick={onActivity}>Actividad</button>
      </div>
    );
  };
});

jest.mock('../../../src/screens/CelebrationScreen', () => {
  return function MockCelebrationScreen({
    matchResult,
    tournamentResult,
    onBack,
    onActivity,
  }) {
    return (
      <div data-testid="celebration-screen">
        <div data-testid="match-result">{JSON.stringify(matchResult)}</div>
        <div data-testid="tournament-result">
          {JSON.stringify(tournamentResult)}
        </div>
        <button onClick={onBack}>Atrás</button>
        <button onClick={onActivity}>Actividad</button>
      </div>
    );
  };
});

jest.mock('../../../src/components/BracketView', () => {
  return function MockBracketView({ tournament, config }) {
    return (
      <div data-testid="bracket-view">
        <div data-testid="tournament-data">{JSON.stringify(tournament)}</div>
        <div data-testid="bracket-config">{JSON.stringify(config)}</div>
      </div>
    );
  };
});

describe('Componente GameContainer', () => {
  const mockConfig = {
    players: [
      { id: 1, name: 'Jugador 1', port: 3001 },
      { id: 2, name: 'Jugador 2', port: 3002 },
    ],
    gameMode: 'single',
    boardSize: 3,
  };

  const mockTournament = {
    rounds: [
      {
        completed: true,
        matches: [{ player1: 1, player2: 2, winner: 1 }],
      },
    ],
    winner: 1,
    runnerUp: 2,
  };

  const mockMatchResult = {
    result: 'win',
    winner: 'Jugador 1',
    moves: 5,
  };

  const mockTournamentResult = {
    status: 'completed',
    winner: 'Jugador 1',
    runnerUp: 'Jugador 2',
  };

  const renderWithProvider = (gameState = 'idle', overrides = {}) => {
    const defaultContextValue = {
      gameState,
      config: mockConfig,
      tournament: mockTournament,
      matchResult: mockMatchResult,
      tournamentResult: mockTournamentResult,
      resetGame: jest.fn(),
      connectionStatus: 'connected',
      moveQueue: [],
      isProcessingMoves: false,
      // Player management properties
      players: [],
      availableBots: [],
      botDiscoveryStatus: 'idle',
      discoverBots: jest.fn(),
      populatePlayersForMode: jest.fn(),
      updatePlayer: jest.fn(),
      // Game actions
      startMatch: jest.fn(),
      startTournament: jest.fn(),
      ...overrides,
    };

    mockUseGame.mockReturnValue(defaultContextValue);
    return render(
      <GameContainer visualTheme="neon" onVisualThemeChange={jest.fn()} />
    );
  };

  describe('Renderizado Inicial', () => {
    test('debería renderizar la pantalla de presentación inicialmente', () => {
      renderWithProvider('idle');

      expect(screen.getByTestId('presentation-screen')).toBeInTheDocument();
    });

    test('debería renderizar la pantalla de configuración cuando gameState es idle y no está en presentación', () => {
      renderWithProvider('idle');

      // Hacer clic en iniciar para moverse de presentación a configuración
      fireEvent.click(screen.getByText('Iniciar Juego'));

      expect(screen.getByTestId('config-screen')).toBeInTheDocument();
    });
  });

  describe('Transiciones de Pantalla', () => {
    test('debería transicionar a la pantalla de configuración cuando gameState es idle', () => {
      renderWithProvider('idle');

      // Comenzar desde la pantalla de configuración (no presentación)
      fireEvent.click(screen.getByText('Iniciar Juego'));

      expect(screen.getByTestId('config-screen')).toBeInTheDocument();
    });

    test('debería transicionar a la pantalla de progreso cuando gameState es playing', () => {
      renderWithProvider('playing');

      // El GameContainer debería mostrar la pantalla de progreso para el estado playing
      // Esto debería funcionar inmediatamente ya que la lógica está en useEffect
      expect(screen.getByTestId('progress-screen')).toBeInTheDocument();
    });

    test('debería transicionar a la pantalla de celebración cuando gameState es completed', () => {
      // For completed state without tournament, should show celebration
      renderWithProvider('completed', { tournament: null });

      expect(screen.getByTestId('celebration-screen')).toBeInTheDocument();
    });

    test('debería transicionar a la pantalla de llave cuando gameState es tournament', () => {
      renderWithProvider('tournament');

      expect(screen.getByTestId('bracket-view')).toBeInTheDocument();
    });

    test('debería transicionar a la pantalla de celebración cuando gameState es tournament_completed', () => {
      renderWithProvider('tournament_completed');

      expect(screen.getByTestId('celebration-screen')).toBeInTheDocument();
    });

    test('debería transicionar a la pantalla de configuración cuando gameState es error', () => {
      renderWithProvider('error');

      expect(screen.getByTestId('config-screen')).toBeInTheDocument();
    });

    test('debería usar por defecto la pantalla de configuración para gameState desconocido', () => {
      renderWithProvider('unknown');

      // Para gameState desconocido, debería usar por defecto la pantalla de configuración
      // Pero primero necesitamos alejarnos de la pantalla de presentación
      fireEvent.click(screen.getByText('Iniciar Juego'));
      expect(screen.getByTestId('config-screen')).toBeInTheDocument();
    });

    test('debería manejar el caso por defecto en la declaración switch', () => {
      // Primero renderizar con un estado válido para alejarse de la presentación
      const { rerender } = renderWithProvider('idle');

      // Moverse a la pantalla de configuración primero
      fireEvent.click(screen.getByText('Iniciar Juego'));
      expect(screen.getByTestId('config-screen')).toBeInTheDocument();

      // Ahora cambiar a estado inválido - esto debería activar el caso por defecto
      // y mantenernos en la pantalla de configuración ya que no estamos en presentación
      mockUseGame.mockReturnValue({
        gameState: 'invalid_state',
        config: mockConfig,
        tournament: mockTournament,
        matchResult: mockMatchResult,
        tournamentResult: mockTournamentResult,
        resetGame: jest.fn(),
        connectionStatus: 'connected',
        moveQueue: [],
        isProcessingMoves: false,
        // Player management properties
        players: [],
        availableBots: [],
        botDiscoveryStatus: 'idle',
        discoverBots: jest.fn(),
        populatePlayersForMode: jest.fn(),
        updatePlayer: jest.fn(),
      });

      rerender(
        <GameContainer visualTheme="neon" onVisualThemeChange={jest.fn()} />
      );

      // Debería seguir en la pantalla de configuración como caso por defecto
      expect(screen.getByTestId('config-screen')).toBeInTheDocument();
    });
  });

  describe('Navegación de Pantalla', () => {
    test('debería manejar la navegación hacia atrás a la pantalla de configuración', () => {
      renderWithProvider('playing');

      // Debería estar en la pantalla de progreso
      expect(screen.getByTestId('progress-screen')).toBeInTheDocument();

      // Hacer clic en el botón atrás - esto no debería lanzar un error
      expect(() => {
        fireEvent.click(screen.getByText('Atrás'));
      }).not.toThrow();
    });

    test('debería manejar la navegación a la llave del torneo', () => {
      renderWithProvider('playing');

      // Hacer clic en el botón de llave del torneo - esto no debería lanzar un error
      expect(() => {
        fireEvent.click(screen.getByText('Llave del Torneo'));
      }).not.toThrow();
    });

    test('debería manejar la navegación de finalización del juego', () => {
      renderWithProvider('playing');

      // Hacer clic en el botón de juego completado - esto no debería lanzar un error
      expect(() => {
        fireEvent.click(screen.getByText('Juego Completado'));
      }).not.toThrow();
    });
  });

  describe('Paso de Datos', () => {
    test('debería pasar los datos de configuración a ProgressScreen', () => {
      renderWithProvider('playing');

      expect(screen.getByTestId('config-data')).toHaveTextContent(
        JSON.stringify(mockConfig)
      );
    });

    test('debería pasar los datos del torneo a BracketView', () => {
      renderWithProvider('tournament');

      expect(screen.getByTestId('tournament-data')).toHaveTextContent(
        JSON.stringify(mockTournament)
      );
      expect(screen.getByTestId('bracket-config')).toHaveTextContent(
        JSON.stringify(mockConfig)
      );
    });

    test('debería pasar el resultado del partido a CelebrationScreen', () => {
      // For completed state without tournament, should show celebration
      renderWithProvider('completed', { tournament: null });

      expect(screen.getByTestId('match-result')).toHaveTextContent(
        JSON.stringify(mockMatchResult)
      );
    });

    test('debería pasar el resultado del torneo a CelebrationScreen', () => {
      renderWithProvider('tournament_completed');

      expect(screen.getByTestId('tournament-result')).toHaveTextContent(
        JSON.stringify(mockTournamentResult)
      );
    });
  });

  describe('Manejo de Actividad', () => {
    test('debería manejar la actividad desde PresentationScreen', () => {
      renderWithProvider('idle');

      // No debería lanzar error al hacer clic en el botón de actividad
      expect(() => {
        fireEvent.click(screen.getByText('Actividad'));
      }).not.toThrow();
    });

    test('debería manejar la actividad desde ConfigScreen', () => {
      renderWithProvider('idle');

      // Moverse a la pantalla de configuración
      fireEvent.click(screen.getByText('Iniciar Juego'));

      // No debería lanzar error al hacer clic en el botón de actividad
      expect(() => {
        fireEvent.click(screen.getByText('Actividad'));
      }).not.toThrow();
    });

    test('debería manejar la actividad desde ProgressScreen', () => {
      renderWithProvider('playing');

      // No debería lanzar error al hacer clic en el botón de actividad
      expect(() => {
        fireEvent.click(screen.getByText('Actividad'));
      }).not.toThrow();
    });

    test('debería manejar la actividad desde CelebrationScreen', () => {
      renderWithProvider('completed', { tournament: null });

      // No debería lanzar error al hacer clic en el botón de actividad
      expect(() => {
        fireEvent.click(screen.getByText('Actividad'));
      }).not.toThrow();
    });
  });

  describe('Casos Extremos', () => {
    test('debería manejar datos de configuración faltantes', () => {
      renderWithProvider('playing', { config: null });

      expect(screen.getByTestId('progress-screen')).toBeInTheDocument();
      expect(screen.getByTestId('config-data')).toHaveTextContent('null');
    });

    test('debería manejar datos de torneo faltantes', () => {
      renderWithProvider('tournament', { tournament: null });

      expect(screen.getByTestId('bracket-view')).toBeInTheDocument();
      expect(screen.getByTestId('tournament-data')).toHaveTextContent('null');
    });

    test('debería manejar resultado de partido faltante', () => {
      // For completed state without tournament, should show celebration
      renderWithProvider('completed', { tournament: null, matchResult: null });

      expect(screen.getByTestId('celebration-screen')).toBeInTheDocument();
      expect(screen.getByTestId('match-result')).toHaveTextContent('null');
    });

    test('debería manejar resultado de torneo faltante', () => {
      renderWithProvider('tournament_completed', { tournamentResult: null });

      expect(screen.getByTestId('celebration-screen')).toBeInTheDocument();
      expect(screen.getByTestId('tournament-result')).toHaveTextContent('null');
    });
  });

  describe('Gestión de Estado', () => {
    test('debería mantener el estado actual de la pantalla', () => {
      renderWithProvider('idle');

      // Comenzar desde presentación
      expect(screen.getByTestId('presentation-screen')).toBeInTheDocument();

      // Moverse a configuración
      fireEvent.click(screen.getByText('Iniciar Juego'));
      expect(screen.getByTestId('config-screen')).toBeInTheDocument();

      // Moverse a progreso
      renderWithProvider('playing');
      expect(screen.getByTestId('progress-screen')).toBeInTheDocument();
    });

    test('no debería cambiar automáticamente desde la pantalla de presentación cuando está idle', () => {
      renderWithProvider('idle');

      // Debería permanecer en la pantalla de presentación
      expect(screen.getByTestId('presentation-screen')).toBeInTheDocument();
    });
  });

  describe('Clases CSS', () => {
    test('debería aplicar la clase game-container al elemento raíz', () => {
      const { container } = renderWithProvider('idle');

      expect(container.firstChild).toHaveClass('game-container');
    });
  });

  describe('Integración de Componentes', () => {
    test('debería renderizar todos los componentes hijos correctamente', () => {
      // Probar cada tipo de pantalla
      const screens = [
        { state: 'idle', component: 'presentation-screen' },
        { state: 'playing', component: 'progress-screen' },
        { state: 'completed', component: 'celebration-screen' },
        { state: 'tournament', component: 'bracket-view' },
        { state: 'tournament_completed', component: 'celebration-screen' },
        { state: 'error', component: 'config-screen' },
      ];

      screens.forEach(({ state, component }) => {
        // For completed state, we need to ensure no tournament to show celebration
        const overrides = state === 'completed' ? { tournament: null } : {};
        const { unmount } = renderWithProvider(state, overrides);

        if (state === 'idle') {
          // Para el estado idle, necesitamos hacer clic en iniciar para ver la pantalla de configuración
          fireEvent.click(screen.getByText('Iniciar Juego'));
          expect(screen.getByTestId('config-screen')).toBeInTheDocument();
        } else {
          expect(screen.getByTestId(component)).toBeInTheDocument();
        }

        unmount();
      });
    });
  });
});
