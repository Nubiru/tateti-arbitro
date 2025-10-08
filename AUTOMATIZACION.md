# Configuración de Automatización y Despliegue

## Resumen

Este documento describe el pipeline de automatización, puertas de calidad y estrategia de despliegue para el sistema Ta-Te-Ti, incluyendo la nueva arquitectura de servicios refactorizada con GameOptionsService y PlayerService.

## Gestión de Versiones de Node.js

### Versión Estándar: Node.js 20 LTS

**¿Por qué Node 20?**

- Lanzamiento LTS estable con soporte a largo plazo
- Compatible con todas las dependencias (sin problemas Alpine/musl)
- Coincide exactamente con el entorno Docker
- Consistente entre desarrollo y producción

### Configuración Local

```bash
# Instalar Node 20 usando nvm
nvm install 20
nvm use 20

# O crear .nvmrc y usar
nvm use
```

### Verificar Versión

```bash
node --version  # Debería mostrar v20.x.x
npm --version   # Debería mostrar 10.x.x o superior
```

## Puertas de Calidad

### Pre-commit (Local)

Se ejecuta automáticamente antes de cada commit:

1. ✅ Prettier format check (backend + frontend)
2. ✅ ESLint (backend + frontend)
3. ✅ Pruebas unitarias (backend + frontend)
4. ✅ **NUEVO**: Pruebas de servicios refactorizados (GameOptionsService, PlayerService)

### Pipeline CI/CD (GitHub Actions)

Se ejecuta en pull requests y merges:

1. ✅ Prettier format check (backend + frontend)
2. ✅ ESLint (backend + frontend)
3. ✅ Pruebas unitarias con cobertura (backend + frontend)
4. ✅ **NUEVO**: Pruebas de servicios refactorizados con cobertura completa
5. ✅ Verificación de build del frontend
6. ✅ Verificación de build de imagen Docker
7. ✅ Despliegue preview de Vercel (solo PR)

### Verificación Manual de Calidad

```bash
# VALIDACIÓN PRE-COMMIT (OBLIGATORIO antes de cada commit)
npm run qa:precommit

# Si ✅ pasa, entonces:
git add .
git commit -m "tu mensaje"

# Verificaciones individuales
npm run qa:format  # Solo formato Prettier
npm run qa:lint    # Solo linting ESLint
npm run qa:test    # Todas las pruebas
npm run qa:build   # Builds de Docker

# Verificación completa
npm run qa:full
```

## Estrategia de Despliegue

### Arquitectura

```
┌─────────────────┐
│   Vercel        │
│  (Frontend)     │
│ tateti-interfaz │
│ + Services      │
│ (GameOptions,   │
│  PlayerService) │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐      ┌──────────────┐
│  Railway/Render │      │   Vercel     │
│   (Backend)     │ HTTP │ (Player Bots)│
│ tateti-arbitro  │←────→│   Bots 1-8   │
└─────────────────┘      └──────────────┘
```

### 🏗️ Refactorización de Servicios

**GameOptionsService**:
- Configuración centralizada de opciones de juego
- Validación robusta con valores por defecto
- Sistema de throttling inteligente
- Gestión de estado de juego

**PlayerService**:
- Descubrimiento dinámico de bots
- Generación inteligente de jugadores
- Sistema de fallbacks automático
- Validación de configuración

### 1. Despliegue del Frontend (Vercel)

**Despliegue Automático:**

- PR abierto → Despliegue preview creado
- PR merged a master → Despliegue de producción

**Configuración Manual (Primera Vez):**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login y vincular proyecto
cd public
vercel login
vercel link

# Obtener detalles del proyecto
vercel project ls
```

**Variables de Entorno (Dashboard de Vercel):**

```
VITE_API_URL=https://your-backend-url.railway.app
```

### 2. Despliegue del Backend (Plataforma de Contenedores)

**Plataformas Recomendadas:**

- **Railway.app**: Despliegue Docker más fácil
- **Render.com**: Tier gratuito disponible
- **DigitalOcean App Platform**: Más control

**Ejemplo de Railway:**

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login y desplegar
railway login
railway init
railway up
```

**Variables de Entorno:**

```
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
TRUST_PROXY=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
DOCKER_ENV=false
```

### 3. Despliegue de Bots de Jugadores (Vercel Serverless)

**Estructura para cada bot:**

```
/api
  /random-bot.js
  /algo-bot.js
```

**Configuración de Vercel (`vercel.json`):**

```json
{
  "functions": {
    "api/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

## Configuración de Secretos de GitHub

Agregar estos secretos a tu repositorio de GitHub:

1. `VERCEL_TOKEN`: Token de autenticación de Vercel
2. `VERCEL_ORG_ID`: ID de tu organización de Vercel
3. `VERCEL_PROJECT_ID`: ID de tu proyecto de Vercel

**Obtener Token de Vercel:**

```bash
vercel login
# Ir a https://vercel.com/account/tokens
```

**Obtener IDs de Org/Proyecto:**

```bash
cd public
vercel link
cat .vercel/project.json
```

## Flujo de Trabajo

### Flujo de Desarrollo

```bash
# 1. Crear rama de feature
git checkout -b feature/new-feature

# 2. Desarrollar código
# ... escribir código ...

# 3. VALIDACIÓN PRE-COMMIT (OBLIGATORIO)
npm run qa:precommit

# 4. Si ✅ pasa, hacer commit
git add .
git commit -m "feat: nueva funcionalidad"

# 5. Push a GitHub
git push origin feature/new-feature

# 6. Crear Pull Request
# GitHub Actions se ejecuta automáticamente
# Vercel crea despliegue preview

# 7. Revisar y mergear
# Profesor aprueba → Merge a master
# El despliegue de producción se activa automáticamente
```

### Flujo de Release

```bash
# 1. VALIDACIÓN PRE-COMMIT (OBLIGATORIO)
npm run qa:precommit

# 2. Si ✅ pasa, asegurar que todas las pruebas pasen
npm run qa:full

# 3. Build del frontend
cd client && npm run build && cd ..

# 4. Build de imágenes Docker
npm run docker:build:all

# 5. Tag de release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 6. Desplegar
# - Frontend: Auto-despliega vía GitHub Actions
# - Backend: Desplegar vía Railway/Render
# - Bots: Desplegar vía Vercel
```

## Pruebas en Producción

### Health Checks

```bash
# Frontend
curl https://your-app.vercel.app/health

# Backend
curl https://your-backend.railway.app/api/stream/status

# Bots
curl https://your-bots.vercel.app/api/random-bot/health
```

### Prueba de Integración

```bash
# Probar flujo completo
npm run docker:up:test
```

## Solución de Problemas

### Incompatibilidad de Versión de Node

```bash
# Arreglar versión local
nvm install 20
nvm use 20
rm -rf node_modules package-lock.json
npm install
```

### Hooks Pre-commit No Se Ejecutan

```bash
# Reinstalar hooks
rm -rf .husky
npm run prepare
```

### Fallo en Despliegue de Vercel

```bash
# Verificar build localmente
cd client && npm run build
# Verificar salida en ../public/
```

### Fallo en Build de Docker

```bash
# Limpiar caché de Docker
npm run docker:clean
# Rebuild del frontend
cd client && npm run build
# Intentar de nuevo
npm run docker:build:all
```

## Lista de Verificación de Seguridad

- [ ] Variables de entorno almacenadas en secretos de plataforma (nunca en código)
- [ ] Claves API rotadas regularmente
- [ ] CORS configurado solo para dominios de producción
- [ ] Rate limiting habilitado en todos los endpoints
- [ ] HTTPS forzado en todos los despliegues
- [ ] Headers de seguridad de Helmet.js activos
- [ ] Dependencias auditadas regularmente (`npm audit`)
- [ ] Imágenes Docker escaneadas para vulnerabilidades

## Mantenimiento

### Tareas Semanales

- [ ] Revisar logs de GitHub Actions
- [ ] Verificar dashboards de monitoreo de errores
- [ ] Revisar actualizaciones de dependencias (`npm outdated`)

### Tareas Mensuales

- [ ] Actualizar dependencias (`npm update`)
- [ ] Revisar y rotar claves API
- [ ] Auditar seguridad (`npm audit fix`)
- [ ] Revisar y optimizar imágenes Docker

### Por Release

- [ ] Ejecutar todas las puertas de calidad (`npm run qa:full`)
- [ ] Actualizar CHANGELOG.md
- [ ] Crear tag de git
- [ ] Verificar todos los despliegues
- [ ] Actualizar documentación si es necesario
