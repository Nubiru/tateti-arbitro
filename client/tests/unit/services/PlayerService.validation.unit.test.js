/**
 * Pruebas Unitarias de Validación de PlayerService
 * Pruebas para la lógica de validación de selección de jugadores
 * @lastModified 2025-01-27
 * @version 1.0.0
 */

import { PlayerService } from '../../../src/services/PlayerService';

describe('Validación de PlayerService', () => {
  let playerService;

  beforeEach(() => {
    playerService = new PlayerService();
  });

  describe('validatePlayerSelection', () => {
    describe('Modo Individual (single)', () => {
      it('debería validar exactamente 2 jugadores para modo individual', () => {
        const players = [
          { name: 'Player1', port: 3001, isHuman: false },
          { name: 'Player2', port: 3002, isHuman: false },
        ];

        const result = playerService.validatePlayerSelection(players, 'single');

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('debería rechazar modo individual con conteo incorrecto de jugadores', () => {
        const players = [{ name: 'Player1', port: 3001, isHuman: false }];

        const result = playerService.validatePlayerSelection(players, 'single');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'El modo individual requiere exactamente 2 jugadores'
        );
      });

      it('debería rechazar modo individual con demasiados jugadores', () => {
        const players = [
          { name: 'Player1', port: 3001, isHuman: false },
          { name: 'Player2', port: 3002, isHuman: false },
          { name: 'Player3', port: 3003, isHuman: false },
        ];

        const result = playerService.validatePlayerSelection(players, 'single');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'El modo individual requiere exactamente 2 jugadores'
        );
      });
    });

    describe('Modo Torneo', () => {
      it('debería validar 2 jugadores para modo torneo', () => {
        const players = [
          { name: 'Player1', port: 3001, isHuman: false },
          { name: 'Player2', port: 3002, isHuman: false },
        ];

        const result = playerService.validatePlayerSelection(
          players,
          'tournament'
        );

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('debería validar 4 jugadores para modo torneo', () => {
        const players = [
          { name: 'Player1', port: 3001, isHuman: false },
          { name: 'Player2', port: 3002, isHuman: false },
          { name: 'Player3', port: 3003, isHuman: false },
          { name: 'Player4', port: 3004, isHuman: false },
        ];

        const result = playerService.validatePlayerSelection(
          players,
          'tournament'
        );

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('debería rechazar modo torneo con conteo inválido de jugadores', () => {
        const players = [
          { name: 'Player1', port: 3001, isHuman: false },
          { name: 'Player2', port: 3002, isHuman: false },
          { name: 'Player3', port: 3003, isHuman: false },
        ];

        const result = playerService.validatePlayerSelection(
          players,
          'tournament'
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'El modo torneo requiere 2, 4, 8, 16 jugadores'
        );
      });
    });

    describe('Validación de Jugadores', () => {
      it('debería validar jugadores con campos requeridos', () => {
        const players = [
          { name: 'Player1', port: 3001, isHuman: false },
          { name: 'Player2', url: 'https://bot.example.com', isHuman: false },
        ];

        const result = playerService.validatePlayerSelection(players, 'single');

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('debería rechazar jugadores sin nombre', () => {
        const players = [
          { port: 3001, isHuman: false },
          { name: 'Player2', port: 3002, isHuman: false },
        ];

        const result = playerService.validatePlayerSelection(players, 'single');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'El jugador 1 debe tener un nombre válido'
        );
      });

      it('debería rechazar jugadores sin puerto o url', () => {
        const players = [
          { name: 'Player1', isHuman: false },
          { name: 'Player2', port: 3002, isHuman: false },
        ];

        const result = playerService.validatePlayerSelection(players, 'single');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'El jugador 1 debe tener un puerto o url'
        );
      });
    });
  });
});
