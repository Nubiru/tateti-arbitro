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
                        Descubrimiento Dinámico
                        (Docker API + Health)
```

**Componentes:**
- **Frontend**: React 18 con SSE para actualizaciones en tiempo real
- **Backend**: Express 5 con arbitraje y descubrimiento de bots
- **Bots**: 3 estrategias (Random, Smart, Strategic)
- **Services**: GameOptionsService y PlayerService para gestión centralizada

## 🤖 Jugadores

| Bot | Estrategia | Uso |
|-----|-----------|-----|
| **RandomBot** | Movimientos aleatorios | Validación |
| **SmartBot** | WIN→BLOCK→CENTER | Partidas balanceadas |
| **StrategicBot** | Posicional por turnos | Torneos |

**Soporte**: Tableros 3x3 y 5x5

> 📚 Ver [JUGADORES.md](./JUGADORES.md) para algoritmos y API

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
