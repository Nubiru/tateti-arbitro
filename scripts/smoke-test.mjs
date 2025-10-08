#!/usr/bin/env node

/**
 * Docker Smoke Test Script
 * Tests basic functionality of the arbitrator and player bots
 * @lastModified 2025-10-03
 * @version 1.0.0
 *
 * Note: Console statements are intentional for CLI output per @code-standard.md
 */

/* eslint-disable no-console */

// import { spawn } from 'child_process'; // Unused - removed per lint
import http from 'http';

const ARBITRATOR_URL = 'http://localhost:4000';
const PLAYER1_URL = 'http://localhost:3001';
const PLAYER2_URL = 'http://localhost:3002';

/**
 * Make HTTP request and return promise
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

/**
 * Test arbitrator health endpoint
 */
async function testArbitratorHealth() {
  console.log('🔍 Testing arbitrator health...');

  try {
    const response = await makeRequest(`${ARBITRATOR_URL}/api/stream/status`);

    if (response.status === 200) {
      console.log('✅ Arbitrator health check passed');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Connections: ${response.data.connections}`);
      return true;
    } else {
      console.log(`❌ Arbitrator health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Arbitrator health check failed: ${error.message}`);
    return false;
  }
}

/**
 * Test player bot endpoints
 */
async function testPlayerBots() {
  console.log('🔍 Testing player bots...');

  const players = [
    { name: 'Player1', url: PLAYER1_URL },
    { name: 'Player2', url: PLAYER2_URL }
  ];

  let allPassed = true;

  for (const player of players) {
    try {
      const response = await makeRequest(`${player.url}/health`);

      if (response.status === 200) {
        console.log(`✅ ${player.name} health check passed`);
      } else {
        console.log(
          `❌ ${player.name} health check failed: ${response.status}`
        );
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${player.name} health check failed: ${error.message}`);
      allPassed = false;
    }
  }

  return allPassed;
}

/**
 * Test match creation
 */
async function testMatchCreation() {
  console.log('🔍 Testing match creation...');

  try {
    const matchData = {
      player1: { name: 'Player1', port: 3001 },
      player2: { name: 'Player2', port: 3002 }
    };

    const response = await makeRequest(`${ARBITRATOR_URL}/api/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: matchData
    });

    if (response.status === 200) {
      console.log('✅ Match creation test passed');
      console.log(`   Result: ${response.data.result}`);
      console.log(`   Winner: ${response.data.winner?.name || 'N/A'}`);
      return true;
    } else {
      console.log(`❌ Match creation test failed: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Match creation test failed: ${error.message}`);
    return false;
  }
}

/**
 * Wait for services to be ready
 */
async function waitForServices() {
  console.log('⏳ Waiting for services to be ready...');

  const maxAttempts = 30;
  const delay = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await makeRequest(`${ARBITRATOR_URL}/api/stream/status`);
      if (response.status === 200) {
        console.log('✅ Services are ready');
        return true;
      }
    } catch (error) {
      // Service not ready yet
    }

    console.log(`   Attempt ${i + 1}/${maxAttempts} - waiting ${delay}ms...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  console.log('❌ Services did not become ready in time');
  return false;
}

/**
 * Main smoke test function
 */
async function runSmokeTest() {
  console.log('🚀 Starting Docker Smoke Test');
  console.log('================================');

  // Wait for services to be ready
  const servicesReady = await waitForServices();
  if (!servicesReady) {
    process.exit(1);
  }

  // Run tests
  const tests = [
    { name: 'Arbitrator Health', fn: testArbitratorHealth },
    { name: 'Player Bots', fn: testPlayerBots },
    { name: 'Match Creation', fn: testMatchCreation }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n📋 Running ${test.name}...`);
    const result = await test.fn();

    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All smoke tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some smoke tests failed!');
    process.exit(1);
  }
}

// Run the smoke test
runSmokeTest().catch((error) => {
  console.error('💥 Smoke test failed with error:', error);
  process.exit(1);
});
