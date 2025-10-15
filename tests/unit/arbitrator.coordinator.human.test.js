/**
 * Pruebas Unitarias para ArbitratorCoordinator - Métodos de Jugador Humano
 * Pruebas para waitForHumanMove y submitHumanMove methods
 * @lastModified 2025-10-09
 * @version 1.0.0
 */

import { jest } from '@jest/globals';
import { ArbitratorCoordinator } from '../../src/domain/game/arbitrator.coordinator.js';
import { isValidMove } from '../../src/domain/game/arbitrator.core.js';
import {
  createMockArbitratorDependencies,
  createMockPlayers,
} from '../helpers/test-factories.js';

// Mock isValidMove from arbitrator.core
jest.mock('../../src/domain/game/arbitrator.core.js', () => ({
  ...jest.requireActual('../../src/domain/game/arbitrator.core.js'),
  isValidMove: jest.fn(),
}));

describe('ArbitratorCoordinator - Métodos de Jugador Humano', () => {
  let coordinator;
  let mockDependencies;
  let mockPlayers;
  let originalDateNow;
  const FIXED_TIMESTAMP = 1696320000000; // Fixed timestamp for deterministic matchId

  beforeEach(() => {
    // Setup test factories
    mockDependencies = createMockArbitratorDependencies();
    mockPlayers = createMockPlayers(2);

    // Mock Date.now() for deterministic matchId
    originalDateNow = Date.now;
    Date.now = jest.fn(() => FIXED_TIMESTAMP);

    // Use fake timers for timeout simulation
    jest.useFakeTimers();

    // Create coordinator instance
    coordinator = new ArbitratorCoordinator(mockDependencies);
  });

  afterEach(() => {
    // Restore Date.now
    Date.now = originalDateNow;

    // Restore timers
    jest.runOnlyPendingTimers();
    jest.useRealTimers();

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('waitForHumanMove', () => {
    test('debería crear entrada de movimiento pendiente con datos correctos', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;

      // Set matchId as runMatch() would do
      coordinator.currentMatchId = `match-${FIXED_TIMESTAMP}-abc123`;

      // Start waiting for move (don't await, we just want to check the Map)
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Verify pending move was created
      expect(coordinator.pendingHumanMoves).toBeDefined();
      expect(coordinator.pendingHumanMoves.size).toBe(1);

      // Get the first (and only) pending move entry
      const [matchId, pending] = Array.from(
        coordinator.pendingHumanMoves.entries()
      )[0];

      expect(matchId).toBe(coordinator.currentMatchId);
      expect(pending).toBeDefined();
      expect(pending.player).toBe(player);
      expect(pending.board).toBe(board);
      expect(pending.resolve).toBeInstanceOf(Function);
      expect(pending.timeout).toBeDefined();
    });

    test('debería resolver con error cuando el timeout expira', async () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;

      // Set matchId as runMatch() would do
      const testMatchId = `match-${FIXED_TIMESTAMP}-abc123`;
      coordinator.currentMatchId = testMatchId;

      // Start waiting for move
      const promise = coordinator.waitForHumanMove(player, board, timeoutMs);

      // Fast-forward time past timeout
      jest.advanceTimersByTime(timeoutMs + 1000);

      // Wait for Promise to resolve
      const result = await promise;

      // Verify timeout error
      expect(result.move).toBeNull();
      expect(result.error).toBe('Timeout waiting for human move');

      // Verify pending move was deleted
      expect(coordinator.pendingHumanMoves.has(testMatchId)).toBe(false);
    });

    test('debería inicializar Map pendingHumanMoves si no existe', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;

      // Ensure pendingHumanMoves doesn't exist
      expect(coordinator.pendingHumanMoves).toBeUndefined();

      // Set matchId as runMatch() would do
      coordinator.currentMatchId = `match-${FIXED_TIMESTAMP}-abc123`;

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Verify Map was initialized
      expect(coordinator.pendingHumanMoves).toBeInstanceOf(Map);
    });

    test('debería usar currentMatchId de runMatch', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;

      // Set matchId as runMatch() would do
      const testMatchId = `match-${FIXED_TIMESTAMP}-abc123`;
      coordinator.currentMatchId = testMatchId;

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Verify currentMatchId is still the same (not overwritten)
      expect(coordinator.currentMatchId).toBe(testMatchId);

      // Verify it matches the matchId in pendingHumanMoves
      const [matchId] = Array.from(coordinator.pendingHumanMoves.keys());
      expect(coordinator.currentMatchId).toBe(matchId);
    });

    test('debería llamar logger.debug con parámetros correctos', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;

      // Set matchId as runMatch() would do
      const testMatchId = `match-${FIXED_TIMESTAMP}-abc123`;
      coordinator.currentMatchId = testMatchId;

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Verify logger was called with correct structure
      expect(mockDependencies.logger.debug).toHaveBeenCalledWith(
        'ARBITRATOR',
        'MATCH',
        'WAIT_HUMAN',
        'Esperando movimiento humano',
        expect.objectContaining({
          player: player.name,
          matchId: testMatchId,
          timeoutMs: timeoutMs,
        })
      );
    });
  });

  describe('submitHumanMove', () => {
    test('debería lanzar error si pendingHumanMoves es undefined', () => {
      const matchId = 'match-123';
      const player = 'Player1';
      const position = 4;

      // Ensure pendingHumanMoves doesn't exist
      coordinator.pendingHumanMoves = undefined;

      // Attempt to submit move
      expect(() => {
        coordinator.submitHumanMove(matchId, player, position);
      }).toThrow('No pending move for this match');
    });

    test('debería lanzar error si matchId no se encuentra', () => {
      const matchId = 'match-nonexistent';
      const player = 'Player1';
      const position = 4;

      // Initialize Map but don't add the matchId
      coordinator.pendingHumanMoves = new Map();

      // Attempt to submit move
      expect(() => {
        coordinator.submitHumanMove(matchId, player, position);
      }).toThrow('No pending move for this match');
    });

    test('debería lanzar error si el movimiento es inválido', () => {
      const player = mockPlayers[0];
      const board = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const invalidPosition = 0; // Position already occupied

      // Mock isValidMove to return false
      isValidMove.mockReturnValue(false);

      // Set matchId as runMatch() would do
      const testMatchId = `match-${FIXED_TIMESTAMP}-abc123`;
      coordinator.currentMatchId = testMatchId;

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Attempt to submit invalid move
      expect(() => {
        coordinator.submitHumanMove(testMatchId, player.name, invalidPosition);
      }).toThrow('Invalid move position');
    });

    test('debería resolver Promise con movimiento válido', async () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const validPosition = 4;

      // Mock isValidMove to return true
      isValidMove.mockReturnValue(true);

      // Set matchId as runMatch() would do
      const testMatchId = `match-${FIXED_TIMESTAMP}-abc123`;
      coordinator.currentMatchId = testMatchId;

      // Start waiting for move
      const promise = coordinator.waitForHumanMove(player, board, timeoutMs);

      // Submit move
      coordinator.submitHumanMove(testMatchId, player.name, validPosition);

      // Wait for Promise to resolve
      const result = await promise;

      // Verify result
      expect(result.move).toBe(validPosition);
      expect(result.error).toBeNull();
    });

    test('debería limpiar timeout cuando se envía movimiento', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const validPosition = 4;

      // Mock isValidMove to return true
      isValidMove.mockReturnValue(true);

      // Set matchId as runMatch() would do
      const testMatchId = `match-${FIXED_TIMESTAMP}-abc123`;
      coordinator.currentMatchId = testMatchId;

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Get pending move
      const pending = coordinator.pendingHumanMoves.get(testMatchId);

      // Spy on clearTimeout
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Submit move
      coordinator.submitHumanMove(testMatchId, player.name, validPosition);

      // Verify clearTimeout was called with the timeout ID
      expect(clearTimeoutSpy).toHaveBeenCalledWith(pending.timeout);

      clearTimeoutSpy.mockRestore();
    });

    test('debería eliminar entrada de movimiento pendiente', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const validPosition = 4;

      // Mock isValidMove to return true
      isValidMove.mockReturnValue(true);

      // Set matchId as runMatch() would do
      const testMatchId = `match-${FIXED_TIMESTAMP}-abc123`;
      coordinator.currentMatchId = testMatchId;

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Verify entry exists
      expect(coordinator.pendingHumanMoves.has(testMatchId)).toBe(true);

      // Submit move
      coordinator.submitHumanMove(testMatchId, player.name, validPosition);

      // Verify entry was deleted
      expect(coordinator.pendingHumanMoves.has(testMatchId)).toBe(false);
    });

    test('debería retornar objeto de éxito con movimiento', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const validPosition = 4;

      // Mock isValidMove to return true
      isValidMove.mockReturnValue(true);

      // Set matchId as runMatch() would do
      const testMatchId = `match-${FIXED_TIMESTAMP}-abc123`;
      coordinator.currentMatchId = testMatchId;

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Submit move
      const result = coordinator.submitHumanMove(
        testMatchId,
        player.name,
        validPosition
      );

      // Verify return value
      expect(result).toEqual({
        success: true,
        move: validPosition,
      });
    });

    test('debería llamar logger.info con parámetros correctos', () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const validPosition = 4;

      // Mock isValidMove to return true
      isValidMove.mockReturnValue(true);

      // Set matchId as runMatch() would do
      const testMatchId = `match-${FIXED_TIMESTAMP}-abc123`;
      coordinator.currentMatchId = testMatchId;

      // Start waiting for move
      coordinator.waitForHumanMove(player, board, timeoutMs);

      // Submit move
      coordinator.submitHumanMove(testMatchId, player.name, validPosition);

      // Verify logger was called
      expect(mockDependencies.logger.info).toHaveBeenCalledWith(
        'ARBITRATOR',
        'MATCH',
        'HUMAN_MOVE',
        'Movimiento humano recibido',
        expect.objectContaining({
          player: player.name,
          position: validPosition,
          matchId: testMatchId,
        })
      );
    });
  });

  describe('Integration: waitForHumanMove + submitHumanMove', () => {
    test('debería resolver Promise cuando se envía movimiento antes del timeout', async () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;
      const validPosition = 4;

      // Mock isValidMove to return true
      isValidMove.mockReturnValue(true);

      // Set matchId as runMatch() would do
      const testMatchId = `match-${FIXED_TIMESTAMP}-abc123`;
      coordinator.currentMatchId = testMatchId;

      // Start waiting for move
      const promise = coordinator.waitForHumanMove(player, board, timeoutMs);

      // Simulate user submitting move after 1 second
      jest.advanceTimersByTime(1000);
      coordinator.submitHumanMove(testMatchId, player.name, validPosition);

      // Wait for Promise to resolve
      const result = await promise;

      // Verify success result
      expect(result.move).toBe(validPosition);
      expect(result.error).toBeNull();

      // Verify pending move was cleaned up
      expect(coordinator.pendingHumanMoves.has(testMatchId)).toBe(false);
    });

    test('debería manejar timeout si no se envía movimiento', async () => {
      const player = mockPlayers[0];
      const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const timeoutMs = 30000;

      // Set matchId as runMatch() would do
      const testMatchId = `match-${FIXED_TIMESTAMP}-abc123`;
      coordinator.currentMatchId = testMatchId;

      // Start waiting for move
      const promise = coordinator.waitForHumanMove(player, board, timeoutMs);

      // Verify pending move exists
      expect(coordinator.pendingHumanMoves.has(testMatchId)).toBe(true);

      // Fast-forward time past timeout (no move submitted)
      jest.advanceTimersByTime(timeoutMs + 1000);

      // Wait for Promise to resolve
      const result = await promise;

      // Verify timeout error
      expect(result.move).toBeNull();
      expect(result.error).toBe('Timeout waiting for human move');

      // Verify pending move was cleaned up
      expect(coordinator.pendingHumanMoves.has(testMatchId)).toBe(false);
    });
  });
});
