/**
 * Script de Prueba de Carga SSE
 * Prueba la capacidad de conexión SSE y el rendimiento de mensajes
 * @lastModified 2025-10-05
 * @version 2.0.0
 * @todo Atención de ingeniero de software senior - optimizado para Node.js 22 LTS
 *
 * Nota: Las declaraciones de consola son intencionales para salida CLI según @code-standard.md
 */

/* eslint-disable no-console */

import EventSource from 'eventsource';

const SSE_URL = process.env.SSE_URL || 'http://localhost:4000/api/stream';
const CONNECTION_COUNT = parseInt(process.env.CONNECTION_COUNT) || 10;
const TEST_DURATION = parseInt(process.env.TEST_DURATION) || 30000; // 30 segundos

const connections = [];
let messageCount = 0;
let errorCount = 0;
const startTime = Date.now();

console.log(`🚀 Iniciando prueba de carga SSE con ${CONNECTION_COUNT} conexiones`);
console.log(`📡 URL SSE: ${SSE_URL}`);
console.log(`⏱️  Duración de prueba: ${TEST_DURATION}ms`);

// Crear conexiones con manejo adecuado de errores
for (let i = 0; i < CONNECTION_COUNT; i++) {
  const eventSource = new EventSource(SSE_URL);

  eventSource.onopen = () => {
    console.log(`✅ Conexión ${i + 1} abierta`);
  };

  eventSource.onmessage = () => {
    messageCount++;
    if (messageCount % 100 === 0) {
      console.log(`📨 Mensajes recibidos: ${messageCount}`);
    }
  };

  eventSource.onerror = (error) => {
    errorCount++;
    console.error(
      `❌ Error de conexión ${i + 1}:`,
      error.type || 'Error desconocido'
    );
  };

  connections.push(eventSource);
}

// Monitorear rendimiento
const monitor = setInterval(() => {
  const elapsed = Date.now() - startTime;
  const messagesPerSecond = (messageCount / (elapsed / 1000)).toFixed(2);

  console.log(`📊 Estadísticas después de ${Math.floor(elapsed / 1000)}s:`);
  console.log(`   Mensajes: ${messageCount}`);
  console.log(`   Errores: ${errorCount}`);
  console.log(`   Mensajes/seg: ${messagesPerSecond}`);
  console.log(
    `   Conexiones activas: ${
      connections.filter((conn) => conn.readyState === 1).length
    }`
  );
}, 5000);

// Limpiar después de la duración de prueba
setTimeout(() => {
  console.log('\n🏁 Prueba completada, limpiando...');

  clearInterval(monitor);

  connections.forEach((conn, index) => {
    conn.close();
    console.log(`🔌 Conexión ${index + 1} cerrada`);
  });

  const totalTime = Date.now() - startTime;
  const avgMessagesPerSecond = (messageCount / (totalTime / 1000)).toFixed(2);

  console.log('\n📈 Resultados Finales:');
  console.log(`   Total de mensajes: ${messageCount}`);
  console.log(`   Total de errores: ${errorCount}`);
  console.log(`   Duración de prueba: ${Math.floor(totalTime / 1000)}s`);
  console.log(`   Promedio mensajes/seg: ${avgMessagesPerSecond}`);
  console.log(
    `   Tasa de error: ${(
      (errorCount / (messageCount + errorCount)) *
      100
    ).toFixed(2)}%`
  );

  process.exit(0);
}, TEST_DURATION);

// Manejar terminación del proceso
process.on('SIGINT', () => {
  console.log('\n🛑 Prueba interrumpida por el usuario');
  connections.forEach((conn) => conn.close());
  process.exit(0);
});
