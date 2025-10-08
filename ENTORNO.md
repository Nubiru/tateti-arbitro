# Configuración de Variables de Entorno

## Archivo .env Requerido

Crear un archivo `.env` en el directorio raíz con la siguiente configuración. Incluye soporte para la nueva arquitectura de servicios refactorizada con GameOptionsService y PlayerService.

```bash
# Backend Configuration
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
TRUST_PROXY=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Docker Environment Detection
DOCKER_ENV=true

# Dynamic Bot Discovery
DOCKER_DISCOVERY=true
DOCKER_HOST=unix:///var/run/docker.sock
DISCOVERY_CACHE_TTL=30000
DISCOVERY_TIMEOUT=2000

# Frontend Build Configuration (for Docker builds)
VITE_API_URL=http://localhost:4000
```

## Variables de Entorno Explicadas

### Variables del Backend

- **NODE_ENV**: Establecer a `production` para builds de producción, `development` para desarrollo local
- **PORT**: Puerto del servidor backend (por defecto: 4000)
- **LOG_LEVEL**: Verbosidad de logging (`debug`, `info`, `warn`, `error`)
- **TRUST_PROXY**: Habilitar cuando esté detrás de proxy reverso (Docker, Nginx)

### Rate Limiting

- **RATE_LIMIT_WINDOW_MS**: Ventana de tiempo para rate limiting en milisegundos (15 minutos = 900000)
- **RATE_LIMIT_MAX**: Máximo de requests por ventana

### Detección de Docker

- **DOCKER_ENV**: Establecer a `true` cuando se ejecute en contenedores Docker para descubrimiento de servicios apropiado

### Descubrimiento Dinámico de Bots

- **DOCKER_DISCOVERY**: Habilitar descubrimiento automático de bots via Docker API
- **DOCKER_HOST**: Socket de Docker para consultar contenedores (por defecto: unix:///var/run/docker.sock)
- **DISCOVERY_CACHE_TTL**: Tiempo de vida del caché de descubrimiento en milisegundos (30 segundos = 30000)
- **DISCOVERY_TIMEOUT**: Timeout para health checks de bots en milisegundos (2 segundos = 2000)

### Build del Frontend

- **VITE_API_URL**: URL base de la API para build del frontend (usado durante build de Docker)

## Entorno Docker Compose

Los archivos docker-compose cargarán automáticamente este archivo `.env` y pasarán las variables apropiadas a los contenedores.

## Configuración Rápida

1. Copiar la configuración anterior en un nuevo archivo `.env` en el directorio raíz
2. Ajustar valores según sea necesario para tu entorno
3. Ejecutar `docker-compose up` para iniciar el sistema

## Desarrollo vs Producción

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
DISCOVERY_CACHE_TTL=30000
DISCOVERY_TIMEOUT=2000
```

## Descubrimiento de Bots

El sistema incluye **descubrimiento dinámico de bots** que detecta automáticamente hasta 16 jugadores:

- **Docker API**: Consulta contenedores Docker en ejecución
- **Health Checks**: Verifica estado de cada bot (2s timeout)
- **Metadata**: Obtiene información de `/info` endpoint
- **Cache**: Almacena resultados por 30 segundos
- **Frontend**: Pobla automáticamente lista de jugadores
- **🏗️ PlayerService**: Gestión centralizada de descubrimiento y generación de jugadores

**Configuración**:
- `DOCKER_DISCOVERY=true`: Habilitar descubrimiento automático
- `DOCKER_ENV=true`: Indicar que está en Docker
- `DISCOVERY_CACHE_TTL=30000`: TTL del caché (30s)
- `DISCOVERY_TIMEOUT=2000`: Timeout health check (2s)

## 🏗️ Servicios Refactorizados

### GameOptionsService
- **Configuración Centralizada**: Manejo unificado de opciones de juego
- **Validación Robusta**: Validación completa con valores por defecto
- **Sistema de Throttling**: Control inteligente de velocidad de juego
- **Gestión de Estado**: Helpers para estados de juego y procesamiento de datos

### PlayerService
- **Descubrimiento Dinámico**: Detección automática de bots disponibles
- **Generación de Jugadores**: Creación inteligente basada en bots saludables
- **Sistema de Fallbacks**: Manejo automático de bots no disponibles
- **Validación de Configuración**: Validación completa de setup de partida

## Entornos de Producción

### Vercel (Frontend)

```
VITE_API_URL=https://your-backend.railway.app
```

### Railway/Render (Backend)

```
NODE_ENV=production
DOCKER_ENV=false
# ... variables existentes
```
