# Ta-Te-Ti Arbitro - Guía de Inicio Rápido

## 🎯 Referencia Completa de Scripts

Esta es la **única guía que necesitas** para trabajar con el sistema Ta-Te-Ti Arbitro.

---

## 📊 **TABLA COMPLETA DE SCRIPTS**

### **NIVEL 1: Acciones Atómicas (Bloques de Construcción)**

| Script | Descripción | Resultado |
|--------|-------------|-----------|
| `build:frontend` | Construir React → public/ | Archivos estáticos listos |
| `build:backend` | Construir imagen Docker backend | Imagen `tateti-arbitro:v1.0.0` |
| `build:backend:frontend` | Construir imagen Docker frontend (Nginx) | Imagen `tateti-interfaz:v1.0.0` |
| `build:all` | Construir todo | Todas las imágenes listas |
| `clean:frontend` | Eliminar public/* | Limpia frontend construido |
| `clean:docker` | Limpiar Docker (prune) | Libera espacio |
| `clean:all` | Detener + Limpiar todo | Sistema limpio |

---

### **NIVEL 2: Flujos de Desarrollo (Frontend FUERA)**

| Script | Descripción | Puertos | Uso |
|--------|-------------|---------|-----|
| `dev:frontend` | Solo servidor Vite | :5173 | Desarrollo frontend aislado |
| `dev:smoke` | Backend Docker + Frontend Vite | :4000 + :5173 | Desarrollo rápido (2 bots) |
| `dev:4player` | Backend + 4 bots + Frontend Vite | :4000 + :5173 | Desarrollo torneos 4P |
| `dev:8player` | Backend + 8 bots + Frontend Vite | :4000 + :5173 | Desarrollo torneos 8P |

**Ventajas:**
- ✅ Hot-reload instantáneo (< 100ms)
- ✅ Mejor experiencia de desarrollo
- ✅ Debugging más fácil
- ✅ No rebuilds de Docker

---

### **NIVEL 3: Flujos Docker (Frontend DENTRO)**

| Script | Descripción | Construcción | Uso |
|--------|-------------|--------------|-----|
| `docker:smoke` | Build frontend → Deploy 2 bots | Automática | Testing integración |
| `docker:4player` | Build frontend → Deploy 4 bots | Automática | Testing torneos 4P |
| `docker:8player` | Build frontend → Deploy 8 bots | Automática | Testing torneos 8P |
| `docker:prod` | Build all → Deploy producción | Completa | Deploy producción |
| `docker:down` | Detener todos los contenedores | - | Limpieza |

**Ventajas:**
- ✅ Deployment unificado
- ✅ Testing de integración real
- ✅ Production-ready
- ✅ Portable

---

### **NIVEL 4: Pipelines Completos (QA → Build → Deploy)**

| Script | Pipeline Completo | Pasos Ejecutados |
|--------|-------------------|------------------|
| `deploy:smoke` | QA → Build → Deploy smoke | 1. Format + Lint + Tests<br>2. Build frontend<br>3. Build Docker<br>4. Deploy 2 bots |
| `deploy:4player` | QA → Build → Deploy 4 jugadores | 1. Format + Lint + Tests<br>2. Build frontend<br>3. Build Docker<br>4. Deploy 4 bots |
| `deploy:8player` | QA → Build → Deploy 8 jugadores | 1. Format + Lint + Tests<br>2. Build frontend<br>3. Build Docker<br>4. Deploy 8 bots |
| `deploy:prod` | QA → Build → Deploy producción | 1. QA completo<br>2. Build all<br>3. Deploy stack completo |

**Ventajas:**
- ✅ **Un solo comando** para todo el flujo
- ✅ Validación automática antes de deploy
- ✅ Construcción garantizada
- ✅ Cero fricción

---

### **SCRIPTS DE CALIDAD (QA)**

| Script | Descripción | Cuándo Usar |
|--------|-------------|-------------|
| `qa:precommit` | Format + Lint + Tests (unit + client) | **OBLIGATORIO antes de cada commit** |
| `qa:full` | QA completo + Build all | Antes de release |
| `qa:format` | Solo verificación de formato | Debugging formato |
| `qa:lint` | Solo linting | Debugging linter |
| `test:unit` | Solo tests unitarios | Desarrollo TDD |
| `test:client` | Solo tests del cliente | Desarrollo frontend |

---

## 🚀 **GUÍA DE USO POR ESCENARIO**

### **Escenario 1: Desarrollo Diario (Recomendado)**

```bash
# 1. Iniciar entorno de desarrollo
npm run dev:4player

# 2. Abrir en navegador
# Frontend: http://localhost:5173 (hot-reload)
# Backend: http://localhost:4000

# 3. Desarrollar en client/src/
# Los cambios se reflejan INSTANTÁNEAMENTE

# 4. Antes de hacer commit (OBLIGATORIO)
npm run qa:precommit

# 5. Si pasa ✅, hacer commit
git add .
git commit -m "feat: nueva funcionalidad"

# 6. Detener entorno
npm run docker:down
```

---

### **Escenario 2: Testing de Integración**

```bash
# 1. Construir y desplegar stack completo
npm run docker:smoke

# 2. Verificar en navegador
# Todo en uno: http://localhost:4000

# 3. Verificar salud del sistema
curl http://localhost:4000/api/health
curl http://localhost:4000/api/bots/available

# 4. Detener
npm run docker:down
```

---

### **Escenario 3: Deploy a Producción**

```bash
# Opción A: Pipeline completo (UN SOLO COMANDO)
npm run deploy:prod

# Opción B: Control manual
npm run qa:full              # Validar todo
npm run build:all            # Construir todo
npm run docker:prod          # Desplegar

# Verificar
curl http://localhost/api/health
```

---

### **Escenario 4: Testing de Torneos**

```bash
# Torneo 4 jugadores
npm run dev:4player          # Desarrollo
# o
npm run docker:4player       # Docker completo
# o
npm run deploy:4player       # Pipeline completo

# Torneo 8 jugadores
npm run dev:8player          # Desarrollo
# o
npm run docker:8player       # Docker completo
# o
npm run deploy:8player       # Pipeline completo
```

---

## 🎯 **ESTRATEGIA DE FRONTEND**

### **¿Frontend DENTRO o FUERA de Docker?**

| Modo | Scripts | Cuándo Usar |
|------|---------|-------------|
| **FUERA (dev:*)** | `dev:smoke`, `dev:4player`, `dev:8player` | Desarrollo activo, hot-reload |
| **DENTRO (docker:*)** | `docker:smoke`, `docker:4player`, `docker:prod` | Testing integración, producción |

### **Comparación Detallada:**

**Frontend FUERA (Modo Desarrollo):**
```bash
npm run dev:4player
```
- ✅ Hot-reload instantáneo (< 100ms)
- ✅ Vite optimizado con HMR
- ✅ Chrome DevTools directo
- ✅ Cambios visibles al guardar
- 🌐 Frontend: http://localhost:5173
- 🌐 Backend: http://localhost:4000

**Frontend DENTRO (Modo Docker):**
```bash
npm run docker:4player
```
- ✅ Deployment unificado
- ✅ Nginx optimizado
- ✅ Production-ready
- ✅ Testing real de integración
- 🌐 Todo en uno: http://localhost:4000

---

## 🌐 **PUERTOS Y ACCESOS**

### **Modo Desarrollo (dev:*):**
| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend API | 4000 | http://localhost:4000 |
| Random Bot 1 | 3001 | http://localhost:3001 |
| Random Bot 2 | 3002 | http://localhost:3002 |
| Algo Bot 1 | 3003 | http://localhost:3003 |
| Algo Bot 2 | 3004 | http://localhost:3004 |
| ... hasta 8 bots | 3001-3008 | - |

### **Modo Docker (docker:*):**
| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend + Backend | 4000 | http://localhost:4000 |
| Bots | 3001-3008 | http://localhost:3001-3008 |

### **Modo Producción (docker:prod):**
| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Nginx) | 80 | http://localhost |
| Backend API | 4000 | http://localhost:4000 |
| Bots | 3001-3002 | - |

---

## 🔍 **VERIFICACIÓN RÁPIDA**

```bash
# Ver contenedores activos
docker ps

# Verificar salud del backend
curl http://localhost:4000/api/health

# Verificar bots disponibles
curl http://localhost:4000/api/bots/available

# Ver logs del backend
docker logs tateti-arbitrator-smoke

# Ver logs de un bot
docker logs tateti-random-bot-1
```

---

## 🧹 **LIMPIEZA DEL SISTEMA**

```bash
# Detener todos los contenedores
npm run docker:down

# Limpiar frontend construido
npm run clean:frontend

# Limpiar Docker (imágenes, volúmenes)
npm run clean:docker

# Limpieza completa (detener + limpiar)
npm run clean:all
```

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Frontend no se actualiza en Docker:**
```bash
npm run clean:frontend
npm run build:frontend
npm run docker:smoke
```

### **Puerto 5173 ocupado:**
Vite usa automáticamente el puerto 5174 si 5173 está ocupado.

### **Contenedores no inician:**
```bash
npm run clean:all
npm run build:all
npm run docker:smoke
```

### **Bots no se descubren:**
```bash
# Verificar backend
curl http://localhost:4000/api/health

# Verificar endpoint de bots
curl http://localhost:4000/api/bots/available

# Ver logs
docker logs tateti-arbitrator-smoke
```

### **Error de ES modules en Docker:**
Ya está corregido. El `index.js` ahora usa ES modules correctamente.

### **Tests fallan antes de commit:**
```bash
# Ver qué está fallando
npm run test:unit
npm run test:client

# Corregir y volver a intentar
npm run qa:precommit
```

---

## 📋 **CONFIGURACIONES DISPONIBLES**

| Configuración | Jugadores | Bots | Uso Principal |
|---------------|-----------|------|---------------|
| **smoke** | 2 | 2 Random | Testing rápido, desarrollo |
| **4player** | 4 | 2 Random + 2 Algoritmo | Torneos pequeños |
| **8player** | 8 | 4 Random + 4 Algoritmo | Torneos completos |
| **prod** | 2 + Frontend | 2 Random | Producción completa |

---

## ⚡ **FLUJO RECOMENDADO COMPLETO**

### **Día a Día (Desarrollo):**
```bash
# Mañana
npm run dev:4player              # Iniciar entorno

# Durante el día
# ... desarrollar en client/src/ ...
# Hot-reload automático ✅

# Antes de commit
npm run qa:precommit             # OBLIGATORIO
git add .
git commit -m "feat: ..."

# Fin del día
npm run docker:down              # Detener
```

### **Antes de Release:**
```bash
# Validación completa
npm run qa:full

# Testing de integración
npm run docker:smoke
npm run docker:4player
npm run docker:8player

# Si todo pasa ✅
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Deploy
npm run deploy:prod
```

---

## 🎓 **ARQUITECTURA DE SERVICIOS**

### **GameOptionsService:**
- Configuración centralizada de opciones de juego
- Validación robusta con valores por defecto
- Sistema de throttling inteligente
- Gestión de estado de juego

### **PlayerService:**
- Descubrimiento dinámico de bots
- Generación inteligente de jugadores
- Sistema de fallbacks automático
- Validación de configuración

---

## 📚 **RESUMEN DE COMANDOS ESENCIALES**

| Necesito... | Comando |
|-------------|---------|
| Desarrollar con hot-reload | `npm run dev:4player` |
| Probar en Docker | `npm run docker:smoke` |
| Deploy completo | `npm run deploy:prod` |
| Validar antes de commit | `npm run qa:precommit` |
| Construir frontend | `npm run build:frontend` |
| Construir todo | `npm run build:all` |
| Limpiar sistema | `npm run clean:all` |
| Ver logs | `docker logs tateti-arbitrator-smoke` |
| Verificar salud | `curl http://localhost:4000/api/health` |

---

## 🎯 **REGLAS DE ORO**

1. **SIEMPRE** ejecutar `npm run qa:precommit` antes de commit
2. **USAR** `dev:*` para desarrollo (hot-reload)
3. **USAR** `docker:*` para testing de integración
4. **USAR** `deploy:*` para pipelines completos
5. **LIMPIAR** con `npm run clean:all` si hay problemas

---

**¡Sistema de scripts completo y listo para usar!** 🚀

Para más detalles técnicos, consultar:
- **DOCKER.md** - Detalles de Docker y contenedores
- **AUTOMATIZACION.md** - CI/CD y pipelines de deployment