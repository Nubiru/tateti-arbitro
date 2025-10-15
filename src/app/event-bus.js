/**
 * Bus de Eventos para Server-Sent Events (SSE)
 * Gestiona conexiones SSE y transmisión de eventos
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

class EventBus {
  constructor() {
    this.connections = new Set();
    this.eventCounts = new Map();
    this.totalEvents = 0;
    this.startTime = Date.now();

    // Periodic cleanup of stale connections
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 30000); // Every 30 seconds
  }

  /**
   * Agregar una nueva conexión SSE
   * @param {Object} res - Objeto de respuesta Express
   */
  addConnection(res) {
    this.connections.add(res);

    // Establecer headers SSE usando Express response methods
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
    res.status(200);

    // Enviar evento de conexión inicial
    this.sendEvent(res, 'connection', {
      message: 'Conexión SSE establecida',
      timestamp: new Date().toISOString(),
    });

    // Función para limpiar la conexión
    const cleanup = () => {
      this.connections.delete(res);
      res.destroy && res.destroy();
    };

    // Manejar desconexión del cliente - múltiples eventos para asegurar limpieza
    res.on('close', cleanup);
    res.on('finish', cleanup);
    res.on('error', cleanup);

    // Timeout de seguridad para conexiones colgadas
    const timeout = setTimeout(() => {
      if (this.connections.has(res)) {
        console.warn('SSE connection timeout, cleaning up');
        cleanup();
      }
    }, 300000); // 5 minutos timeout

    // Store timeout for cleanup
    res._sseTimeout = timeout;

    // Limpiar timeout cuando la conexión se cierre
    res.on('close', () => {
      if (res._sseTimeout) {
        clearTimeout(res._sseTimeout);
        res._sseTimeout = null;
      }
    });
    res.on('finish', () => {
      if (res._sseTimeout) {
        clearTimeout(res._sseTimeout);
        res._sseTimeout = null;
      }
    });
    res.on('error', () => {
      if (res._sseTimeout) {
        clearTimeout(res._sseTimeout);
        res._sseTimeout = null;
      }
    });
  }

  /**
   * Enviar evento a una conexión específica
   * @param {Object} res - Objeto de respuesta Express
   * @param {string} event - Tipo de evento
   * @param {Object} data - Datos del evento
   */
  sendEvent(res, event, data) {
    if (res && !res.destroyed) {
      const eventData = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      res.write(eventData);
    }
  }

  /**
   * Transmitir evento a todos los clientes conectados
   * @param {string} event - Tipo de evento
   * @param {Object} data - Datos del evento
   */
  broadcast(event, data) {
    // Rastrear conteos de eventos
    this.totalEvents++;
    this.eventCounts.set(event, (this.eventCounts.get(event) || 0) + 1);

    console.log(
      `📡 EventBus broadcasting ${event} to ${this.connections.size} connections`
    );
    console.log(`📡 EventBus data:`, data);

    const eventData = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    this.connections.forEach(res => {
      if (!res.destroyed) {
        res.write(eventData);
        console.log(`📡 EventBus sent ${event} to connection`);
      } else {
        // Limpiar conexiones destruidas
        this.connections.delete(res);
        console.log(`📡 EventBus cleaned up destroyed connection`);
      }
    });
  }

  /**
   * Obtener número de conexiones activas
   * @returns {number} Número de conexiones activas
   */
  getConnectionCount() {
    return this.connections.size;
  }

  /**
   * Obtener métricas detalladas
   * @returns {Object} Métricas detalladas
   */
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    const eventCountsObj = {};
    this.eventCounts.forEach((count, event) => {
      eventCountsObj[event] = count;
    });

    return {
      connections: this.connections.size,
      totalEvents: this.totalEvents,
      eventCounts: eventCountsObj,
      uptime: {
        milliseconds: uptime,
        seconds: Math.floor(uptime / 1000),
        formatted: `${Math.floor(uptime / 3600000)}h ${Math.floor(
          (uptime % 3600000) / 60000
        )}m ${Math.floor((uptime % 60000) / 1000)}s`,
      },
      eventsPerSecond: this.totalEvents / (uptime / 1000),
      status: 'active',
    };
  }

  /**
   * Limpiar conexiones colgadas
   */
  cleanupStaleConnections() {
    const staleConnections = [];

    for (const connection of this.connections) {
      if (connection.destroyed || connection.finished) {
        staleConnections.push(connection);
      }
    }

    staleConnections.forEach(conn => this.connections.delete(conn));

    if (staleConnections.length > 0) {
      console.log(
        `Cleaned up ${staleConnections.length} stale SSE connections`
      );
    }
  }

  /**
   * Cerrar todas las conexiones
   */
  closeAll() {
    // Clear the cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.connections.forEach(res => {
      if (!res.destroyed) {
        res.end();
      }
    });
    this.connections.clear();
  }
}

// Crear instancia singleton
const eventBus = new EventBus();

export default eventBus;
