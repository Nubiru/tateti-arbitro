/**
 * Pruebas de Integración: GameContext - Flujo de Jugador Humano
 * Pruebas de envío completo de movimientos de jugador humano con React Context y SSE
 * @lastModified 2025-10-10
 * @version 1.1.0
 * @testType integration
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { GameProvider, useGame } from '../../../src/context/GameContext.jsx';

// Mock fetch
global.fetch = jest.fn();

// Mock EventSource
class MockEventSource {
  constructor(url) {
    this.url = url;
    this.listeners = {};
    this.readyState = 0; // CONNECTING
    MockEventSource.instances.push(this);

    // Simular conexión asíncrona
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) {
        this.onopen();
      }
    }, 0);
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  close() {
    this.readyState = 2; // CLOSED
    this.listeners = {};
  }

  // Ayudante para disparar eventos en las pruebas
  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback({ data: JSON.stringify(data) });
      });
    }
  }

  static instances = [];
  static reset() {
    MockEventSource.instances = [];
  }
}

global.EventSource = MockEventSource;

describe('GameContext - Flujo de Jugador Humano', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockEventSource.reset();
    fetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('submitMove - Jugador Humano', () => {
    test('debería enviar movimiento humano sin actualizar tablero inmediatamente', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      // Configuración: Iniciar una partida primero
      act(() => {
        result.current.dispatch({
          type: 'START_MATCH',
          payload: {
            matchId: 'test-match-123',
            players: [
              { name: 'Human1', isHuman: true },
              { name: 'Bot1', isHuman: false },
            ],
            boardSize: 3,
          },
        });
      });

      // Mock respuesta exitosa de API
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, move: 4 }),
      });

      // Acto: Enviar movimiento humano
      await act(async () => {
        await result.current.submitMove(4);
      });

      // Afirmar: API fue llamada correctamente
      expect(fetch).toHaveBeenCalledWith('/api/match/test-match-123/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player: 'player1',
          position: 4,
        }),
      });

      // Afirmar: El tablero NO fue actualizado inmediatamente
      // (El tablero solo debería actualizarse vía eventos SSE)
      expect(result.current.board).toEqual(Array(9).fill(0));
    });

    test('debería manejar error de API al enviar movimiento', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      act(() => {
        result.current.dispatch({
          type: 'START_MATCH',
          payload: {
            matchId: 'test-match-123',
            players: [{ name: 'Human1', isHuman: true }],
            boardSize: 3,
          },
        });
      });

      // Mock error de API
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid move' }),
      });

      // Acto y Afirmar: Debería lanzar error
      await act(async () => {
        await expect(result.current.submitMove(10)).rejects.toThrow(
          'Invalid move'
        );
      });

      // Afirmar: El estado de error fue establecido
      expect(result.current.gameState).toBe('error');
      expect(result.current.error).toBe('Invalid move');
    });

    test('debería lanzar error si no hay partida activa', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      // Acto y Afirmar: Debería lanzar error sin partida activa
      await act(async () => {
        await expect(result.current.submitMove(4)).rejects.toThrow(
          'No active match found'
        );
      });
    });

    test('debería determinar ID de jugador correcto basado en conteo de movimientos', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      act(() => {
        result.current.dispatch({
          type: 'START_MATCH',
          payload: {
            matchId: 'test-match-123',
            players: [
              { name: 'Human1', isHuman: true },
              { name: 'Human2', isHuman: true },
            ],
            boardSize: 3,
          },
        });
      });

      // Primer movimiento (moveCount = 0, debería ser player1)
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await act(async () => {
        await result.current.submitMove(0);
      });

      expect(fetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            player: 'player1',
            position: 0,
          }),
        })
      );

      // Simular actualización de conteo de movimientos
      act(() => {
        result.current.dispatch({
          type: 'UPDATE_BOARD',
          payload: {
            board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
            history: [],
            moveCount: 1,
          },
        });
      });

      // Segundo movimiento (moveCount = 1, debería ser player2)
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await act(async () => {
        await result.current.submitMove(1);
      });

      expect(fetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            player: 'player2',
            position: 1,
          }),
        })
      );
    });
  });

  describe('Integración de Eventos SSE - Movimientos Humanos', () => {
    test('debería actualizar tablero cuando se recibe evento SSE match:move', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      // Esperar a que EventSource sea creado
      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      // Inicializar estado del juego con configuración para procesador moveQueue
      act(() => {
        result.current.dispatch({
          type: 'SET_CONFIG',
          payload: { speed: 'fast', boardSize: '3x3', noTie: false },
        });
        result.current.dispatch({
          type: 'START_MATCH',
          payload: {
            matchId: 'test-match-sse',
            players: [{ name: 'Human1' }, { name: 'Bot1' }],
            boardSize: 3,
          },
        });
      });

      const eventSource = MockEventSource.instances[0];

      // Disparar evento match:move
      act(() => {
        eventSource.trigger('match:move', {
          player: { name: 'Human1', id: 1 },
          move: 4,
          board: [0, 0, 0, 0, 1, 0, 0, 0, 0],
          turn: 1,
        });
      });

      // Wait for move to be queued
      await waitFor(() => {
        expect(result.current.moveQueue.length).toBeGreaterThan(0);
      });

      // Verificar que el tablero no se actualiza inmediatamente
      expect(result.current.board[4]).toBe(0);
    });
  });
});
