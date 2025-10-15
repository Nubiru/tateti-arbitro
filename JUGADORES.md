# Guía de Jugadores

Sistema de bots para pruebas automatizadas de Ta-Te-Ti.

**Todos los bots soportan tableros 3x3 y 5x5.**

## 🎯 Tipos de Jugadores

### 🎲 RandomBot - Estrategia Aleatoria

**Descripción**: Movimientos completamente aleatorios.

**Características:**
- Movimientos impredecibles
- Validación de reglas
- Base de comparación

**Nivel**: Principiante

**Uso:**
- `smoke`: RandomBot1 (3001), RandomBot2 (3002)
- `4player`: RandomBot1-3 (3001, 3002, 3005)

---

### 🧠 SmartBot - Estrategia Táctica

**Descripción**: Lógica táctica con prioridades.

**Algoritmo:**
1. **GANAR** - Movimiento ganador
2. **BLOQUEAR** - Bloquear oponente
3. **CENTRO** - Ocupar centro
4. **ESQUINAS** - Priorizar esquinas
5. **CUALQUIERA** - Posición disponible

**Nivel**: Intermedio

**Uso:**
- `smoke`: SmartBot1 (3003)
- `4player`: SmartBot2 (3006)

---

### ⚔️ StrategicBot - Estrategia Posicional

**Descripción**: Decisiones tácticas por turno.

**Algoritmo:**
- **Turno 1**: Centro
- **Turno 2**: Centro o esquina
- **Turno 3+**: Ganar → Bloquear → Posicional

**Nivel**: Avanzado

**Uso:**
- `smoke`: StrategicBot1 (3004)

---

## 🚀 Configuración

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

---

## 🌐 Vercel Bots - Cloud Deployment

### 🚀 StrategicBot Vercel - Estrategia Avanzada en la Nube

**Descripción**: Bot estratégico desplegado en Vercel con lógica avanzada.

**Características:**
- Alojado en Vercel (serverless)
- Misma lógica que StrategicBot local
- Disponible globalmente
- Escalabilidad automática

**URL**: `https://ta-te-ti-bemg.vercel.app`

**Endpoints:**
- `GET /health` - Estado del bot
- `GET /move?board=[...]` - Solicitar movimiento
- `GET /info` - Información del bot

**Configuración:**
```bash
# Variables de entorno
VERCEL_BOTS_ENABLED=true
VERCEL_BOT_URLS=https://ta-te-ti-bemg.vercel.app
```

**Uso en el Arbitrador:**
- Se descubre automáticamente
- Aparece en `/api/bots/available`
- Compatible con Docker bots
- Soporte para tableros 3x3 y 5x5

---

## 🌐 API

### Endpoints

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

---

## 🧪 Testing

```bash
# Tests unitarios
cd players/random-bot && npm test
cd players/smart-bot && npm test

# Cobertura
npm run test:coverage  # Objetivo: ≥85%
```

---

## 📊 Comparativa

| Bot | Velocidad | Win Rate vs Random | Complejidad |
|-----|-----------|-------------------|-------------|
| **RandomBot** | Instantáneo | ~50% | Mínima |
| **SmartBot** | <10ms | ~80% | Media |
| **StrategicBot** | <15ms | ~85% | Alta |

---

## 🔧 Desarrollo de Bots

### Estructura

```
players/
  mi-bot/
    ├── index.js        # Servidor
    ├── algorithm.js    # Lógica
    ├── package.json
    ├── Dockerfile
    └── tests/
```

### Contrato de API

**Obligatorio:**
1. `GET /health`
2. `GET /move?board=[...]` → `{"move": <número>}`
3. Puerto configurable
4. Soporte 3x3 y 5x5

**Recomendado:**
1. `GET /info`
2. Timeout <2s
3. Tests ≥85% cobertura

---

## 📦 Docker

### Construir Bot

```bash
docker build -t tateti-smart-bot:v1.0.0 ./players/smart-bot
```

### Ejecutar Bot

```bash
docker run -d --name smartbot1 -p 3003:3003 \
  -e PORT=3003 \
  tateti-smart-bot:v1.0.0

curl http://localhost:3003/health
```

---

## 🎮 Ejemplo de Uso

```bash
# Iniciar ambiente
npm run docker:smoke

# Crear partida
curl -X POST http://localhost:4000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "player1": {"name":"SmartBot1","url":"http://tateti-smart-bot-1:3003"},
    "player2": {"name":"StrategicBot1","url":"http://tateti-strategic-bot-1:3004"},
    "boardSize": 3
  }'
```

---

## ⚠️ Notas

1. **Stateless**: Sin estado, reciben tablero completo
2. **Timeout**: 2s límite de respuesta
3. **Board**: `0` = vacío, `1` = X, `2` = O
4. **Detección**: Descubrimiento automático vía Docker API

---

**Última actualización**: 2025-10-10
