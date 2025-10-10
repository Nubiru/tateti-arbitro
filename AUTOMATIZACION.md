# Automatización y Despliegue

Sistema de automatización con puertas de calidad y despliegue continuo.

## 🎯 Gestión de Versiones

**Versión Estándar**: Node.js 20 LTS

```bash
# Instalar con nvm
nvm install 20
nvm use 20

# Verificar
node --version  # v20.x.x
```

## 🚦 Puertas de Calidad

### Pre-commit (Local)

Ejecuta automáticamente antes de cada commit:

```bash
npm run qa:precommit

# Valida:
# - Prettier (formato)
# - ESLint (linting)
# - Tests unitarios (backend + frontend)
```

### Pipeline CI/CD (GitHub Actions)

Ejecuta en PRs y merges:

1. Formato y linting
2. Tests con cobertura
3. Build de frontend
4. Build de Docker
5. Deploy preview (Vercel)

## 🚀 Estrategia de Despliegue

### Arquitectura

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

### Frontend (Vercel)

**Despliegue Automático:**
- PR → Preview deployment
- Merge a master → Producción

**Variables de Entorno:**
```
VITE_API_URL=https://your-backend.railway.app
```

### Backend (Railway/Render)

**Variables de Entorno:**
```
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
TRUST_PROXY=true
DOCKER_ENV=false
```

### Bots (Vercel Serverless)

Estructura para cada bot:
```
/api
  /random-bot.js
  /smart-bot.js
```

## 🔄 Flujo de Trabajo

### Desarrollo

```bash
# 1. Crear rama
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar con hot-reload
npm run dev:4player

# 3. Validar (OBLIGATORIO)
npm run qa:precommit

# 4. Commit
git add .
git commit -m "feat: nueva funcionalidad"

# 5. Testing de integración
npm run docker:smoke

# 6. Push
git push origin feature/nueva-funcionalidad
```

### Release

```bash
# Opción 1: Pipeline completo
npm run deploy:prod

# Opción 2: Manual
npm run qa:full
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
npm run docker:prod
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

---

**Última actualización**: 2025-10-10
