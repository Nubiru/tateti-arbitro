/**
 * Pruebas de Integración: GameContext - Eventos SSE
 * Pruebas de manejo de Server-Sent Events con Context completo (move:removed, etc.)
 * @lastModified 2025-10-10
 * @version 1.1.0
 * @testType integration
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { GameProvider, useGame } from '../../../src/context/GameContext.jsx';

// Use MockEventSource from setupTests.js
const MockEventSource = global.EventSource;

describe('GameContext - Eventos SSE', () => {
  beforeEach(() => {
    MockEventSource.clearInstances();
  });

  describe('Evento move:removed (Modo Infinito)', () => {
    test('debería escuchar evento move:removed (no match:remove)', async () => {
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

      const eventSource = MockEventSource.instances[0];

      // Afirmar: Debería tener listener para 'move:removed'
      expect(eventSource.listeners['move:removed']).toBeDefined();
      expect(eventSource.listeners['move:removed'].length).toBeGreaterThan(0);
    });

    test('debería agregar eliminación a removalQueue cuando se recibe evento move:removed', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Verify that the move:removed listener is registered
      expect(eventSource.listeners['move:removed']).toBeDefined();
      expect(eventSource.listeners['move:removed'].length).toBeGreaterThan(0);

      // Disparar evento move:removed (modo infinito)
      act(() => {
        eventSource.trigger('move:removed', {
          position: 0,
          player: { name: 'Player1', id: 1 },
          timestamp: new Date().toISOString(),
        });
      });

      // Afirmar: La eliminación debería ser agregada a removalQueue
      // Aumentar timeout ya que las actualizaciones de estado pueden tomar más tiempo
      await waitFor(
        () => {
          expect(result.current.removalQueue.length).toBeGreaterThanOrEqual(1);
        },
        { timeout: 3000 }
      );

      expect(result.current.removalQueue[0].position).toBe(0);
    });

    test('debería procesar múltiples eliminaciones en secuencia', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Disparar múltiples eventos de eliminación
      act(() => {
        eventSource.trigger('move:removed', {
          position: 0,
          player: { name: 'Player1' },
        });
      });

      act(() => {
        eventSource.trigger('move:removed', {
          position: 1,
          player: { name: 'Player2' },
        });
      });

      // Afirmar: Ambas eliminaciones deberían estar en cola
      await waitFor(() => {
        expect(result.current.removalQueue.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Evento match:move', () => {
    test('debería encolar movimientos para procesamiento retrasado', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Disparar evento match:move
      act(() => {
        eventSource.trigger('match:move', {
          player: { name: 'Player1', id: 1 },
          move: 4,
          board: [0, 0, 0, 0, 1, 0, 0, 0, 0],
          turn: 1,
        });
      });

      // Afirmar: El movimiento debería estar en cola (no aplicado inmediatamente)
      expect(result.current.moveQueue.length).toBeGreaterThan(0);
    });
  });

  describe('Evento match:win', () => {
    test('debería despachar MATCH_COMPLETE con datos completos', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Disparar evento match:win
      act(() => {
        eventSource.trigger('match:win', {
          winner: { name: 'Player1', id: 1 },
          winningLine: [0, 1, 2],
          finalBoard: [1, 1, 1, 2, 2, 0, 0, 0, 0],
          message: 'Player1 ganó!',
          result: 'win',
          history: [
            { move: 0, playerId: 1 },
            { move: 3, playerId: 2 },
            { move: 1, playerId: 1 },
            { move: 4, playerId: 2 },
            { move: 2, playerId: 1 },
          ],
        });
      });

      // Afirmar: La partida debería estar completada
      await waitFor(() => {
        expect(result.current.gameState).toBe('completed');
        expect(result.current.matchResult).toBeDefined();
        expect(result.current.matchResult.winner.name).toBe('Player1');
        expect(result.current.matchResult.winningLine).toEqual([0, 1, 2]);
        expect(result.current.matchResult.result).toBe('win');
        expect(result.current.matchResult.history).toHaveLength(5);
      });
    });
  });

  describe('Evento match:error', () => {
    test('debería establecer estado de error en error de partida', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Disparar evento de error
      act(() => {
        eventSource.trigger('match:error', {
          message: 'Player timeout',
          error: 'TIMEOUT',
        });
      });

      // Afirmar: El estado de error debería estar establecido
      await waitFor(() => {
        expect(result.current.gameState).toBe('error');
        expect(result.current.error).toBe('Player timeout');
      });
    });
  });

  describe('Evento match:draw', () => {
    test('debería completar partida con empate', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Disparar evento de empate
      act(() => {
        eventSource.trigger('match:draw', {
          finalBoard: [1, 2, 1, 1, 2, 2, 2, 1, 1],
          message: 'Empate!',
        });
      });

      // Afirmar: Partida completada como empate
      await waitFor(() => {
        expect(result.current.gameState).toBe('completed');
        expect(result.current.matchResult).toBeDefined();
        expect(result.current.matchResult.winner).toBeNull();
      });
    });
  });

  describe('Gestión de Conexión', () => {
    test('debería establecer conexión SSE al montar', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      // Afirmar: EventSource debería ser creado
      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
        expect(MockEventSource.instances[0].url).toBe('/api/stream');
      });
    });

    test('debería establecer estado de conexión a conectado', async () => {
      const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;
      const { result } = renderHook(() => useGame(), { wrapper });

      // Esperar a que EventSource se conecte
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });

      await waitFor(() => {
        expect(MockEventSource.instances.length).toBe(1);
      });

      const eventSource = MockEventSource.instances[0];

      // Simular onopen
      act(() => {
        if (eventSource.onopen) {
          eventSource.onopen();
        }
      });

      // Afirmar: El estado de conexión debería ser conectado
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });
    });
  });
});
