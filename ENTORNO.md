# Variables de Entorno

Configuración de variables de entorno para el sistema.

## 📋 Archivo .env

Crear `.env` en el directorio raíz:

```bash
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

## 📖 Explicación

### Backend

- **NODE_ENV**: `production` o `development`
- **PORT**: Puerto del servidor (default: 4000)
- **LOG_LEVEL**: `debug`, `info`, `warn`, `error`
- **TRUST_PROXY**: `true` cuando está detrás de proxy

### Rate Limiting

- **RATE_LIMIT_WINDOW_MS**: Ventana de tiempo (15 min = 900000)
- **RATE_LIMIT_MAX**: Máximo de requests por ventana

### Docker

- **DOCKER_ENV**: `true` cuando ejecuta en contenedores

### Bot Discovery

- **DOCKER_DISCOVERY**: Habilitar descubrimiento automático
- **DOCKER_HOST**: Socket de Docker
- **DISCOVERY_CACHE_TTL**: TTL del caché (30s = 30000)
- **DISCOVERY_TIMEOUT**: Timeout de health checks (2s = 2000)

### Frontend

- **VITE_API_URL**: URL del API para build

## 🔧 Ambientes

### Desarrollo

```bash
NODE_ENV=development
LOG_LEVEL=debug
DOCKER_ENV=false
DOCKER_DISCOVERY=false
```

### Producción

```bash
NODE_ENV=production
LOG_LEVEL=info
DOCKER_ENV=true
DOCKER_DISCOVERY=true
```

## 🌐 Servicios

### GameOptionsService

Configuración centralizada de opciones de juego con validación robusta.

### PlayerService

Descubrimiento dinámico y gestión de jugadores con sistema de fallbacks.

## ☁️ Plataformas

### Vercel (Frontend)

```env
VITE_API_URL=https://your-backend.railway.app
```

### Railway (Backend)

```env
NODE_ENV=production
DOCKER_ENV=false
PORT=4000
LOG_LEVEL=info
```

---

**Última actualización**: 2025-10-10
