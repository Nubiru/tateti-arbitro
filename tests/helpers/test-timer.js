/**
 * Monitor de Rendimiento de Pruebas
 * Advierte si las pruebas exceden las duraciones esperadas
 * @lastModified 2025-10-07
 * @version 1.0.0
 */

/**
 * Advertir si la prueba excede la duración esperada
 * @param {string} testName - Nombre de la prueba
 * @param {number} duration - Duración en milisegundos
 */
export function expectFastTest(testName, duration) {
  if (duration > 100) {
    console.warn(
      `⚠️  SLOW UNIT TEST: ${testName} took ${duration}ms (expected <100ms)`
    );
  }
}

/**
 * Envolver una función de prueba para medir su duración
 * @param {Function} testFn - Función de prueba a envolver
 * @returns {Function} Función de prueba envuelta que retorna la duración
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
 * Medir la duración de la prueba y advertir si es lenta
 * @param {string} testName - Nombre de la prueba
 * @param {Function} testFn - Función de prueba a medir
 * @returns {Function} Función de prueba envuelta
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
 * Expectativas de rendimiento para diferentes tipos de pruebas
 */
export const PERFORMANCE_EXPECTATIONS = {
  unit: 100, // Las pruebas unitarias deberían ser <100ms
  integration: 1000, // Las pruebas de integración deberían ser <1000ms
  e2e: 5000, // Las pruebas E2E deberían ser <5000ms
};

/**
 * Verificar si la duración de la prueba cumple las expectativas
 * @param {string} testType - Tipo de prueba (unit, integration, e2e)
 * @param {string} testName - Nombre de la prueba
 * @param {number} duration - Duración en milisegundos
 * @returns {boolean} True si la prueba cumple las expectativas de rendimiento
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
