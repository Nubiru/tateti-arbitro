/**
 * Pruebas Unitarias para Máquina de Estado de GameContext
 * Pruebas de transiciones de estado correctas y manejo de eventos SSE
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

import React from 'react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, act, waitFor } from '@testing-library/react';
import {
  GameProvider,
  GameContext,
} from '../../../src/context/GameContext.jsx';

// Mock fetch
global.fetch = jest.fn();

// Mock EventSource
class MockEventSource {
  constructor(url) {
    this.url = url;
    this.listeners = {};
    this.readyState = 1; // OPEN
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        cb => cb !== callback
      );
    }
  }

  close() {
    this.readyState = 3; // CLOSED
  }

  // Método auxiliar para simular eventos
  simulateEvent(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback({ data: JSON.stringify(data) });
      });
    }
  }
}

global.EventSource = MockEventSource;

describe('Máquina de Estado de GameContext', () => {
  let mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  describe('Transiciones de Estado de startMatch()', () => {
    test('debería despachar START_MATCH inmediatamente antes de la llamada API', async () => {
      const TestComponent = () => {
        const { gameState, startMatch } = React.useContext(GameContext);
        const [stateHistory, setStateHistory] = React.useState([]);

        React.useEffect(() => {
          setStateHistory(prev => [...prev, gameState]);
        }, [gameState]);

        const handleStartMatch = async () => {
          await startMatch(
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' },
            { speed: 'normal' }
          );
        };

        return (
          <div>
            <div data-testid="game-state">{gameState}</div>
            <div data-testid="state-history">
              {JSON.stringify(stateHistory)}
            </div>
            <button onClick={handleStartMatch}>Start Match</button>
          </div>
        );
      };

      // Mock respuesta exitosa de API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          matchId: 'test-match-123',
          players: [
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' },
          ],
          boardSize: 3,
          currentPlayer: { name: 'Bot1', type: 'algorithm' },
          waitingForHuman: false,
        }),
      });

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Estado inicial debería ser idle
      expect(screen.getByTestId('game-state')).toHaveTextContent('idle');

      // Hacer clic en iniciar partida
      await act(async () => {
        screen.getByText('Start Match').click();
      });

      // Debería transicionar inmediatamente al estado playing
      await waitFor(() => {
        const stateHistory = JSON.parse(
          screen.getByTestId('state-history').textContent
        );
        expect(stateHistory).toContain('playing');
      });

      // Verificar que API fue llamada
      expect(mockFetch).toHaveBeenCalledWith('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Bot1'),
      });
    });

    test('debería manejar partidas de jugador humano correctamente', async () => {
      const TestComponent = () => {
        const { gameState, startMatch } = React.useContext(GameContext);
        const [stateHistory, setStateHistory] = React.useState([]);

        React.useEffect(() => {
          setStateHistory(prev => [...prev, gameState]);
        }, [gameState]);

        const handleStartMatch = async () => {
          await startMatch(
            { name: 'Human Player', type: 'human' },
            { name: 'Bot1', type: 'algorithm' },
            { speed: 'normal' }
          );
        };

        return (
          <div>
            <div data-testid="game-state">{gameState}</div>
            <div data-testid="state-history">
              {JSON.stringify(stateHistory)}
            </div>
            <button onClick={handleStartMatch}>Start Match</button>
          </div>
        );
      };

      // Mock respuesta de API para jugador humano
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          matchId: 'test-match-123',
          players: [
            { name: 'Human Player', type: 'human' },
            { name: 'Bot1', type: 'algorithm' },
          ],
          boardSize: 3,
          currentPlayer: { name: 'Human Player', type: 'human' },
          waitingForHuman: true,
        }),
      });

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Hacer clic en iniciar partida
      await act(async () => {
        screen.getByText('Start Match').click();
      });

      // Debería transicionar al estado playing y esperar entrada humana
      await waitFor(() => {
        const stateHistory = JSON.parse(
          screen.getByTestId('state-history').textContent
        );
        expect(stateHistory).toContain('playing');
      });

      expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
    });

    test('debería manejar errores de API de forma elegante', async () => {
      const TestComponent = () => {
        const { gameState, startMatch, error } = React.useContext(GameContext);

        const handleStartMatch = async () => {
          await startMatch(
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' },
            { speed: 'normal' }
          );
        };

        return (
          <div>
            <div data-testid="game-state">{gameState}</div>
            <div data-testid="error">{error || 'no error'}</div>
            <button onClick={handleStartMatch}>Start Match</button>
          </div>
        );
      };

      // Mock error de API
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Hacer clic en iniciar partida
      await act(async () => {
        screen.getByText('Start Match').click();
      });

      // Debería transicionar al estado de error
      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('error');
        expect(screen.getByTestId('error')).toHaveTextContent('API Error');
      });
    });
  });

  describe('Acciones de Máquina de Estado', () => {
    test('debería manejar transiciones de estado correctamente', async () => {
      // Mock respuesta exitosa de API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          matchId: 'test-match-123',
          players: [
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' },
          ],
          boardSize: 3,
          currentPlayer: { name: 'Bot1', type: 'algorithm' },
          waitingForHuman: false,
        }),
      });

      const TestComponent = () => {
        const { gameState, currentMatch, startMatch } =
          React.useContext(GameContext);

        return (
          <div>
            <div data-testid="game-state">{gameState}</div>
            <div data-testid="match-data">{JSON.stringify(currentMatch)}</div>
            <button
              onClick={() =>
                startMatch(
                  { name: 'Bot1', type: 'algorithm' },
                  { name: 'Bot2', type: 'random' },
                  { speed: 'normal' }
                )
              }
            >
              Start Match
            </button>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Estado inicial debería ser idle
      expect(screen.getByTestId('game-state')).toHaveTextContent('idle');

      // Simular acción START_MATCH haciendo clic en el botón
      await act(async () => {
        const button = screen.getByText('Start Match');
        button.click();
      });

      // Debería transicionar al estado playing
      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });
    });
  });

  describe('Casos Límite de Transición de Estado', () => {
    test('no debería cambiar estado si ya está en pantalla de presentación', async () => {
      const TestComponent = () => {
        const { gameState } = React.useContext(GameContext);

        return (
          <div>
            <div data-testid="game-state">{gameState}</div>
          </div>
        );
      };

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Estado inicial debería ser idle
      expect(screen.getByTestId('game-state')).toHaveTextContent('idle');
    });

    test('debería manejar múltiples cambios de estado rápidos', async () => {
      const TestComponent = () => {
        const { gameState, startMatch } = React.useContext(GameContext);
        const [stateHistory, setStateHistory] = React.useState([]);

        React.useEffect(() => {
          setStateHistory(prev => [...prev, gameState]);
        }, [gameState]);

        const handleRapidCalls = async () => {
          // Hacer múltiples llamadas rápidas
          startMatch(
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' }
          );
          startMatch(
            { name: 'Bot3', type: 'algorithm' },
            { name: 'Bot4', type: 'random' }
          );
        };

        return (
          <div>
            <div data-testid="game-state">{gameState}</div>
            <div data-testid="state-history">
              {JSON.stringify(stateHistory)}
            </div>
            <button onClick={handleRapidCalls}>Rapid Calls</button>
          </div>
        );
      };

      // Mock respuestas de API
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          matchId: 'test-match-123',
          players: [
            { name: 'Bot1', type: 'algorithm' },
            { name: 'Bot2', type: 'random' },
          ],
          boardSize: 3,
          currentPlayer: { name: 'Bot1', type: 'algorithm' },
          waitingForHuman: false,
        }),
      });

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Hacer clic en llamadas rápidas
      await act(async () => {
        screen.getByText('Rapid Calls').click();
      });

      // Debería manejar llamadas rápidas de forma elegante
      await waitFor(() => {
        const stateHistory = JSON.parse(
          screen.getByTestId('state-history').textContent
        );
        expect(stateHistory).toContain('playing');
      });
    });
  });
});
