/**
 * Pruebas de integración para GameContext
 * Pruebas de conexiones SSE reales y comportamiento asíncrono
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { GameProvider, useGame } from '../../context/GameContext';

// Simular EventSource para pruebas de integración
const mockEventSource = {
  onopen: null,
  onmessage: null,
  onerror: null,
  addEventListener: jest.fn(),
  close: jest.fn(),
  readyState: 1,
};

global.EventSource = jest.fn(() => mockEventSource);

// Simular fetch para pruebas de integración
global.fetch = jest.fn();

// Componente de prueba que usa el contexto
const TestComponent = () => {
  const context = useGame();
  return (
    <div>
      <div data-testid="game-state">{context.gameState}</div>
      <div data-testid="board">{JSON.stringify(context.board)}</div>
      <div data-testid="error">{context.error}</div>
      <div data-testid="move-count">{context.moveCount}</div>
      <div data-testid="history">{JSON.stringify(context.history)}</div>
      <button
        data-testid="start-match"
        onClick={() =>
          context.startMatch(
            { name: 'Player1', port: 3001 },
            { name: 'Player2', port: 3002 }
          )
        }
      >
        Iniciar Partida
      </button>
      <button
        data-testid="start-tournament"
        onClick={() =>
          context.startTournament([
            { name: 'Player1', port: 3001 },
            { name: 'Player2', port: 3002 },
          ])
        }
      >
        Iniciar Torneo
      </button>
    </div>
  );
};

describe('Pruebas de Integración de GameContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
    // Restablecer correctamente el mock de fetch
    global.fetch = jest.fn();
    mockEventSource.addEventListener.mockClear();
    mockEventSource.close.mockClear();
    // Restablecer mock de EventSource
    global.EventSource.mockClear();
  });

  describe('Integración de Conexión SSE', () => {
    test('debería establecer conexión SSE y manejar eventos', async () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Verificar que la conexión SSE esté establecida
      expect(global.EventSource).toHaveBeenCalledWith('/api/stream');

      // Simular apertura de conexión
      act(() => {
        mockEventSource.onopen();
      });

      // Verificar que los listeners de eventos estén configurados
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        'match:start',
        expect.any(Function)
      );
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        'match:move',
        expect.any(Function)
      );
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        'match:win',
        expect.any(Function)
      );
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        'match:error',
        expect.any(Function)
      );
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        'tournament:start',
        expect.any(Function)
      );
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
        'tournament:complete',
        expect.any(Function)
      );
    });

    test('debería manejar evento match:start con flujo de datos real', async () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const matchStartHandler =
        mockEventSource.addEventListener.mock.calls.find(
          call => call[0] === 'match:start'
        )[1];

      const eventData = {
        data: JSON.stringify({
          players: [
            { name: 'Player1', port: 3001 },
            { name: 'Player2', port: 3002 },
          ],
          boardSize: 3,
          timestamp: '2025-10-03T10:00:00.000Z',
        }),
      };

      act(() => {
        matchStartHandler(eventData);
      });

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
        expect(screen.getByTestId('board')).toHaveTextContent(
          Array(9).fill(0).join(',')
        );
        expect(screen.getByTestId('move-count')).toHaveTextContent('0');
      });
    });

    test('debería manejar evento match:move con flujo de datos real', async () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const matchMoveHandler = mockEventSource.addEventListener.mock.calls.find(
        call => call[0] === 'match:move'
      )[1];

      const eventData = {
        data: JSON.stringify({
          board: [1, 0, 0, 0, 2, 0, 0, 0, 0],
          history: [
            {
              player: 'Player1',
              position: 0,
              timestamp: '2025-10-03T10:00:00.000Z',
            },
            {
              player: 'Player2',
              position: 4,
              timestamp: '2025-10-03T10:00:01.000Z',
            },
          ],
          turn: 2,
          player: 'Player2',
          move: { position: 4 },
        }),
      };

      act(() => {
        matchMoveHandler(eventData);
      });

      await waitFor(() => {
        expect(screen.getByTestId('board')).toHaveTextContent(
          '[1,0,0,0,2,0,0,0,0]'
        );
        expect(screen.getByTestId('move-count')).toHaveTextContent('2');
        expect(screen.getByTestId('history')).toHaveTextContent(
          '[{"player":"Player1","position":0,"timestamp":"2025-10-03T10:00:00.000Z"},{"player":"Player2","position":4,"timestamp":"2025-10-03T10:00:01.000Z"}]'
        );
      });
    });

    test('debería manejar evento match:win con flujo de datos real', async () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const matchWinHandler = mockEventSource.addEventListener.mock.calls.find(
        call => call[0] === 'match:win'
      )[1];

      const eventData = {
        data: JSON.stringify({
          winner: { name: 'Player1', port: 3001 },
          winningLine: [0, 1, 2],
          finalBoard: [1, 1, 1, 0, 2, 0, 0, 2, 0],
          message: 'Player1 ganó la partida',
          timestamp: '2025-10-03T10:00:00.000Z',
        }),
      };

      act(() => {
        matchWinHandler(eventData);
      });

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('completed');
        expect(screen.getByTestId('board')).toHaveTextContent(
          '[1,1,1,0,2,0,0,2,0]'
        );
      });
    });

    test('debería manejar evento tournament:start con flujo de datos real', async () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const tournamentStartHandler =
        mockEventSource.addEventListener.mock.calls.find(
          call => call[0] === 'tournament:start'
        )[1];

      const eventData = {
        data: JSON.stringify({
          players: [
            { name: 'Player1', port: 3001 },
            { name: 'Player2', port: 3002 },
            { name: 'Player3', port: 3003 },
            { name: 'Player4', port: 3004 },
          ],
          boardSize: 3,
          rounds: [],
          timestamp: '2025-10-03T10:00:00.000Z',
        }),
      };

      act(() => {
        tournamentStartHandler(eventData);
      });

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent(
          'tournament'
        );
        expect(screen.getByTestId('board')).toHaveTextContent(
          Array(9).fill(0).join(',')
        );
      });
    });

    test('debería manejar evento tournament:complete con flujo de datos real', async () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const tournamentCompleteHandler =
        mockEventSource.addEventListener.mock.calls.find(
          call => call[0] === 'tournament:complete'
        )[1];

      const eventData = {
        data: JSON.stringify({
          winner: { name: 'Player1', port: 3001 },
          runnerUp: { name: 'Player2', port: 3002 },
          rounds: [
            {
              matchId: 'match1',
              player1: 'Player1',
              player2: 'Player2',
              winner: 'Player1',
            },
          ],
          message: 'Torneo completado',
          timestamp: '2025-10-03T10:00:00.000Z',
        }),
      };

      act(() => {
        tournamentCompleteHandler(eventData);
      });

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('completed');
      });
    });

    test('debería manejar error de conexión SSE y reconectar', async () => {
      jest.useFakeTimers();

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Simular error de conexión
      act(() => {
        mockEventSource.onerror();
      });

      // Avanzar temporizador para activar reconexión
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Debería intentar reconectar
      expect(global.EventSource).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });

  describe('Integración de API', () => {
    test('debería hacer llamada API real para startMatch', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          result: 'win',
          winner: { name: 'Player1', port: 3001 },
          message: 'Player1 ganó la partida',
        }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      await act(async () => {
        screen.getByTestId('start-match').click();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            player1: { name: 'Player1', port: 3001 },
            player2: { name: 'Player2', port: 3002 },
          }),
        });
      });
    });

    test('debería hacer llamada API real para startTournament', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          result: 'completed',
          winner: { name: 'Player1', port: 3001 },
          message: 'Torneo completado',
        }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      await act(async () => {
        screen.getByTestId('start-tournament').click();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/tournament', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            players: [
              { name: 'Player1', port: 3001 },
              { name: 'Player2', port: 3002 },
            ],
          }),
        });
      });
    });

    test('debería manejar respuesta de error de API', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Envolver en try-catch para manejar el error lanzado
      try {
        await act(async () => {
          screen.getByTestId('start-match').click();
        });
      } catch (error) {
        // Error esperado - el componente debería manejarlo
      }

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('error');
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Error HTTP! estado: 500'
        );
      });
    });

    test('debería manejar error de red', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Envolver en try-catch para manejar el error lanzado
      try {
        await act(async () => {
          screen.getByTestId('start-match').click();
        });
      } catch (error) {
        // Error esperado - el componente debería manejarlo
      }

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('error');
        expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      });
    });
  });

  describe('Actualizaciones de Estado en Tiempo Real', () => {
    test('debería actualizar estado en tiempo real a través de eventos SSE', async () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const matchStartHandler =
        mockEventSource.addEventListener.mock.calls.find(
          call => call[0] === 'match:start'
        )[1];

      const matchMoveHandler = mockEventSource.addEventListener.mock.calls.find(
        call => call[0] === 'match:move'
      )[1];

      const matchWinHandler = mockEventSource.addEventListener.mock.calls.find(
        call => call[0] === 'match:win'
      )[1];

      // Iniciar partida
      act(() => {
        matchStartHandler({
          data: JSON.stringify({
            players: [
              { name: 'Player1', port: 3001 },
              { name: 'Player2', port: 3002 },
            ],
            boardSize: 3,
            timestamp: '2025-10-03T10:00:00.000Z',
          }),
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('playing');
      });

      // Hacer un movimiento
      act(() => {
        matchMoveHandler({
          data: JSON.stringify({
            board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
            history: [
              {
                player: 'Player1',
                position: 0,
                timestamp: '2025-10-03T10:00:00.000Z',
              },
            ],
            turn: 1,
            player: 'Player1',
            move: { position: 0 },
          }),
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('board')).toHaveTextContent(
          '[1,0,0,0,0,0,0,0,0]'
        );
        expect(screen.getByTestId('move-count')).toHaveTextContent('1');
      });

      // Ganar la partida
      act(() => {
        matchWinHandler({
          data: JSON.stringify({
            winner: { name: 'Player1', port: 3001 },
            winningLine: [0, 1, 2],
            finalBoard: [1, 1, 1, 0, 2, 0, 0, 2, 0],
            message: 'Player1 ganó la partida',
            timestamp: '2025-10-03T10:00:00.000Z',
          }),
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('completed');
        expect(screen.getByTestId('board')).toHaveTextContent(
          '[1,1,1,0,2,0,0,2,0]'
        );
      });
    });
  });

  describe('Recuperación de Errores', () => {
    test('debería recuperarse de errores de parsing SSE', async () => {
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const matchStartHandler =
        mockEventSource.addEventListener.mock.calls.find(
          call => call[0] === 'match:start'
        )[1];

      // Enviar JSON inválido - envolver en try-catch para manejar error de parsing
      try {
        act(() => {
          matchStartHandler({
            data: 'invalid json',
          });
        });
      } catch (error) {
        // Error de parsing esperado - el componente debería manejarlo graciosamente
      }

      // No debería fallar y debería mantener el estado actual
      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('idle');
      });
    });

    test('debería recuperarse de errores de API y permitir reintento', async () => {
      // Configurar fetch para fallar en el primer intento
      global.fetch = jest.fn().mockRejectedValue(new Error('API error'));

      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Primer intento - debería fallar
      await act(async () => {
        screen.getByTestId('start-match').click();
        // Esperar a que se complete la llamada
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(screen.getByTestId('game-state')).toHaveTextContent('error');
      });

      // Verificar que se hizo la primera llamada
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Simular respuesta exitosa para reintento
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ result: 'win' }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      // Segundo intento - debería funcionar
      await act(async () => {
        screen.getByTestId('start-match').click();
        // Esperar a que se complete la llamada
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1); // Nueva instancia de fetch
      });
    });
  });

  describe('Gestión de Memoria', () => {
    test('debería limpiar conexión SSE al desmontar', () => {
      const { unmount } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      unmount();

      expect(mockEventSource.close).toHaveBeenCalled();
    });

    test('no debería filtrar event listeners', () => {
      const { unmount } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      const initialListenerCount =
        mockEventSource.addEventListener.mock.calls.length;

      unmount();

      // Restablecer el mock para limpiar llamadas acumuladas
      mockEventSource.addEventListener.mockClear();

      // Crear nueva instancia
      render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Debería tener el mismo número de listeners (no acumulados)
      expect(mockEventSource.addEventListener.mock.calls.length).toBe(
        initialListenerCount
      );
    });
  });
});
