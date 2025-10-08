/**
 * SSE Load Test Script
 * Tests SSE connection capacity and message throughput
 * @lastModified 2025-10-05
 * @version 2.0.0
 * @todo Senior software engineer attention - optimized for Node.js 22 LTS
 *
 * Note: Console statements are intentional for CLI output per @code-standard.md
 */

/* eslint-disable no-console */

import EventSource from 'eventsource';

const SSE_URL = process.env.SSE_URL || 'http://localhost:4000/api/stream';
const CONNECTION_COUNT = parseInt(process.env.CONNECTION_COUNT) || 10;
const TEST_DURATION = parseInt(process.env.TEST_DURATION) || 30000; // 30 seconds

const connections = [];
let messageCount = 0;
let errorCount = 0;
const startTime = Date.now();

console.log(`🚀 Starting SSE load test with ${CONNECTION_COUNT} connections`);
console.log(`📡 SSE URL: ${SSE_URL}`);
console.log(`⏱️  Test duration: ${TEST_DURATION}ms`);

// Create connections with proper error handling
for (let i = 0; i < CONNECTION_COUNT; i++) {
  const eventSource = new EventSource(SSE_URL);

  eventSource.onopen = () => {
    console.log(`✅ Connection ${i + 1} opened`);
  };

  eventSource.onmessage = () => {
    messageCount++;
    if (messageCount % 100 === 0) {
      console.log(`📨 Messages received: ${messageCount}`);
    }
  };

  eventSource.onerror = (error) => {
    errorCount++;
    console.error(
      `❌ Connection ${i + 1} error:`,
      error.type || 'Unknown error'
    );
  };

  connections.push(eventSource);
}

// Monitor performance
const monitor = setInterval(() => {
  const elapsed = Date.now() - startTime;
  const messagesPerSecond = (messageCount / (elapsed / 1000)).toFixed(2);

  console.log(`📊 Stats after ${Math.floor(elapsed / 1000)}s:`);
  console.log(`   Messages: ${messageCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Messages/sec: ${messagesPerSecond}`);
  console.log(
    `   Active connections: ${
      connections.filter((conn) => conn.readyState === 1).length
    }`
  );
}, 5000);

// Cleanup after test duration
setTimeout(() => {
  console.log('\n🏁 Test completed, cleaning up...');

  clearInterval(monitor);

  connections.forEach((conn, index) => {
    conn.close();
    console.log(`🔌 Connection ${index + 1} closed`);
  });

  const totalTime = Date.now() - startTime;
  const avgMessagesPerSecond = (messageCount / (totalTime / 1000)).toFixed(2);

  console.log('\n📈 Final Results:');
  console.log(`   Total messages: ${messageCount}`);
  console.log(`   Total errors: ${errorCount}`);
  console.log(`   Test duration: ${Math.floor(totalTime / 1000)}s`);
  console.log(`   Average messages/sec: ${avgMessagesPerSecond}`);
  console.log(
    `   Error rate: ${(
      (errorCount / (messageCount + errorCount)) *
      100
    ).toFixed(2)}%`
  );

  process.exit(0);
}, TEST_DURATION);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  connections.forEach((conn) => conn.close());
  process.exit(0);
});
