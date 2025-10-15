# Referencia de API

Documentación completa de todos los endpoints del sistema.

## 🌐 Backend API

### Base URL

```
Desarrollo: http://localhost:4000
Producción: https://your-backend.railway.app
```

### Headers Comunes

```http
Content-Type: application/json
Accept: application/json
```

## 🎮 Endpoints de Juego

### POST /api/match

Crear una nueva partida entre dos jugadores.

**Request:**
```json
{
  "player1": {
    "name": "SmartBot1",
    "port": 3003
  },
  "player2": {
    "name": "StrategicBot1", 
    "port": 3004
  },
  "boardSize": 3
}
```

**Response (201):**
```json
{
  "matchId": "abc123-def456",
  "status": "active",
  "players": [
    {
      "name": "SmartBot1",
      "port": 3003,
      "symbol": "X"
    },
    {
      "name": "StrategicBot1",
      "port": 3004,
      "symbol": "O"
    }
  ],
  "board": [0,0,0,0,0,0,0,0,0],
  "currentPlayer": "X",
  "boardSize": 3
}
```

**Códigos de Error:**
- `400` - Datos inválidos
- `404` - Jugador no encontrado
- `500` - Error interno del servidor

### POST /api/tournament

Crear un torneo con múltiples jugadores.

**Request:**
```json
{
  "players": [
    {"name": "RandomBot1", "port": 3001},
    {"name": "SmartBot1", "port": 3003},
    {"name": "StrategicBot1", "port": 3004},
    {"name": "RandomBot2", "port": 3002}
  ],
  "boardSize": 3,
  "format": "single-elimination"
}
```

**Response (201):**
```json
{
  "tournamentId": "tour-xyz789",
  "status": "active",
  "format": "single-elimination",
  "bracket": [
    {
      "matchId": "match-1",
      "player1": "RandomBot1",
      "player2": "SmartBot1",
      "status": "pending"
    },
    {
      "matchId": "match-2", 
      "player1": "StrategicBot1",
      "player2": "RandomBot2",
      "status": "pending"
    }
  ],
  "currentRound": 1,
  "totalRounds": 2
}
```

## 📡 Endpoints de Streaming

### GET /api/stream

Obtener eventos en tiempo real del sistema.

**Request:**
```http
GET /api/stream
Accept: text/event-stream
Cache-Control: no-cache
```

**Response (Server-Sent Events):**
```
data: {"type":"match_started","matchId":"abc123","players":["SmartBot1","StrategicBot1"]}

data: {"type":"move_made","matchId":"abc123","player":"SmartBot1","position":4,"board":[0,0,0,0,1,0,0,0,0]}

data: {"type":"match_ended","matchId":"abc123","winner":"SmartBot1","reason":"win"}
```

**Tipos de Eventos:**
- `match_started` - Partida iniciada
- `move_made` - Movimiento realizado
- `match_ended` - Partida terminada
- `tournament_updated` - Torneo actualizado
- `error` - Error en el sistema

### GET /api/stream/status

Obtener estado actual del stream.

**Response (200):**
```json
{
  "activeConnections": 3,
  "totalEvents": 1250,
  "lastEvent": "2025-10-10T15:30:00.000Z",
  "status": "healthy"
}
```

## 🤖 Endpoints de Bots

### GET /api/bots/available

Listar todos los bots disponibles en el sistema.

**Response (200):**
```json
{
  "bots": [
    {
      "name": "SmartBot1",
      "port": 3003,
      "type": "smart",
      "status": "healthy",
      "capabilities": ["3x3", "5x5"],
      "lastSeen": "2025-10-10T15:30:00.000Z"
    },
    {
      "name": "StrategicBot1",
      "port": 3004,
      "type": "strategic", 
      "status": "healthy",
      "capabilities": ["3x3", "5x5"],
      "lastSeen": "2025-10-10T15:30:00.000Z"
    }
  ],
  "total": 4,
  "healthy": 4,
  "lastDiscovery": "2025-10-10T15:30:00.000Z"
}
```

### GET /api/bots/discovery

Forzar redescubrimiento de bots.

**Response (200):**
```json
{
  "message": "Discovery initiated",
  "timestamp": "2025-10-10T15:30:00.000Z",
  "discoveredBots": 4
}
```

## 🏥 Endpoints de Salud

### GET /api/health

Verificar estado del sistema.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-10T15:30:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "bots": "healthy"
  }
}
```

### GET /api/health/detailed

Estado detallado del sistema.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-10T15:30:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "memory": {
    "used": "45MB",
    "total": "128MB",
    "percentage": 35.2
  },
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": "2ms"
    },
    "redis": {
      "status": "healthy", 
      "responseTime": "1ms"
    },
    "bots": {
      "status": "healthy",
      "total": 4,
      "healthy": 4
    }
  }
}
```

## 🤖 Bot API

### Base URL para Bots

```
Docker: http://localhost:300X
Vercel: https://tu-bot.vercel.app
```

### GET /health

Verificar estado del bot.

**Response (200):**
```json
{
  "status": "healthy",
  "player": "SmartBot1",
  "timestamp": "2025-10-10T15:30:00.000Z"
}
```

### GET /info

Obtener información del bot.

**Response (200):**
```json
{
  "name": "SmartBot1",
  "strategy": "Smart",
  "version": "1.0.0",
  "capabilities": ["3x3", "5x5"],
  "author": "Tu Nombre",
  "description": "Bot con estrategia táctica"
}
```

### GET /move

Solicitar movimiento del bot.

**Query Parameters:**
- `board` (string): Array JSON del tablero

**Request:**
```http
GET /move?board=[0,0,0,0,0,0,0,0,0]
```

**Response (200):**
```json
{
  "move": 4
}
```

**Códigos de Error:**
- `400` - Tablero inválido
- `500` - Error interno del bot

## 📊 Endpoints de Estadísticas

### GET /api/stats

Obtener estadísticas del sistema.

**Response (200):**
```json
{
  "totalMatches": 1250,
  "activeMatches": 3,
  "totalTournaments": 45,
  "activeTournaments": 1,
  "totalBots": 4,
  "healthyBots": 4,
  "uptime": 3600,
  "averageMatchTime": 45.2
}
```

### GET /api/stats/bots

Estadísticas de bots.

**Response (200):**
```json
{
  "bots": [
    {
      "name": "SmartBot1",
      "totalMatches": 500,
      "wins": 400,
      "losses": 100,
      "winRate": 80.0,
      "averageMoveTime": 150
    }
  ]
}
```

## 🔧 Endpoints de Administración

### POST /api/admin/restart

Reiniciar el sistema.

**Headers:**
```http
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "message": "System restart initiated",
  "timestamp": "2025-10-10T15:30:00.000Z"
}
```

### POST /api/admin/clear-cache

Limpiar caché del sistema.

**Response (200):**
```json
{
  "message": "Cache cleared successfully",
  "timestamp": "2025-10-10T15:30:00.000Z"
}
```

## 📝 Códigos de Error Comunes

### 4xx - Errores del Cliente

| Código | Descripción | Solución |
|--------|-------------|----------|
| `400` | Bad Request | Verificar formato de datos |
| `401` | Unauthorized | Verificar token de autenticación |
| `403` | Forbidden | Sin permisos para la operación |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto de estado |
| `422` | Unprocessable Entity | Datos válidos pero no procesables |
| `429` | Too Many Requests | Rate limit excedido |

### 5xx - Errores del Servidor

| Código | Descripción | Solución |
|--------|-------------|----------|
| `500` | Internal Server Error | Error interno, revisar logs |
| `502` | Bad Gateway | Servicio externo no disponible |
| `503` | Service Unavailable | Servicio temporalmente no disponible |
| `504` | Gateway Timeout | Timeout en servicio externo |

## 🔍 Ejemplos de Uso

### Crear Partida Completa

```bash
# 1. Verificar bots disponibles
curl http://localhost:4000/api/bots/available

# 2. Crear partida
curl -X POST http://localhost:4000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "player1": {"name": "SmartBot1", "port": 3003},
    "player2": {"name": "StrategicBot1", "port": 3004},
    "boardSize": 3
  }'

# 3. Escuchar eventos
curl -N http://localhost:4000/api/stream
```

### Crear Torneo

```bash
# Crear torneo de 4 jugadores
curl -X POST http://localhost:4000/api/tournament \
  -H "Content-Type: application/json" \
  -d '{
    "players": [
      {"name": "RandomBot1", "port": 3001},
      {"name": "SmartBot1", "port": 3003},
      {"name": "StrategicBot1", "port": 3004},
      {"name": "RandomBot2", "port": 3002}
    ],
    "boardSize": 3,
    "format": "single-elimination"
  }'
```

### Probar Bot Manualmente

```bash
# Health check
curl http://localhost:3003/health

# Información
curl http://localhost:3003/info

# Movimiento
curl "http://localhost:3003/move?board=[0,0,0,0,0,0,0,0,0]"
```

## 📚 Recursos Adicionales

- **[Cookbook](Cookbook)** - Ejemplos prácticos de uso
- **[Bots y Jugadores](Bots-y-Jugadores)** - Sistema de bots
- **[Desarrollo](Desarrollo)** - Guía de desarrollo

---

**¿Necesitas más ejemplos?** Consulta el [Cookbook](Cookbook) para recetas completas de uso de la API.
