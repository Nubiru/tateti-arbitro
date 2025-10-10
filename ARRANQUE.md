# Guía de Comandos

Referencia completa de scripts para trabajar con el sistema Ta-Te-Ti Arbitro.

## 📋 Comandos Esenciales

| Necesito... | Comando |
|-------------|---------|
| Desarrollar con hot-reload | `npm run dev:4player` |
| Probar en Docker | `npm run docker:smoke` |
| Validar antes de commit | `npm run qa:precommit` |
| Deploy completo | `npm run deploy:prod` |
| Limpiar sistema | `npm run clean:all` |

## 🚀 Desarrollo

### Modo Desarrollo (Hot-reload)

```bash
# Backend en Docker, Frontend en Vite
npm run dev:smoke     # 2 bots
npm run dev:4player   # 4 bots
npm run dev:8player   # 8 bots

# Acceso:
# - Frontend: http://localhost:5173 (Vite con HMR)
# - Backend: http://localhost:4000
```

**Ventajas:**
- ✅ Hot-reload instantáneo (<100ms)
- ✅ Debugging directo con DevTools
- ✅ Sin rebuilds de Docker

### Modo Docker (Integración)

```bash
# Todo containerizado
npm run docker:smoke     # 2 bots
npm run docker:4player   # 4 bots
npm run docker:8player   # 8 bots
npm run docker:prod      # Stack completo con Nginx

# Acceso:
# - Todo en uno: http://localhost:4000
```

**Ventajas:**
- ✅ Ambiente production-ready
- ✅ Testing de integración real
- ✅ Deployment unificado

## 🔨 Build

```bash
# Construir todas las imágenes
npm run build:all

# Construir individualmente
npm run build:frontend   # React → public/
npm run build:backend    # Imagen Docker backend
```

## 🧪 Calidad

```bash
# Validación pre-commit (OBLIGATORIO)
npm run qa:precommit

# QA completo
npm run qa:full

# Tests individuales
npm run test:unit        # Tests unitarios
npm run test:client      # Tests del cliente
```

## 🚢 Deploy

```bash
# Pipeline completo (QA → Build → Deploy)
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

## 🧹 Limpieza

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

## 🔍 Verificación

```bash
# Estado de contenedores
docker ps

# Salud del backend
curl http://localhost:4000/api/health

# Bots disponibles
curl http://localhost:4000/api/bots/available

# Logs
docker logs tateti-arbitrator-smoke
docker logs tateti-smart-bot-1
```

## 🌐 Puertos

### Modo Desarrollo (dev:*)

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend | 4000 | http://localhost:4000 |
| Bots | 3001-3008 | http://localhost:3001+ |

### Modo Docker (docker:*)

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend + Backend | 4000 | http://localhost:4000 |
| Bots | 3001-3008 | http://localhost:3001+ |

### Modo Producción (docker:prod)

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Nginx) | 80 | http://localhost |
| Backend | 4000 | http://localhost:4000 |

## 💡 Flujo Diario

```bash
# 1. Iniciar ambiente
npm run dev:4player

# 2. Desarrollar (cambios reflejados automáticamente)

# 3. Validar antes de commit
npm run qa:precommit

# 4. Commit
git add .
git commit -m "feat: nueva funcionalidad"

# 5. Detener
npm run docker:down
```

## 🎯 Reglas de Oro

1. **SIEMPRE** ejecutar `npm run qa:precommit` antes de commit
2. **USAR** `dev:*` para desarrollo (hot-reload)
3. **USAR** `docker:*` para testing de integración
4. **USAR** `deploy:*` para pipelines completos

---

**Última actualización**: 2025-10-10
