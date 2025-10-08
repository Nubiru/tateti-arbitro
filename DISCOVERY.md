# Sistema de Descubrimiento Dinámico de Bots

Sistema de descubrimiento dinámico de bots que permite detectar automáticamente hasta 16 jugadores (10 algoritmos + 6 aleatorios) sin necesidad de modificar código. Incluye servicios refactorizados GameOptionsService y PlayerService para una arquitectura más robusta y mantenible.

## 🎯 Características

- **Descubrimiento Automático**: Detecta bots disponibles sin configuración manual
- **Escalabilidad**: Soporte para 2-16 jugadores dinámicamente
- **Docker Native**: Integración completa con Docker API
- **Health Checks**: Verificación de estado de bots en tiempo real
- **Caching**: Sistema de caché para optimizar rendimiento
- **Fallback**: Funciona en localhost cuando Docker no está disponible
- **Comunicación HTTP**: Arbitro envía `board`, bot retorna `move`
- **🏗️ Servicios Refactorizados**: GameOptionsService y PlayerService para arquitectura modular
- **✅ 100% Tests Passing**: Cobertura completa de pruebas unitarias

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Bot Registry  │    │  Bot Discovery  │    │ Docker Discovery│
│   (Config JSON) │◄──►│    Service      │◄──►│    Service      │
│  16 Bot Slots   │    │ Health Checks   │    │ Container API   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ /api/bots/available│
                    │  (Dynamic Endpoint)│
                    └─────────────────┘
```

## 📁 Estructura de Archivos

```
src/
├── config/
│   └── bot-registry.json          # Configuración de bots (16 slots)
├── services/
│   ├── bot-discovery.service.js   # Lógica principal de descubrimiento
│   └── docker-discovery.service.js # Integración con Docker API
├── utils/
│   └── environment.util.js        # Detección de entorno
└── app/
    └── app.factory.js             # Endpoint /api/bots/available

client/src/services/
├── GameOptionsService.js          # 🆕 Servicio de configuración de juego
├── PlayerService.js               # 🆕 Servicio de gestión de jugadores
└── __tests__/
    ├── GameOptionsService.unit.test.js
    └── PlayerService.unit.test.js

scripts/
└── generate-bot-registry.js       # Generador de configuración

players/
├── algoritmo-bot/app/server.js    # Endpoint /info agregado
└── random-bot/index.js            # Endpoint /info agregado
```

## 🔧 Configuración

### Bot Registry (`src/config/bot-registry.json`)

```json
{
  "portRange": { "start": 3001, "max": 3016 },
  "bots": [
    { "port": 3001, "type": "random", "servicePattern": "random-bot-1", "name": "RandomBot1" },
    { "port": 3002, "type": "random", "servicePattern": "random-bot-2", "name": "RandomBot2" },
    // ... hasta 16 bots
    { "port": 3016, "type": "algorithm", "servicePattern": "algo-bot-10", "name": "AlgoBot10" }
  ]
}
```

### Variables de Entorno

```bash
# Docker Discovery
DOCKER_DISCOVERY=true          # Habilitar descubrimiento Docker
DOCKER_ENV=true               # Indicar que está en Docker
DOCKER_HOST=unix:///var/run/docker.sock  # Socket Docker

# Discovery Configuration
DISCOVERY_CACHE_TTL=30000     # TTL del caché (30s)
DISCOVERY_TIMEOUT=2000        # Timeout health check (2s)
```

## 🚀 Uso

### 🔍 Validación Pre-commit (OBLIGATORIO)

```bash
# Antes de cada commit - valida que pasarán los hooks
npm run qa:precommit

# Si ✅ pasa, entonces:
git add .
git commit -m "tu mensaje"
```

### Descubrimiento Automático

El sistema detecta automáticamente los bots disponibles:

```bash
# El endpoint devuelve bots dinámicamente
curl http://localhost:4000/api/bots/available

# Respuesta:
{
  "bots": [
    {
      "name": "RandomBot1",
      "port": 3001,
      "type": "random",
      "status": "healthy",
      "capabilities": ["3x3", "5x5"],
      "lastSeen": "2025-10-07T10:00:00.000Z"
    }
  ],
  "total": 4,
  "healthy": 4,
  "timestamp": "2025-10-07T10:00:00.000Z"
}
```

### Generación de Configuración

```bash
# Generar registry desde Docker Compose
node scripts/generate-bot-registry.js --compose docker-compose.4player.yml

# Generar para 8 jugadores
node scripts/generate-bot-registry.js --compose docker-compose.8player.yml
```

## 🔍 Flujo de Descubrimiento

1. **Carga de Registry**: Lee `bot-registry.json`
2. **Docker Query**: Consulta contenedores Docker (si disponible)
3. **Health Checks**: Verifica estado de cada bot (paralelo, 2s timeout)
4. **Metadata Fetch**: Obtiene información de `/info` endpoint
5. **Cache Update**: Actualiza caché con resultados
6. **Response**: Devuelve bots disponibles

## 🐳 Integración Docker

### Docker Compose Configuration

```yaml
arbitrator:
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
  environment:
    - DOCKER_DISCOVERY=true
    - DOCKER_ENV=true
```

### Bot Endpoints

Cada bot debe exponer:

```javascript
// GET /health - Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// GET /info - Bot metadata
app.get('/info', (req, res) => {
  res.json({
    name: 'BotName',
    type: 'algorithm|random',
    version: '1.0.0',
    capabilities: ['3x3', '5x5'],
    description: 'Bot description'
  });
});
```

## 🧪 Testing

### Unit Tests

```bash
# Tests de discovery services
npm test -- --testPathPattern="discovery.service"

# Tests de environment utilities
npm test -- --testPathPattern="environment.util"

# 🆕 Tests de servicios refactorizados
npm test -- --testPathPattern="GameOptionsService"
npm test -- --testPathPattern="PlayerService"
```

### Integration Tests

```bash
# Tests con Docker real
npm run test:integration -- --testPathPattern="discovery"

# 🆕 Tests de integración de servicios
npm run test:integration -- --testPathPattern="services"
```

### 🏗️ Arquitectura de Testing

**GameOptionsService Tests**:
- ✅ Configuración de velocidad y validación
- ✅ Normalización de configuraciones
- ✅ Sistema de throttling
- ✅ Gestión de estado de juego
- ✅ Procesamiento de datos de jugadores

**PlayerService Tests**:
- ✅ Descubrimiento de bots
- ✅ Generación de jugadores
- ✅ Validación de configuración
- ✅ Sistema de fallbacks

## 📊 Monitoreo

### Discovery Statistics

```javascript
const stats = discoveryService.getDiscoveryStats();
console.log(stats);
// {
//   total: 4,
//   healthy: 3,
//   offline: 1,
//   error: 0,
//   lastDiscovery: "2025-10-07T10:00:00.000Z",
//   cacheValid: true
// }
```

### Logs

```bash
# Discovery logs
[10:00:00][INFO][BOTS][DISCOVERY][START]: Starting bot discovery process
[10:00:01][DEBUG][BOTS][DISCOVERY][FOUND]: Found bot containers | count=4
[10:00:02][INFO][BOTS][DISCOVERY][COMPLETE]: Bot discovery completed | total=4 healthy=3
```

## 🔧 Troubleshooting

### Bot No Detectado

1. **Verificar Health Check**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Verificar Metadata**:
   ```bash
   curl http://localhost:3001/info
   ```

3. **Verificar Docker**:
   ```bash
   docker ps | grep bot
   ```

### Discovery Lento

1. **Reducir Timeout**:
   ```bash
   DISCOVERY_TIMEOUT=1000  # 1 segundo
   ```

2. **Ajustar Cache TTL**:
   ```bash
   DISCOVERY_CACHE_TTL=60000  # 1 minuto
   ```

### Docker API Errors

1. **Verificar Socket**:
   ```bash
   ls -la /var/run/docker.sock
   ```

2. **Verificar Permisos**:
   ```bash
   docker ps  # Debe funcionar
   ```

## 🚀 Escalabilidad

### Agregar Nuevos Bots

1. **Actualizar Registry**:
   ```json
   { "port": 3017, "type": "algorithm", "servicePattern": "algo-bot-11", "name": "AlgoBot11" }
   ```

2. **Agregar a Docker Compose**:
   ```yaml
   algo-bot-11:
     build: ./players/algoritmo-bot
     ports: ["3017:3017"]
   ```

3. **Regenerar Registry**:
   ```bash
   node scripts/generate-bot-registry.js --compose docker-compose.16player.yml
   ```

### Configuraciones Predefinidas

- **2 Jugadores**: `docker-compose.2player.yml`
- **4 Jugadores**: `docker-compose.4player.yml`
- **8 Jugadores**: `docker-compose.8player.yml`
- **16 Jugadores**: `docker-compose.16player.yml`

## 📈 Rendimiento

- **Health Checks**: Paralelos, 2s timeout por bot
- **Cache TTL**: 30 segundos (configurable)
- **Docker API**: Consulta única por descubrimiento
- **Memory**: ~1MB por 16 bots en caché

## 🔒 Seguridad

- **Docker Socket**: Solo lectura (`ro`)
- **Health Checks**: Solo GET requests
- **Metadata**: Información pública únicamente
- **Network**: Aislamiento por Docker networks

---

> 📚 **Documentación Relacionada**: 
> - [ARRANQUE.md](./ARRANQUE.md) - Comandos de inicio
> - [DOCKER.md](./DOCKER.md) - Configuración Docker
> - [PRUEBAS.md](./PRUEBAS.md) - Testing completo
