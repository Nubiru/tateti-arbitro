# Bots y Jugadores

Sistema de bots para pruebas automatizadas con descubrimiento dinámico y soporte para Vercel.

## 🎯 Tipos de Bots

### 🎲 RandomBot - Estrategia Aleatoria

**Descripción**: Movimientos completamente aleatorios.

**Características:**
- Movimientos impredecibles
- Validación de reglas básicas
- Base de comparación para otros bots

**Nivel**: Principiante

**Uso:**
- `smoke`: RandomBot1 (3001), RandomBot2 (3002)
- `4player`: RandomBot1-3 (3001, 3002, 3005)

### 🧠 SmartBot - Estrategia Táctica

**Descripción**: Lógica táctica con prioridades claras.

**Algoritmo:**
1. **GANAR** - Movimiento ganador si existe
2. **BLOQUEAR** - Bloquear oponente de ganar
3. **CENTRO** - Ocupar centro del tablero
4. **ESQUINAS** - Priorizar esquinas
5. **CUALQUIERA** - Posición disponible

**Nivel**: Intermedio

**Uso:**
- `smoke`: SmartBot1 (3003)
- `4player`: SmartBot2 (3006)

### ⚔️ StrategicBot - Estrategia Posicional

**Descripción**: Decisiones tácticas basadas en el turno.

**Algoritmo:**
- **Turno 1**: Centro del tablero
- **Turno 2**: Centro o esquina estratégica
- **Turno 3+**: Ganar → Bloquear → Posicional

**Nivel**: Avanzado

**Uso:**
- `smoke`: StrategicBot1 (3004)

## 🌐 Bots en Vercel (Cloud)

### 🚀 StrategicBot Vercel - Estrategia Avanzada en la Nube

**Descripción**: Bot estratégico desplegado en Vercel con lógica avanzada.

**Características:**
- Alojado en Vercel (serverless)
- Misma lógica que StrategicBot local
- Disponible globalmente
- Escalabilidad automática

**URL**: `https://ta-te-ti-bemg.vercel.app`

**Configuración:**
```env
VERCEL_BOTS_ENABLED=true
VERCEL_BOT_URLS=https://ta-te-ti-bemg.vercel.app
```

**Uso en el Arbitrador:**
- Se descubre automáticamente
- Aparece en `/api/bots/available`
- Compatible con Docker bots
- Soporte para tableros 3x3 y 5x5

## 🔍 Sistema de Descubrimiento Dinámico

### Características

- **Descubrimiento Automático**: Detecta bots sin configuración manual
- **Escalabilidad**: Soporte para 2-16 jugadores
- **Docker Native**: Integración con Docker API
- **Vercel Support**: Soporte para bots alojados en Vercel
- **Health Checks**: Verificación en tiempo real
- **Caching**: 30 segundos TTL para optimización
- **Fallback**: Funciona en localhost sin Docker
- **Hybrid Discovery**: Combina Docker y Vercel bots

### Arquitectura

```
Bot Registry ◄──► Bot Discovery ◄──► Docker API
                       │                    │
                       │                    ▼
                       │              Vercel API
                       │
                       ▼
              /api/bots/available
```

### Configuración

#### Docker Discovery
```env
DOCKER_DISCOVERY=true         # Habilitar descubrimiento Docker
DOCKER_ENV=true               # Indicar ambiente Docker
DOCKER_HOST=unix:///var/run/docker.sock
DISCOVERY_CACHE_TTL=30000     # 30 segundos
DISCOVERY_TIMEOUT=2000        # 2 segundos
```

#### Vercel Bot Discovery
```env
VERCEL_BOTS_ENABLED=true      # Habilitar bots de Vercel
VERCEL_BOT_URLS=https://ta-te-ti-bemg.vercel.app,https://another-bot.vercel.app
```

## 🚀 Configuraciones de Bots

### Smoke (4 bots)

```bash
npm run docker:smoke
```

**Bots:**
- RandomBot1, RandomBot2 (3001-3002)
- SmartBot1 (3003)
- StrategicBot1 (3004)

### 4-Player (4 bots)

```bash
npm run docker:4player
```

**Bots:**
- RandomBot1, RandomBot2, RandomBot3 (3001, 3002, 3005)
- SmartBot2 (3006)

### 8-Player (8 bots)

```bash
npm run docker:8player
```

**Distribución:**
- 3x RandomBot
- 3x SmartBot
- 2x StrategicBot

## 🌐 API de Bots

### Endpoints Obligatorios

**GET /health**
```bash
curl http://localhost:3001/health
# {"status":"healthy","player":"RandomBot1"}
```

**GET /info**
```bash
curl http://localhost:3003/info
# {"name":"SmartBot1","strategy":"Smart","version":"1.0.0"}
```

**GET /move?board=[...]**
```bash
# Tablero 3x3 vacío
curl "http://localhost:3003/move?board=[0,0,0,0,0,0,0,0,0]"
# {"move":4}

# Tablero 5x5 vacío
curl "http://localhost:3003/move?board=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]"
# {"move":12}
```

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

## 🔧 Crear un Bot Nuevo

### Estructura de Bot

```
players/
  mi-bot/
    ├── index.js        # Servidor HTTP
    ├── algorithm.js    # Lógica del bot
    ├── package.json
    ├── Dockerfile
    └── tests/
```

### Contrato de API Obligatorio

1. `GET /health` → `{"status":"healthy","player":"NombreBot"}`
2. `GET /move?board=[...]` → `{"move": <número>}`
3. Puerto configurable
4. Soporte 3x3 y 5x5

### Ejemplo Mínimo

```javascript
// index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', player: 'MiBot' });
});

app.get('/move', (req, res) => {
  const board = JSON.parse(req.query.board);
  const move = calcularMovimiento(board);
  res.json({ move });
});

app.listen(PORT, () => {
  console.log(`Bot corriendo en puerto ${PORT}`);
});
```

### Agregar a Docker

```yaml
# docker-compose.yml
mi-bot:
  build: ./players/mi-bot
  ports:
    - "3009:3009"
  environment:
    - PORT=3009
```

## 🧪 Testing de Bots

```bash
# Tests unitarios
cd players/random-bot && npm test
cd players/smart-bot && npm test

# Cobertura
npm run test:coverage  # Objetivo: ≥85%
```

## 📊 Comparativa de Bots

| Bot | Velocidad | Win Rate vs Random | Complejidad |
|-----|-----------|-------------------|-------------|
| **RandomBot** | Instantáneo | ~50% | Mínima |
| **SmartBot** | <10ms | ~80% | Media |
| **StrategicBot** | <15ms | ~85% | Alta |

## 🔍 Flujo de Descubrimiento

1. **Carga Registry**: Lee `bot-registry.json`
2. **Docker Query**: Consulta contenedores activos
3. **Health Checks**: Verifica estado (paralelo, 2s timeout)
4. **Metadata**: Obtiene info de `/info`
5. **Cache**: Actualiza caché por 30s
6. **Response**: Devuelve bots disponibles

## 🐳 Docker para Bots

### Construir Bot

```bash
docker build -t tateti-mi-bot:v1.0.0 ./players/mi-bot
```

### Ejecutar Bot

```bash
docker run -d --name mibot1 -p 3009:3009 \
  -e PORT=3009 \
  tateti-mi-bot:v1.0.0

curl http://localhost:3009/health
```

## 🌐 Desplegar Bot en Vercel

### Estructura Vercel

```
/api
  /health.js
  /move.js
  /info.js
```

### Ejemplo Vercel Bot

```javascript
// api/health.js
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'healthy', 
    name: 'MiVercelBot',
    version: '1.0.0' 
  });
}

// api/move.js
export default function handler(req, res) {
  const { board } = req.query;
  const boardArray = JSON.parse(board);
  
  // Tu lógica de bot aquí
  const move = calcularMovimiento(boardArray);
  
  res.status(200).json({ move });
}
```

## 🔧 Verificación

```bash
# Health check de bot Docker
curl http://localhost:3001/health

# Health check de bot Vercel
curl https://ta-te-ti-bemg.vercel.app/health

# Metadata de bot
curl http://localhost:3001/info

# Docker
docker ps | grep bot

# Vercel bots
curl http://localhost:4000/api/bots/available
```

## 🚀 Escalabilidad

### Agregar Nuevos Bots

1. Actualizar `bot-registry.json`
2. Agregar a `docker-compose.yml`
3. Regenerar registry

```bash
node scripts/generate-bot-registry.js --compose docker-compose.16player.yml
```

### Configuraciones Disponibles

- **smoke**: 4 bots
- **4player**: 4 bots
- **8player**: 8 bots
- **16player**: 16 bots (planificado)

## 📈 Rendimiento

- **Health Checks**: Paralelos, 2s timeout
- **Cache TTL**: 30 segundos
- **Docker API**: Consulta única
- **Memory**: ~1MB por 16 bots

## ⚠️ Notas Importantes

1. **Stateless**: Sin estado, reciben tablero completo
2. **Timeout**: 2s límite de respuesta
3. **Board**: `0` = vacío, `1` = X, `2` = O
4. **Detección**: Descubrimiento automático vía Docker API

---

**¿Necesitas ejemplos prácticos?** Consulta el [Cookbook](Cookbook) para recetas de uso o la [API Reference](API-Reference) para detalles técnicos.
