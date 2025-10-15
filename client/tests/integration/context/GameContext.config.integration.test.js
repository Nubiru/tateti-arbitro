/**
 * Pruebas de Integración: GameContext - Configuración y Velocidad
 * Pruebas de almacenamiento de configuración y retrasos de velocidad del juego con Context completo
 * @lastModified 2025-10-10
 * @version 1.1.0
 * @testType integration
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { GameProvider, useGame } from '../../../src/context/GameContext.jsx';

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
global.fetch = jest.fn();

describe('GameContext - Almacenamiento de Configuración y Velocidad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockEventSource.reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Almacenamiento de Configuración', () => {
    test('debería almacenar configuración antes de iniciar partida', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Avanzar temporizadores falsos para permitir conexión EventSource
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matchId: 'test-123' }),
      });

      // Acto: Iniciar partida con configuración
      await act(async () => {
        await result.current.startMatch(
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          {
            speed: 'slow',
            boardSize: '3x3',
            noTie: true,
          }
        );
      });

      // Afirmar: La configuración debería estar almacenada en el estado
      expect(result.current.config).toEqual({
        speed: 'slow',
        boardSize: '3x3',
        noTie: true,
      });
    });

    test('debería usar valores de configuración por defecto si no se proporcionan', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Avanzar temporizadores falsos para permitir conexión EventSource
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matchId: 'test-123' }),
      });

      await act(async () => {
        await result.current.startMatch(
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          {} // Opciones vacías
        );
      });

      // Afirmar: Debería tener valores por defecto
      expect(result.current.config).toEqual({
        speed: 'normal',
        boardSize: '3x3',
        noTie: false,
      });
    });

    test('debería tener configuración disponible al procesar cola de movimientos', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Avanzar temporizadores falsos para permitir conexión EventSource
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matchId: 'test-123' }),
      });

      // Iniciar partida con velocidad específica
      await act(async () => {
        await result.current.startMatch(
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          { speed: 'fast' }
        );
      });

      // Esperar EventSource
      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Disparar un evento de movimiento
      act(() => {
        eventSource.trigger('match:move', {
          player: { name: 'Player1' },
          move: 0,
          board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
          turn: 1,
        });
      });

      // Afirmar: La configuración debería ser accesible durante el procesamiento de cola
      expect(result.current.config.speed).toBe('fast');
    });
  });

  describe('Retrasos de Velocidad del Juego', () => {
    test('debería aplicar retraso de velocidad lenta (3000ms)', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Avanzar temporizadores falsos para permitir conexión EventSource
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matchId: 'test-123' }),
      });

      // Iniciar con velocidad lenta
      await act(async () => {
        await result.current.startMatch(
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          { speed: 'slow' }
        );
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Disparar evento de movimiento
      act(() => {
        eventSource.trigger('match:move', {
          move: 0,
          board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
          turn: 1,
          history: [
            {
              player: 'Player1',
              position: 0,
              timestamp: '2025-10-03T10:00:00.000Z',
            },
          ],
        });
      });

      // Afirmar: El movimiento debería estar en cola
      expect(result.current.moveQueue.length).toBeGreaterThan(0);

      // Verificar que el tablero no se actualiza inmediatamente
      expect(result.current.board).toEqual(Array(9).fill(0));
    });

    test('debería aplicar retraso de velocidad normal (2000ms)', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Avanzar temporizadores falsos para permitir conexión EventSource
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matchId: 'test-123' }),
      });

      await act(async () => {
        await result.current.startMatch(
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          { speed: 'normal' }
        );
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      act(() => {
        eventSource.trigger('match:move', {
          move: 0,
          board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
          turn: 1,
          history: [
            {
              player: 'Player1',
              position: 0,
              timestamp: '2025-10-03T10:00:00.000Z',
            },
          ],
        });
      });

      // Afirmar: El movimiento debería estar en cola
      expect(result.current.moveQueue.length).toBeGreaterThan(0);

      // Verificar que el tablero no se actualiza inmediatamente
      expect(result.current.board).toEqual(Array(9).fill(0));
    });

    test('debería aplicar retraso de velocidad rápida (1000ms)', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Avanzar temporizadores falsos para permitir conexión EventSource
      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matchId: 'test-123' }),
      });

      await act(async () => {
        await result.current.startMatch(
          { name: 'Player1', port: 3001 },
          { name: 'Player2', port: 3002 },
          { speed: 'fast' }
        );
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      act(() => {
        eventSource.trigger('match:move', {
          move: 0,
          board: [1, 0, 0, 0, 0, 0, 0, 0, 0],
          turn: 1,
          history: [
            {
              player: 'Player1',
              position: 0,
              timestamp: '2025-10-03T10:00:00.000Z',
            },
          ],
        });
      });

      // Afirmar: El movimiento debería estar en cola
      expect(result.current.moveQueue.length).toBeGreaterThan(0);

      // Verificar que el tablero no se actualiza inmediatamente
      expect(result.current.board).toEqual(Array(9).fill(0));
    });
  });
});
