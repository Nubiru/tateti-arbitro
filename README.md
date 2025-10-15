# Ta-Te-Ti Arbitro

Sistema de arbitraje para partidas de Ta-Te-Ti entre bots HTTP con descubrimiento dinámico de jugadores, interfaz web en tiempo real y soporte para torneos.

[![Node.js Version](https://img.shields.io/badge/node-20.x.x-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 20 LTS
- Docker y Docker Compose

### Instalación

```bash
npm install
cd client && npm install && cd ..
```

### Desarrollo

```bash
# Ambiente de prueba (4 bots)
npm run dev:smoke

# Torneo 4 jugadores
npm run dev:4player

# Validación pre-commit (obligatorio)
npm run qa:precommit
```

### Docker

```bash
# Construir y desplegar
npm run docker:smoke     # 4 bots para testing
npm run docker:4player   # Torneo 4 jugadores
npm run docker:prod      # Stack completo

# Detener
npm run docker:down
```

> 📚 **Documentación**: Ver [ARRANQUE.md](./ARRANQUE.md) para comandos completos

## 🏗️ Arquitectura

```
Frontend (React 18) ◄──► Backend (Express 5) ◄──► Bots HTTP
     :5173/:4000              :4000                 :3001+
                                  │
                                  ▼
                        Descubrimiento Híbrido
                        (Docker API + Vercel API)
```

**Componentes:**
- **Frontend**: React 18 con SSE para actualizaciones en tiempo real
- **Backend**: Express 5 con arbitraje y descubrimiento híbrido de bots
- **Bots**: 3 estrategias (Random, Smart, Strategic) + Vercel bots
- **Discovery**: Docker API + Vercel API para descubrimiento automático
- **Services**: GameOptionsService y PlayerService para gestión centralizada

## 🤖 Jugadores

| Bot | Estrategia | Uso | Despliegue |
|-----|-----------|-----|-----------|
| **RandomBot** | Movimientos aleatorios | Validación | Docker |
| **SmartBot** | WIN→BLOCK→CENTER | Partidas balanceadas | Docker |
| **StrategicBot** | Posicional por turnos | Torneos | Docker |
| **StrategicBot Vercel** | Posicional por turnos | Torneos | Vercel |

**Soporte**: Tableros 3x3 y 5x5

> 📚 Ver [JUGADORES.md](./JUGADORES.md) para algoritmos y API

## 🌐 Vercel Bot Support

### Configuración

```bash
# Habilitar bots de Vercel
VERCEL_BOTS_ENABLED=true
VERCEL_BOT_URLS=https://ta-te-ti-bemg.vercel.app,https://another-bot.vercel.app
```

### Características

- **Descubrimiento Automático**: Los bots de Vercel aparecen en `/api/bots/available`
- **Compatibilidad Total**: Funciona junto con bots Docker
- **Health Checks**: Verificación automática de disponibilidad
- **Escalabilidad**: Sin límites de infraestructura local

### Ejemplo de Uso

```bash
# Verificar bots disponibles (incluye Vercel)
curl http://localhost:3000/api/bots/available

# Crear partida con bot de Vercel
curl -X POST http://localhost:3000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "player1": {"name": "VercelBot", "url": "https://ta-te-ti-bemg.vercel.app"},
    "player2": {"name": "DockerBot", "port": 3001}
  }'
```

## 🌐 API

```bash
POST /api/match              # Crear partida
POST /api/tournament         # Crear torneo
GET  /api/stream             # Eventos en tiempo real
GET  /api/bots/available     # Listar bots disponibles
```

## 🧪 Testing

```bash
npm run qa:precommit   # Validación pre-commit (obligatorio)
npm test               # Tests unitarios e integración
npm run qa:full        # QA completo
```

> 📚 Ver [PRUEBAS.md](./PRUEBAS.md) para plan de testing completo

## 📚 Documentación

- [ARRANQUE.md](./ARRANQUE.md) - Comandos y flujos de trabajo
- [DOCKER.md](./DOCKER.md) - Configuración de contenedores
- [JUGADORES.md](./JUGADORES.md) - Bots y estrategias
- [ENTORNO.md](./ENTORNO.md) - Variables de entorno
- [PRUEBAS.md](./PRUEBAS.md) - Plan de testing
- [AUTOMATIZACION.md](./AUTOMATIZACION.md) - CI/CD
- [scripts/SCRIPTS.md](./scripts/SCRIPTS.md) - Scripts de verificación

---

**Versión**: 1.0.0  
**Node.js**: 20 LTS  
**Licencia**: ISC
