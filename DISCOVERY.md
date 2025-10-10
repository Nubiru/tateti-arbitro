# Sistema de Descubrimiento Dinámico

Sistema que detecta automáticamente bots disponibles sin configuración manual.

## 🎯 Características

- **Descubrimiento Automático**: Detecta bots sin configuración
- **Escalabilidad**: Soporte para 2-16 jugadores
- **Docker Native**: Integración con Docker API
- **Health Checks**: Verificación en tiempo real
- **Caching**: 30 segundos TTL para optimización
- **Fallback**: Funciona en localhost sin Docker

## 🏗️ Arquitectura

```
Bot Registry ◄──► Bot Discovery ◄──► Docker API
                       │
                       ▼
              /api/bots/available
```

**Servicios:**
- **GameOptionsService**: Configuración de juego
- **PlayerService**: Gestión de jugadores

## 🔧 Configuración

### Variables de Entorno

```bash
DOCKER_DISCOVERY=true         # Habilitar descubrimiento
DOCKER_ENV=true               # Indicar ambiente Docker
DOCKER_HOST=unix:///var/run/docker.sock
DISCOVERY_CACHE_TTL=30000     # 30 segundos
DISCOVERY_TIMEOUT=2000        # 2 segundos
```

### Bot Registry

```json
{
  "portRange": { "start": 3001, "max": 3016 },
  "bots": [
    { "port": 3001, "type": "random", "name": "RandomBot1" },
    { "port": 3002, "type": "smart", "name": "SmartBot1" }
  ]
}
```

## 🚀 Uso

### Endpoint de Descubrimiento

```bash
curl http://localhost:4000/api/bots/available

# Respuesta:
{
  "bots": [
    {
      "name": "SmartBot1",
      "port": 3003,
      "type": "smart",
      "status": "healthy",
      "capabilities": ["3x3", "5x5"]
    }
  ],
  "total": 4,
  "healthy": 4
}
```

### Validación Pre-commit

```bash
npm run qa:precommit
```

## 🔍 Flujo de Descubrimiento

1. **Carga Registry**: Lee `bot-registry.json`
2. **Docker Query**: Consulta contenedores
3. **Health Checks**: Verifica estado (paralelo, 2s timeout)
4. **Metadata**: Obtiene info de `/info`
5. **Cache**: Actualiza caché
6. **Response**: Devuelve bots disponibles

## 🐳 Docker

### Configuración

```yaml
arbitrator:
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
  environment:
    - DOCKER_DISCOVERY=true
```

### Endpoints de Bot

```javascript
// GET /health
{ "status": "healthy", "timestamp": "..." }

// GET /info
{
  "name": "SmartBot1",
  "type": "smart",
  "version": "1.0.0",
  "capabilities": ["3x3", "5x5"]
}
```

## 🧪 Testing

```bash
# Tests de servicios
npm test -- --testPathPattern="discovery"
npm test -- --testPathPattern="GameOptionsService"
npm test -- --testPathPattern="PlayerService"

# Tests de integración
npm run test:integration -- --testPathPattern="discovery"
```

## 📊 Monitoreo

```javascript
// Estadísticas de descubrimiento
const stats = discoveryService.getDiscoveryStats();
// {
//   total: 4,
//   healthy: 3,
//   lastDiscovery: "2025-10-10T10:00:00.000Z"
// }
```

## 🔧 Verificación

```bash
# Health check de bot
curl http://localhost:3001/health

# Metadata de bot
curl http://localhost:3001/info

# Docker
docker ps | grep bot
```

## 🚀 Escalabilidad

### Agregar Nuevos Bots

1. Actualizar `bot-registry.json`
2. Agregar a `docker-compose.yml`
3. Regenerar registry

```bash
node scripts/generate-bot-registry.js --compose docker-compose.16player.yml
```

### Configuraciones

- **smoke**: 4 bots
- **4player**: 4 bots
- **8player**: 8 bots
- **16player**: 16 bots (planificado)

## 📈 Rendimiento

- **Health Checks**: Paralelos, 2s timeout
- **Cache TTL**: 30 segundos
- **Docker API**: Consulta única
- **Memory**: ~1MB por 16 bots

---

**Última actualización**: 2025-10-10
