# Guía Docker

Sistema containerizado con Docker para ejecutar el árbitro con diferentes configuraciones.

**Node.js 20 LTS** en todos los contenedores.

## 🎯 Estrategia de Frontend

### Modo Desarrollo (Frontend FUERA)

```bash
npm run dev:smoke     # Backend en Docker, Frontend en Vite
npm run dev:4player   # 4 bots + Frontend en Vite
npm run dev:8player   # 8 bots + Frontend en Vite
```

**Ventajas:**
- ✅ Hot-reload instantáneo
- ✅ Debugging fácil
- ✅ Sin rebuilds
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

## 🚀 Configuraciones

| Config | Comando Dev | Comando Docker | Jugadores |
|--------|-------------|----------------|-----------|
| **Smoke** | `dev:smoke` | `docker:smoke` | 4 bots |
| **4-Player** | `dev:4player` | `docker:4player` | 4 bots |
| **8-Player** | `dev:8player` | `docker:8player` | 8 bots |
| **Prod** | - | `docker:prod` | Stack completo |

## 📦 Prerequisitos

```bash
# Verificar Docker
docker --version
docker-compose --version

# Instalar dependencias
npm install
cd client && npm install && cd ..
```

## 🔨 Construcción

```bash
# Construir todas las imágenes
npm run docker:build:all

# Construcción individual
npm run docker:build           # Backend
npm run docker:build:frontend  # Frontend
```

## 🎮 Uso

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

### Pipeline Completo

```bash
# QA → Build → Deploy
npm run deploy:smoke      # Smoke
npm run deploy:4player    # 4 jugadores
npm run deploy:8player    # 8 jugadores
npm run deploy:prod       # Producción
```

## 🤖 Bots

> 📚 Ver [JUGADORES.md](./JUGADORES.md) para algoritmos y estrategias

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

```bash
# Estado
docker ps

# Logs
docker logs tateti-arbitrator-smoke
docker logs tateti-smart-bot-1

# Reiniciar
docker restart tateti-arbitrator-smoke

# Limpieza
npm run docker:down
npm run docker:clean
```

## 🐛 Troubleshooting

### Windows: DOCKER_DISCOVERY

Crear `.env` en raíz:

```env
DOCKER_DISCOVERY=false
```

Esto previene el crash del Docker socket en Windows.

### Puerto ocupado

```bash
# Ver qué usa el puerto
netstat -ano | findstr :4000

# Cambiar puerto en docker-compose.yml
ports:
  - "4001:4000"
```

### Contenedor no inicia

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

## 🌐 Puertos

| Config | Backend | Frontend | Bots |
|--------|---------|----------|------|
| **Dev** | 4000 | 5173 | 3001-3008 |
| **Docker** | 4000 | 4000 | 3001-3008 |
| **Prod** | 4000 | 80 | 3001-3002 |

## ⚠️ Notas

1. **Node.js 20 LTS** - Versión unificada
2. **Red Docker** - Comunicación por nombres de servicio
3. **Health Checks** - Verificaciones automáticas
4. **Imágenes Versionadas** - Tag `v1.0.0`

---

**Última actualización**: 2025-10-10
