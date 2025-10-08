# Ta-Te-Ti Arbitro

Sistema de arbitraje para partidas de Ta-Te-Ti entre bots HTTP con **descubrimiento dinámico de bots**, interfaz web en tiempo real y soporte para torneos de 2-16 jugadores. Incluye **arquitectura de servicios refactorizada** con GameOptionsService y PlayerService para una mejor mantenibilidad y robustez.

[![CI/CD Pipeline](https://github.com/Nubiru/tateti-arbitro/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/your-username/tateti-arbitro/actions)
[![Node.js Version](https://img.shields.io/badge/node-20.x.x-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 20 LTS
- Docker y Docker Compose
- Git

### Comandos Principales

```bash
# Instalar dependencias
npm install
cd client && npm install && cd ..

# Docker - Pruebas y Desarrollo
npm run docker:smoke     # Pruebas rápidas (2 jugadores)
npm run docker:4player   # Torneo 4 jugadores
npm run docker:8player   # Torneo 8 jugadores

# Docker - Producción
npm run docker:build:all  # Construir imágenes
npm run docker:prod       # Stack completo (Frontend + Backend)

# Detener contenedores
npm run docker:down
```

### 🔍 Validación Pre-commit (OBLIGATORIO)

```bash
# Antes de cada commit - valida que pasarán los hooks
npm run qa:precommit

# Si ✅ pasa, entonces:
git add .
git commit -m "tu mensaje"
```

> 📚 **Documentación Detallada**: Ver [ARRANQUE.md](./ARRANQUE.md) para comandos completos y flujos de trabajo.

## 📋 Comandos de Testing y QA

|     Categoría |      Comando          |      Descripción         |
|---------------|-----------------------|--------------------------|
| **Testing**   | `npm run test:unit`   | Tests unitarios          |
| **Testing**   | `npm run test:client` | Tests del cliente        |
| **Testing**   | `npm run test:integration` | Tests de integración |
| **Docker**    | `npm run docker:smoke` | Pruebas rápidas (2 bots) |
| **Docker**    | `npm run docker:4player` | Torneo 4 jugadores    |
| **Docker**    | `npm run docker:8player` | Torneo 8 jugadores    |
| **Docker**    | `npm run docker:prod` | Stack completo           |
| **Calidad**   | `npm run qa:precommit` | **Validación pre-commit** |
| **Calidad**   | `npm run qa:full`     | QA + Build completo      |

> 📚 **Comandos Completos**: Ver [ARRANQUE.md](./ARRANQUE.md) para lista completa de comandos.

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Bots HTTP     │
│   (React 18)    │◄──►│   (Express 5)   │◄──►│  (2-16 Jugadores)│
│   Port: 3000    │    │   Port: 4000    │    │   Ports: 3001+  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Dynamic Discovery│
                    │ (Docker + Health)│
                    │   Up to 16 Bots  │
                    └─────────────────┘
```

### 🔍 Descubrimiento Dinámico de Bots

El sistema detecta automáticamente bots disponibles:

1. **Docker API**: Consulta contenedores Docker en ejecución
2. **Health Checks**: Verifica estado de cada bot (2s timeout)
3. **Metadata**: Obtiene información de `/info` endpoint
4. **Cache**: Almacena resultados por 30 segundos
5. **Frontend**: Pobla automáticamente lista de jugadores

> 📚 **Configuración Docker**: Ver [DOCKER.md](./DOCKER.md) para configuraciones detalladas de contenedores.

## 🐳 Docker

### Comandos Básicos

```bash
# Construir y ejecutar
npm run docker:build:all
docker-compose up

# Pruebas específicas
npm run test:4player    # 4 jugadores
npm run test:8player    # 8 jugadores
```

> 📚 **Configuración Completa**: Ver [DOCKER.md](./DOCKER.md) para configuraciones detalladas, variables de entorno y troubleshooting.

## 🎯 Componentes

- **Backend**: Express 5 + Arbitraje + SSE + Dynamic Bot Discovery
- **Frontend**: React 18 + Configuración + Progreso + Celebración  
- **Bots**: HTTP endpoints para jugadores (2-16 jugadores)
- **Discovery**: Sistema dinámico de descubrimiento de bots con Docker API
- **🏗️ GameOptionsService**: Configuración centralizada y validación de opciones de juego
- **🏗️ PlayerService**: Descubrimiento dinámico y gestión de jugadores

## 🌐 API

- `POST /api/match` - Partidas individuales
- `POST /api/tournament` - Torneos
- `GET /api/stream` - Eventos en tiempo real (SSE)
- `GET /api/bots/available` - Descubrimiento de bots

> 📚 **Variables de Entorno**: Ver [ENTORNO.md](./ENTORNO.md) para configuración completa.

## 🧪 Pruebas

```bash
# Validación pre-commit (OBLIGATORIO antes de commit)
npm run qa:precommit

# Todas las pruebas
npm test

# 🆕 Pruebas de servicios refactorizados
npm test -- --testPathPattern="GameOptionsService"
npm test -- --testPathPattern="PlayerService"

# Verificación completa
npm run qa:full
```

### 🔍 Flujo de Calidad

1. **Desarrollo**: Escribir código
2. **Validación**: `npm run qa:precommit`
3. **Commit**: Solo si ✅ pasa la validación
4. **Push**: Los hooks pre-commit garantizan calidad

> 📚 **Plan de Pruebas**: Ver [PRUEBAS.md](./PRUEBAS.md) para configuraciones de testing y troubleshooting.

## 🚀 CI/CD

- **Pre-commit**: Formato, linting y pruebas automáticas
- **GitHub Actions**: Validación completa en PRs
- **Despliegue**: Automático a Vercel (frontend) y Railway (backend)

> 📚 **Automatización**: Ver [AUTOMATIZACION.md](./AUTOMATIZACION.md) para configuración completa del pipeline.

## 📊 Monitoreo

```bash
# Verificar estado
docker ps
curl http://localhost:4000/api/health

# Ver logs
docker logs tateti-arbitrator-backend-test
```

## 🚨 Solución de Problemas

### Problemas Comunes

- **Error 500**: ✅ Solucionado (bug de timestamp)
- **Puerto ocupado**: Vite usa puerto 3001 automáticamente
- **Bots no descubiertos**: Verificar `/api/bots/available`
- **Configuración inválida**: ✅ **SOLUCIONADO** - GameOptionsService valida y normaliza automáticamente
- **Jugadores no generados**: ✅ **MEJORADO** - PlayerService maneja fallbacks automáticamente

### 🏗️ Servicios Refactorizados

- **GameOptionsService**: Validación robusta de configuraciones de juego
- **PlayerService**: Descubrimiento dinámico y generación inteligente de jugadores
- **100% Tests Passing**: Cobertura completa de pruebas unitarias
- **Arquitectura Modular**: Servicios independientes y reutilizables

> 📚 **Troubleshooting Completo**: Ver [PRUEBAS.md](./PRUEBAS.md) para solución detallada de problemas.

---

**Versión**: 1.0.0  
**Node.js**: 20 LTS  
**Última actualización**: 2025-10-07  
**Licencia**: ISC

## 🏗️ Logros Recientes

- ✅ **Servicios Refactorizados**: GameOptionsService y PlayerService implementados
- ✅ **100% Tests Passing**: Cobertura completa de pruebas unitarias
- ✅ **Arquitectura Modular**: Servicios independientes y reutilizables
- ✅ **Validación Robusta**: Configuraciones validadas y normalizadas automáticamente
- ✅ **Sistema de Fallbacks**: Manejo inteligente de errores y casos edge
- ✅ **Documentación Actualizada**: Todos los archivos .md actualizados en español
