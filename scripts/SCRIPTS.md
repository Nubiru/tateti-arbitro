# Scripts de Verificación

Scripts para validar el funcionamiento del sistema.

## 🎯 Scripts Principales

### test-smoke-4bots.ps1 (Windows)

**Propósito**: Validación completa del ambiente smoke con 4 bots.

**Características:**
- ✅ Verifica 5 contenedores (árbitro + 4 bots)
- ✅ Prueba 3 estrategias (Random, Smart, Strategic)
- ✅ Valida algoritmos 3x3 y 5x5
- ✅ Ejecuta partidas reales
- ✅ Prueba manejo de errores HTTP 400
- ✅ Reporte detallado

**Uso:**
```powershell
npm run verify:smoke:win

# O directamente
powershell -ExecutionPolicy Bypass -File scripts/test-smoke-4bots.ps1
```

**Pruebas:**
1. Contenedores Docker
2. Health checks
3. Endpoints `/info`
4. Descubrimiento de bots
5. Algoritmos 3x3 (centro, ganar, bloquear, random)
6. Algoritmos 5x5 (centro, random)
7. Partidas completas
8. Validación de errores

**Salida:**
- ✅ Todas las pruebas pasaron (exit 0)
- ⚠️ Pruebas con advertencias (exit 1, <2 fallos)
- ❌ Pruebas fallidas (exit 1, múltiples fallos)

---

### test-smoke-layer.sh (Linux/Mac)

**Propósito**: Equivalente bash para Linux/Mac.

**Uso:**
```bash
npm run verify:smoke

# O directamente
bash scripts/test-smoke-layer.sh
```

---

## 📊 Scripts de Carga

### load/api-benchmark.mjs

**Propósito**: Pruebas de rendimiento con `autocannon`.

**Endpoints:**
- `/api/health`
- `/api/match`
- `/api/stream/status`

**Uso:**
```bash
# Básico
node scripts/load/api-benchmark.mjs

# Con configuración
API_URL=http://localhost:4000 \
DURATION=30 \
CONNECTIONS=20 \
node scripts/load/api-benchmark.mjs
```

**Parámetros:**
- `API_URL`: URL del árbitro (default: http://localhost:4000)
- `DURATION`: Duración en segundos (default: 10)
- `CONNECTIONS`: Conexiones concurrentes (default: 10)
- `PIPELINING`: Requests por conexión (default: 1)

**Métricas:**
- Requests totales
- Latencia (avg/p95/p99)
- Throughput (req/sec)
- Errores y timeouts

---

### load/sse-smoke.mjs

**Propósito**: Pruebas de carga para SSE.

**Características:**
- Múltiples conexiones SSE
- Monitoreo de mensajes
- Throughput por segundo
- Detección de errores

**Uso:**
```bash
# Básico
node scripts/load/sse-smoke.mjs

# Con configuración
SSE_URL=http://localhost:4000/api/stream \
CONNECTION_COUNT=50 \
TEST_DURATION=60000 \
node scripts/load/sse-smoke.mjs
```

**Parámetros:**
- `SSE_URL`: URL del stream (default: http://localhost:4000/api/stream)
- `CONNECTION_COUNT`: Número de conexiones (default: 10)
- `TEST_DURATION`: Duración en ms (default: 30000)

**Métricas:**
- Total de mensajes
- Mensajes por segundo
- Errores totales
- Tasa de error (%)

---

## 🔒 Scripts de Seguridad

### security-scan.ps1 / security-scan.sh

**Propósito**: Escaneo de seguridad del proyecto.

**Uso:**
```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts/security-scan.ps1

# Linux/Mac
bash scripts/security-scan.sh
```

Ejecuta `npm audit` y verifica vulnerabilidades.

---

## 🎮 Flujo Típico

```bash
# 1. Iniciar ambiente
npm run deploy:smoke

# 2. Esperar containers (~40s)
docker ps

# 3. Validar
npm run verify:smoke:win    # Windows
npm run verify:smoke        # Linux/Mac

# 4. Si pasa ✅, sistema listo
```

---

## 🐛 Debugging

```bash
# Ver logs
docker logs tateti-smart-bot-1 -f

# Probar bot
curl "http://localhost:3003/move?board=[0,0,0,0,0,0,0,0,0]"
curl http://localhost:3003/info
```

---

## 📊 Pruebas de Carga

```bash
# 1. Levantar ambiente
npm run docker:smoke

# 2. Benchmark API
node scripts/load/api-benchmark.mjs

# 3. Prueba SSE
node scripts/load/sse-smoke.mjs
```

---

## 📝 Convenciones

### Exit Codes
- `0`: Éxito ✅
- `1`: Fallo ❌

### HTTP Status
- `200`: OK
- `400`: Bad Request
- `500`: Internal Server Error

### Docker Status
- `running`: En ejecución
- `healthy`: Saludable
- `unhealthy`: Con problemas

---

## 🔧 Mantenimiento

Al agregar bots o funcionalidades:

1. Actualizar `test-smoke-4bots.ps1`
2. Actualizar `test-smoke-layer.sh`
3. Documentar cambios
4. Probar localmente

Al crear scripts nuevos:

1. Agregar shebang correcto
2. Incluir header con `@lastModified` y `@version`
3. Agregar nota de console per `@code-standard.md`
4. Documentar en este README
5. Agregar npm script si es frecuente

---

## 📚 Referencias

- **Código**: `code-standard.md`
- **Docker**: `DOCKER.md`
- **Jugadores**: `JUGADORES.md`
- **Pruebas**: `PRUEBAS.md`

---

**Última actualización**: 2025-10-10  
**Versión**: 2.0.0
