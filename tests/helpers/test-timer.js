/**
 * Test Performance Monitor
 * Warns if tests exceed expected durations
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

/**
 * Warn if test exceeds expected duration
 * @param {string} testName - Name of the test
 * @param {number} duration - Duration in milliseconds
 */
export function expectFastTest(testName, duration) {
  if (duration > 100) {
    console.warn(
      `⚠️  SLOW UNIT TEST: ${testName} took ${duration}ms (expected <100ms)`
    );
  }
}

/**
 * Wrap a test function to measure its duration
 * @param {Function} testFn - Test function to wrap
 * @returns {Function} Wrapped test function that returns duration
 */
export function wrapTest(testFn) {
  return async () => {
    const start = performance.now();
    await testFn();
    const duration = performance.now() - start;
    return duration;
  };
}

/**
 * Measure test duration and warn if slow
 * @param {string} testName - Name of the test
 * @param {Function} testFn - Test function to measure
 * @returns {Function} Wrapped test function
 */
export function measureTest(testName, testFn) {
  return async () => {
    const start = performance.now();
    await testFn();
    const duration = performance.now() - start;
    expectFastTest(testName, duration);
  };
}

/**
 * Performance expectations for different test types
 */
export const PERFORMANCE_EXPECTATIONS = {
  unit: 100, // Unit tests should be <100ms
  integration: 1000, // Integration tests should be <1000ms
  e2e: 5000, // E2E tests should be <5000ms
};

/**
 * Check if test duration meets expectations
 * @param {string} testType - Type of test (unit, integration, e2e)
 * @param {string} testName - Name of the test
 * @param {number} duration - Duration in milliseconds
 * @returns {boolean} True if test meets performance expectations
 */
export function meetsPerformanceExpectations(testType, testName, duration) {
  const expectedMax = PERFORMANCE_EXPECTATIONS[testType] || 1000;
  const meetsExpectations = duration <= expectedMax;

  if (!meetsExpectations) {
    console.warn(
      `⚠️  SLOW ${testType.toUpperCase()} TEST: ${testName} took ${duration}ms (expected <${expectedMax}ms)`
    );
  }

  return meetsExpectations;
}
