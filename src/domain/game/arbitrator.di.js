/**
 * ArbitratorCoordinator Dependency Injection Factory
 * Creates ArbitratorCoordinator with proper dependency injection
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

import { ArbitratorCoordinator } from './arbitrator.coordinator.js';
import { EventsAdapter } from './events.adapter.js';
import { HttpAdapter } from './http.adapter.js';
import logger from '../../app/logger.js';

/**
 * Create ArbitratorCoordinator with dependency injection
 * @param {Object} options - Configuration options
 * @param {Object} options.eventBus - Event bus instance for SSE
 * @param {Object} options.clock - Clock implementation (default: Date)
 * @param {Function} options.delay - Delay function (default: setTimeout-based)
 * @returns {ArbitratorCoordinator} Configured ArbitratorCoordinator instance
 */
export function createArbitratorCoordinator(options = {}) {
  const { eventBus, clock = Date, delay } = options;

  if (!eventBus) {
    throw new Error('eventBus is required for ArbitratorCoordinator');
  }

  // Create adapters
  const eventsAdapter = new EventsAdapter(eventBus);
  const httpAdapter = new HttpAdapter();

  // Create delay function if not provided
  const delayFunction =
    delay || (ms => new Promise(resolve => setTimeout(resolve, ms)));

  // Create and return coordinator
  return new ArbitratorCoordinator({
    httpAdapter,
    eventsAdapter,
    logger,
    clock,
    delay: delayFunction,
  });
}

/**
 * Speed to delay mapping utility
 * @param {string} speed - Speed setting ('slow', 'normal', 'fast')
 * @returns {number} Delay in milliseconds
 */
export function getSpeedDelay(speed) {
  const speedMap = {
    slow: 2000,
    normal: 1000,
    fast: 200,
  };
  return speedMap[speed] || speedMap.normal;
}

/**
 * Create delay function for testing
 * @param {Function} mockDelay - Mock delay function
 * @returns {Function} Delay function
 */
export function createTestDelay(mockDelay) {
  return mockDelay || (ms => new Promise(resolve => setTimeout(resolve, ms)));
}
