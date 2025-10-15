/**
 * Script de Benchmark de API
 * Prueba el rendimiento de endpoints de API usando autocannon
 * @lastModified 2025-10-03
 * @version 1.0.0
 *
 * Nota: Las declaraciones de consola son intencionales para salida CLI según @code-standard.md
 */

/* eslint-disable no-console */

import autocannon from 'autocannon';
import { promisify } from 'util';

const run = promisify(autocannon);

const API_URL = process.env.API_URL || 'http://localhost:4000';
const DURATION = parseInt(process.env.DURATION) || 10; // 10 segundos
const CONNECTIONS = parseInt(process.env.CONNECTIONS) || 10;
const PIPELINING = parseInt(process.env.PIPELINING) || 1;

const matchPayload = {
  player1: {
    name: 'TestPlayer1',
    port: 3001,
    host: 'localhost',
    protocol: 'http'
  },
  player2: {
    name: 'TestPlayer2',
    port: 3002,
    host: 'localhost',
    protocol: 'http'
  },
  timeoutMs: 1000
};

console.log('🚀 Iniciando benchmark de API...');
console.log(`📡 URL de API: ${API_URL}`);
console.log(`⏱️  Duración: ${DURATION}s`);
console.log(`🔗 Conexiones: ${CONNECTIONS}`);
console.log(`📦 Pipelining: ${PIPELINING}`);

async function benchmarkEndpoint(endpoint, payload, name) {
  console.log(`\n📊 Ejecutando benchmark de ${name}...`);

  try {
    const result = await run({
      url: `${API_URL}${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      connections: CONNECTIONS,
      pipelining: PIPELINING,
      duration: DURATION
    });

    console.log(`✅ Resultados de ${name}:`);
    console.log(`   Solicitudes: ${result.requests.total}`);
    console.log(`   Latencia (prom): ${result.latency.average}ms`);
    console.log(`   Latency (p95): ${result.latency.p95}ms`);
    console.log(`   Latency (p99): ${result.latency.p99}ms`);
    console.log(`   Rendimiento: ${result.throughput.average} req/seg`);
    console.log(`   Errores: ${result.errors}`);
    console.log(`   Timeouts: ${result.timeouts}`);

    return result;
  } catch (error) {
    console.error(`❌ Error ejecutando benchmark de ${name}:`, error.message);
    return null;
  }
}

async function runBenchmarks() {
  console.log('🏁 Iniciando benchmark completo de API...\n');

  // Test health endpoint
  try {
    const healthResult = await run({
      url: `${API_URL}/api/health`,
      method: 'GET',
      connections: CONNECTIONS,
      pipelining: PIPELINING,
      duration: DURATION
    });

    console.log('✅ Resultados del Endpoint de Salud:');
    console.log(`   Solicitudes: ${healthResult.requests.total}`);
    console.log(`   Latencia (prom): ${healthResult.latency.average}ms`);
    console.log(`   Rendimiento: ${healthResult.throughput.average} req/seg`);
  } catch (error) {
    console.error('❌ Error ejecutando benchmark del endpoint de salud:', error.message);
  }

  // Test match endpoint
  await benchmarkEndpoint('/api/match', matchPayload, 'Endpoint de Partida');

  // Test SSE status endpoint
  try {
    const sseResult = await run({
      url: `${API_URL}/api/stream/status`,
      method: 'GET',
      connections: CONNECTIONS,
      pipelining: PIPELINING,
      duration: DURATION
    });

    console.log('\n✅ Resultados del Endpoint de Estado SSE:');
    console.log(`   Solicitudes: ${sseResult.requests.total}`);
    console.log(`   Latencia (prom): ${sseResult.latency.average}ms`);
    console.log(`   Rendimiento: ${sseResult.throughput.average} req/seg`);
  } catch (error) {
    console.error('❌ Error ejecutando benchmark del endpoint de estado SSE:', error.message);
  }

  console.log('\n🏁 ¡Benchmark completado!');
}

// Run benchmarks
runBenchmarks().catch(console.error);
