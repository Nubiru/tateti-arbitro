# Ta-Te-Ti Arbitro - Guía de Referencia Rápida

## 🚀 COMANDOS PRINCIPALES POR INTENCIÓN

### 🔍 VALIDACIÓN DE CALIDAD (OBLIGATORIO)
```bash
# Antes de cada commit - valida que pasarán los hooks
npm run qa:precommit

# Si ✅ pasa, entonces:
git add .
git commit -m "tu mensaje"
```

### 📋 DESARROLLO RÁPIDO (Recomendado)
```bash
# Modo Individual (2 jugadores)
npm run test:2player

# Torneo 4 jugadores (2 random + 2 algoritmo)
npm run test:4player

# Torneo 8 jugadores (4 random + 4 algoritmo)
npm run test:8player
```

### 🔧 DESARROLLO MANUAL
```bash
# Backend + Frontend (2 jugadores)
npm run dev:full

# Backend + Frontend (4 jugadores)
npm run dev:full:4player

# Backend + Frontend (8 jugadores)
npm run dev:full:8player
```

### 🐳 CONSTRUCCIÓN DE IMÁGENES
```bash
# Construir todas las imágenes
npm run docker:build:all

# Solo backend
npm run docker:build

# Solo frontend
npm run docker:build:frontend
```

### 🧹 LIMPIEZA
```bash
# Detener todos los contenedores
npm run clean:all

# Limpiar sistema Docker
npm run docker:clean
```

### 🔍 CALIDAD Y VALIDACIÓN
```bash
# Validación pre-commit (OBLIGATORIO)
npm run qa:precommit

# Verificación completa
npm run qa:full

# Solo formato
npm run qa:format

# Solo linting
npm run qa:lint

# Solo pruebas
npm run qa:test
```

## 🎯 CONFIGURACIONES DISPONIBLES

| Configuración | Archivo | Jugadores | Uso |
|---------------|---------|-----------|-----|
| **2 Jugadores** | `docker-compose.backend-test.yml` | 2 Random | Individual, Pruebas |
| **4 Jugadores** | `docker-compose.4player.yml` | 2 Random + 2 Algoritmo | Torneo 4P |
| **8 Jugadores** | `docker-compose.8player.yml` | 4 Random + 4 Algoritmo | Torneo 8P |

## 🏗️ ARQUITECTURA DE SERVICIOS

### GameOptionsService
- **Configuración Centralizada**: Manejo unificado de opciones de juego (velocidad, tamaño de tablero, modo)
- **Validación Robusta**: Validación completa de configuraciones con valores por defecto
- **Cálculos de Velocidad**: Sistema de throttling inteligente para diferentes velocidades de juego
- **Gestión de Estado**: Helpers para estados de juego y procesamiento de datos

### PlayerService  
- **Descubrimiento Dinámico**: Detección automática de bots disponibles via API
- **Generación de Jugadores**: Creación inteligente de jugadores basada en bots saludables
- **Validación de Configuración**: Validación de conteo de jugadores y configuración de partida
- **Gestión de Fallbacks**: Sistema de respaldo para bots no disponibles

## 🌐 PUERTOS Y ACCESOS

- **Frontend**: http://localhost:3000 (o 3001 si 3000 está ocupado)
- **Backend API**: http://localhost:4000
- **Bots**: 3001-3008 (según configuración)

## 🔍 VERIFICACIÓN RÁPIDA

```bash
# Verificar contenedores activos
docker ps

# Verificar estado del backend
curl http://localhost:4000/api/stream/status

# Verificar bots disponibles
curl http://localhost:4000/api/bots/available

# Ver logs del backend
docker logs tateti-arbitrator-backend-test
```

## ⚡ FLUJO RECOMENDADO

### Para Pruebas Rápidas:
1. `npm run test:4player` (4 jugadores)
2. Abrir http://localhost:3000
3. Seleccionar "Torneo" → "4 jugadores"
4. Click "Iniciar Torneo"

### Para Desarrollo:
1. `npm run dev:full:4player` (Terminal 1)
2. `npm run dev:frontend` (Terminal 2)
3. Desarrollar y probar
4. **ANTES DE COMMIT**: `npm run qa:precommit`
5. Si ✅ pasa: `git add . && git commit -m "mensaje"`

### Para Producción:
1. `npm run docker:build:all`
2. `docker-compose up`
3. Acceder a http://localhost

## 🚨 SOLUCIÓN DE PROBLEMAS

### Error 500 en Match:
- ✅ **SOLUCIONADO**: Bug de timestamp corregido

### Puerto 3000 ocupado:
- ✅ **AUTOMÁTICO**: Vite usa puerto 3001 automáticamente

### No se descubren bots:
- Verificar que backend esté corriendo
- Verificar endpoint `/api/bots/available`
- ✅ **MEJORADO**: PlayerService maneja fallbacks automáticamente

### Contenedores no inician:
- `npm run clean:all`
- `npm run docker:build:all`
- Reintentar comando

### Problemas de configuración de juego:
- ✅ **SOLUCIONADO**: GameOptionsService valida y normaliza configuraciones automáticamente
- ✅ **MEJORADO**: Sistema de fallbacks para configuraciones inválidas
