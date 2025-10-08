/**
 * API Benchmark Script
 * Tests API endpoint performance using autocannon
 * @lastModified 2025-10-03
 * @version 1.0.0
 *
 * Note: Console statements are intentional for CLI output per @code-standard.md
 */

/* eslint-disable no-console */

import autocannon from 'autocannon';
import { promisify } from 'util';

const run = promisify(autocannon);

const API_URL = process.env.API_URL || 'http://localhost:4000';
const DURATION = parseInt(process.env.DURATION) || 10; // 10 seconds
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

console.log('🚀 Starting API benchmark...');
console.log(`📡 API URL: ${API_URL}`);
console.log(`⏱️  Duration: ${DURATION}s`);
console.log(`🔗 Connections: ${CONNECTIONS}`);
console.log(`📦 Pipelining: ${PIPELINING}`);

async function benchmarkEndpoint(endpoint, payload, name) {
  console.log(`\n📊 Benchmarking ${name}...`);

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

    console.log(`✅ ${name} Results:`);
    console.log(`   Requests: ${result.requests.total}`);
    console.log(`   Latency (avg): ${result.latency.average}ms`);
    console.log(`   Latency (p95): ${result.latency.p95}ms`);
    console.log(`   Latency (p99): ${result.latency.p99}ms`);
    console.log(`   Throughput: ${result.throughput.average} req/sec`);
    console.log(`   Errors: ${result.errors}`);
    console.log(`   Timeouts: ${result.timeouts}`);

    return result;
  } catch (error) {
    console.error(`❌ Error benchmarking ${name}:`, error.message);
    return null;
  }
}

async function runBenchmarks() {
  console.log('🏁 Starting comprehensive API benchmark...\n');

  // Test health endpoint
  try {
    const healthResult = await run({
      url: `${API_URL}/api/health`,
      method: 'GET',
      connections: CONNECTIONS,
      pipelining: PIPELINING,
      duration: DURATION
    });

    console.log('✅ Health Endpoint Results:');
    console.log(`   Requests: ${healthResult.requests.total}`);
    console.log(`   Latency (avg): ${healthResult.latency.average}ms`);
    console.log(`   Throughput: ${healthResult.throughput.average} req/sec`);
  } catch (error) {
    console.error('❌ Error benchmarking health endpoint:', error.message);
  }

  // Test match endpoint
  await benchmarkEndpoint('/api/match', matchPayload, 'Match Endpoint');

  // Test SSE status endpoint
  try {
    const sseResult = await run({
      url: `${API_URL}/api/stream/status`,
      method: 'GET',
      connections: CONNECTIONS,
      pipelining: PIPELINING,
      duration: DURATION
    });

    console.log('\n✅ SSE Status Endpoint Results:');
    console.log(`   Requests: ${sseResult.requests.total}`);
    console.log(`   Latency (avg): ${sseResult.latency.average}ms`);
    console.log(`   Throughput: ${sseResult.throughput.average} req/sec`);
  } catch (error) {
    console.error('❌ Error benchmarking SSE status endpoint:', error.message);
  }

  console.log('\n🏁 Benchmark completed!');
}

// Run benchmarks
runBenchmarks().catch(console.error);
