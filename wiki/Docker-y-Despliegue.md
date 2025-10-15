# Docker y Despliegue

Sistema containerizado con estrategias de despliegue para desarrollo y producción.

## 🎯 Estrategia de Frontend

### Modo Desarrollo (Frontend FUERA)

```bash
npm run dev:smoke     # Backend en Docker, Frontend en Vite
npm run dev:4player   # 4 bots + Frontend en Vite
npm run dev:8player   # 8 bots + Frontend en Vite
```

**Ventajas:**
- ✅ Hot-reload instantáneo (<100ms)
- ✅ Debugging fácil con DevTools
- ✅ Sin rebuilds de Docker
- 🌐 http://localhost:5173

### Modo Producción (Frontend DENTRO)

```bash
npm run docker:smoke    # Todo containerizado
npm run docker:4player  # Todo containerizado
npm run docker:prod     # Stack con Nginx
```

**Ventajas:**
- ✅ Deployment unificado
- ✅ Optimizado con Nginx
- ✅ Production-ready
- 🌐 http://localhost:4000

## 🚀 Configuraciones Disponibles

| Config | Comando Dev | Comando Docker | Jugadores | Propósito |
|--------|-------------|----------------|-----------|-----------|
| **Smoke** | `dev:smoke` | `docker:smoke` | 4 bots | Testing básico |
| **4-Player** | `dev:4player` | `docker:4player` | 4 bots | Torneo pequeño |
| **8-Player** | `dev:8player` | `docker:8player` | 8 bots | Torneo grande |
| **Prod** | - | `docker:prod` | Stack completo | Producción |

## 📦 Prerequisitos

```bash
# Verificar Docker
docker --version
docker-compose --version

# Instalar dependencias
npm install
cd client && npm install && cd ..
```

## 🔨 Construcción de Imágenes

```bash
# Construir todas las imágenes
npm run build:all

# Construcción individual
npm run build:frontend   # React → public/
npm run build:backend    # Imagen Docker backend
```

## 🎮 Uso del Sistema

### Desarrollo (Frontend FUERA)

```bash
# Iniciar
npm run dev:4player

# Verificar
curl http://localhost:4000/api/health
curl http://localhost:4000/api/bots/available

# Acceso
# Frontend: http://localhost:5173
# Backend: http://localhost:4000

# Detener
npm run docker:down
```

### Docker Completo (Frontend DENTRO)

```bash
# Iniciar
npm run docker:smoke

# Verificar
curl http://localhost:4000/api/health

# Acceso
# Todo en uno: http://localhost:4000

# Detener
npm run docker:down
```

## 🚢 Pipeline de Despliegue

### Pipeline Completo (QA → Build → Deploy)

```bash
# Pipeline completo
npm run deploy:smoke     # Ambiente de prueba
npm run deploy:4player   # Torneo 4 jugadores
npm run deploy:8player   # Torneo 8 jugadores
npm run deploy:prod      # Producción

# Cada comando ejecuta:
# 1. qa:precommit (format + lint + tests)
# 2. build:frontend (React → public/)
# 3. docker build (imágenes)
# 4. docker-compose up (deploy)
```

### Arquitectura de Despliegue

```
┌─────────────┐
│   Vercel    │ ← Frontend (React)
│  Frontend   │
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────┐      ┌──────────────┐
│ Railway     │ HTTP │   Vercel     │
│ Backend     │◄────►│ Player Bots  │
└─────────────┘      └──────────────┘
```

## 🌐 Variables de Entorno

### Archivo .env

Crear `.env` en el directorio raíz:

```env
# Backend
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
TRUST_PROXY=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Docker
DOCKER_ENV=true

# Bot Discovery
DOCKER_DISCOVERY=true
DOCKER_HOST=unix:///var/run/docker.sock
DISCOVERY_CACHE_TTL=30000
DISCOVERY_TIMEOUT=2000

# Frontend Build
VITE_API_URL=http://localhost:4000
```

### Ambientes Específicos

#### Desarrollo
```env
NODE_ENV=development
LOG_LEVEL=debug
DOCKER_ENV=false
DOCKER_DISCOVERY=false
```

#### Producción
```env
NODE_ENV=production
LOG_LEVEL=info
DOCKER_ENV=true
DOCKER_DISCOVERY=true
```

## 🤖 Bots en Docker

### Smoke Environment

- `tateti-random-bot-1` (3001)
- `tateti-random-bot-2` (3002)
- `tateti-smart-bot-1` (3003)
- `tateti-strategic-bot-1` (3004)

### Verificar Bots

```bash
# Health checks
curl http://localhost:3001/health
curl http://localhost:3003/health

# Info
curl http://localhost:3003/info

# Probar movimiento
curl "http://localhost:3003/move?board=[0,0,0,0,0,0,0,0,0]"
# Respuesta: {"move":4}
```

## 🔧 Comandos Útiles

### Estado del Sistema

```bash
# Estado de contenedores
docker ps

# Logs
docker logs tateti-arbitrator-smoke
docker logs tateti-smart-bot-1

# Reiniciar
docker restart tateti-arbitrator-smoke
```

### Limpieza

```bash
# Detener contenedores
npm run docker:down

# Limpiar frontend construido
npm run clean:frontend

# Limpiar Docker completo
npm run clean:docker

# Limpieza total
npm run clean:all
```

## 🐛 Troubleshooting

### Windows: DOCKER_DISCOVERY

Crear `.env` en raíz:

```env
DOCKER_DISCOVERY=false
```

Esto previene el crash del Docker socket en Windows.

### Puerto Ocupado

```bash
# Ver qué usa el puerto
netstat -ano | findstr :4000

# Cambiar puerto en docker-compose.yml
ports:
  - "4001:4000"
```

### Contenedor No Inicia

```bash
# Ver logs
docker logs tateti-arbitrator-smoke

# Reconstruir sin caché
docker-compose -f docker-compose.smoke.yml build --no-cache
```

## 📊 Verificación

```bash
# Backend
curl http://localhost:4000/api/health

# Bots disponibles
curl http://localhost:4000/api/bots/available

# SSE Stream
curl -N http://localhost:4000/api/stream
```

## 🌐 Puertos del Sistema

| Config | Backend | Frontend | Bots |
|--------|---------|----------|------|
| **Dev** | 4000 | 5173 | 3001-3008 |
| **Docker** | 4000 | 4000 | 3001-3008 |
| **Prod** | 4000 | 80 | 3001-3002 |

## ☁️ Despliegue en la Nube

### Frontend (Vercel)

**Variables de Entorno:**
```env
VITE_API_URL=https://your-backend.railway.app
```

**Despliegue Automático:**
- PR → Preview deployment
- Merge a master → Producción

### Backend (Railway/Render)

**Variables de Entorno:**
```env
NODE_ENV=production
DOCKER_ENV=false
PORT=4000
LOG_LEVEL=info
```

### Bots (Vercel Serverless)

Estructura para cada bot:
```
/api
  /random-bot.js
  /smart-bot.js
```

## 🔐 Secretos de GitHub

Agregar en repositorio GitHub:

1. `VERCEL_TOKEN` - Token de autenticación
2. `VERCEL_ORG_ID` - ID de organización
3. `VERCEL_PROJECT_ID` - ID de proyecto

Obtener tokens:
```bash
vercel login
# https://vercel.com/account/tokens

vercel link
cat .vercel/project.json
```

## ✅ Lista de Verificación

- [ ] Variables de entorno en secretos de plataforma
- [ ] CORS configurado para dominios de producción
- [ ] Rate limiting habilitado
- [ ] HTTPS forzado
- [ ] Headers de seguridad activos
- [ ] Dependencias auditadas regularmente

## ⚠️ Notas Importantes

1. **Node.js 20 LTS** - Versión unificada en todos los contenedores
2. **Red Docker** - Comunicación por nombres de servicio
3. **Health Checks** - Verificaciones automáticas
4. **Imágenes Versionadas** - Tag `v1.0.0`

---

**¿Necesitas más detalles?** Consulta [Bots y Jugadores](Bots-y-Jugadores) para el sistema de bots o el [Cookbook](Cookbook) para ejemplos de despliegue.
