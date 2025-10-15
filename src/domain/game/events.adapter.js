/**
 * Adaptador de Eventos para Transmisión de Eventos
 * Encapsula el uso del bus de eventos para inyección de dependencias
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

/**
 * Adaptador de Eventos para transmisión de eventos
 * @lastModified 2025-10-03
 * @version 1.0.0
 */
export class EventsAdapter {
  constructor({ eventBus, logger }) {
    this.eventBus = eventBus;
    this.logger = logger;
    console.log('🔌 EventsAdapter created with eventBus:', !!eventBus);
    console.log(
      '🔌 EventBus connections:',
      eventBus?.getConnectionCount?.() || 'N/A'
    );
  }

  /**
   * Transmitir evento de inicio de partida
   * @param {Object} payload - Carga útil del evento
   */
  broadcastMatchStart(payload) {
    console.log('📡 Backend broadcasting match:start event:', payload);
    this.logger.debug(
      'EVENTS',
      'BROADCAST',
      'MATCH_START',
      'Transmitiendo evento de inicio de partida',
      payload
    );
    this.eventBus.broadcast('match:start', payload);
  }

  /**
   * Transmitir evento de movimiento de partida
   * @param {Object} payload - Carga útil del evento
   */
  broadcastMatchMove(payload) {
    console.log('📡 Backend broadcasting match:move event:', payload);
    console.log(
      '📡 EventBus connections:',
      this.eventBus.getConnectionCount?.() || 'N/A'
    );
    this.logger.debug(
      'EVENTS',
      'BROADCAST',
      'MATCH_MOVE',
      'Transmitiendo evento de movimiento de partida',
      payload
    );
    this.eventBus.broadcast('match:move', payload);
    console.log('📡 Event broadcast completed');
  }

  /**
   * Transmitir evento de victoria de partida
   * @param {Object} payload - Carga útil del evento
   */
  broadcastMatchWin(payload) {
    console.log('📡 Backend broadcasting match:win event:', payload);
    this.logger.debug(
      'EVENTS',
      'BROADCAST',
      'MATCH_WIN',
      'Transmitiendo evento de victoria de partida',
      payload
    );
    this.eventBus.broadcast('match:win', payload);
  }

  /**
   * Transmitir evento de empate de partida
   * @param {Object} payload - Carga útil del evento
   */
  broadcastMatchDraw(payload) {
    this.logger.debug(
      'EVENTS',
      'BROADCAST',
      'MATCH_DRAW',
      'Transmitiendo evento de empate de partida',
      payload
    );
    this.eventBus.broadcast('match:draw', payload);
  }

  /**
   * Transmitir evento de error de partida
   * @param {Object} payload - Carga útil del evento
   */
  broadcastMatchError(payload) {
    this.logger.debug(
      'EVENTS',
      'BROADCAST',
      'MATCH_ERROR',
      'Transmitiendo evento de error de partida',
      payload
    );
    this.eventBus.broadcast('match:error', payload);
  }

  /**
   * Transmitir evento de eliminación de movimiento (no-tie mode rolling window)
   * @param {Object} payload - Carga útil del evento
   */
  broadcastMoveRemoval(payload) {
    console.log('📡 Backend broadcasting move:removed event:', payload);
    this.logger.debug(
      'EVENTS',
      'BROADCAST',
      'MOVE_REMOVED',
      'Transmitiendo evento de eliminación de movimiento',
      payload
    );
    this.eventBus.broadcast('move:removed', payload);
  }

  /**
   * Transmitir evento de inicio de torneo
   * @param {Object} payload - Carga útil del evento
   */
  broadcastTournamentStart(payload) {
    this.logger.debug(
      'EVENTS',
      'BROADCAST',
      'TOURNAMENT_START',
      'Transmitiendo evento de inicio de torneo',
      payload
    );
    this.eventBus.broadcast('tournament:start', payload);
  }

  /**
   * Transmitir evento de finalización de torneo
   * @param {Object} payload - Carga útil del evento
   */
  broadcastTournamentComplete(payload) {
    this.logger.debug(
      'EVENTS',
      'BROADCAST',
      'TOURNAMENT_COMPLETE',
      'Transmitiendo evento de finalización de torneo',
      payload
    );
    this.eventBus.broadcast('tournament:complete', payload);
  }
}

/**
 * Crear instancia del adaptador de eventos
 * @param {Object} dependencies - Dependencias
 * @returns {EventsAdapter} Instancia del adaptador de eventos
 */
export function createEventsAdapter({ eventBus, logger }) {
  return new EventsAdapter({ eventBus, logger });
}
