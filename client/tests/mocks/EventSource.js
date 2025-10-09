/**
 * Mock EventSource for Jest testing
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

class MockEventSource {
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSED = 2;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    this.listeners = {};

    // Simulate connection
    setTimeout(() => {
      this.readyState = this.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
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
    this.readyState = this.CLOSED;
    if (this.onclose) this.onclose();
  }

  // Helper method for tests to simulate events
  simulateEvent(eventType, data) {
    if (this[`on${eventType}`]) {
      this[`on${eventType}`]({ data: JSON.stringify(data) });
    }
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(callback => {
        callback({ data: JSON.stringify(data) });
      });
    }
  }
}

module.exports = MockEventSource;
