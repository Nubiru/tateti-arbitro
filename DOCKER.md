# 🐳 Guía Docker - Ta-Te-Ti Arbitro v1.0.0

## 📋 Resumen

Sistema containerizado con Docker para ejecutar el árbitro de Ta-Te-Ti con diferentes configuraciones de jugadores.

**Node.js 20 LTS** en todos los contenedores.

---

## 🎯 **ESTRATEGIA DE FRONTEND**

### **Modo Desarrollo (Frontend FUERA de Docker):**
```bash
npm run dev:smoke     # Backend en Docker, Frontend en Vite
npm run dev:4player   # Backend + 4 bots, Frontend en Vite
npm run dev:8player   # Backend + 8 bots, Frontend en Vite
```
- ✅ **Hot-reload instantáneo** - Cambios reflejados al instante
- ✅ **Mejor DX** - Debugging más fácil con Vite
- ✅ **Más rápido** - No rebuilds de Docker
- 🌐 **Acceso**: http://localhost:5173

### **Modo Producción (Frontend DENTRO de Docker):**
```bash
npm run docker:smoke   # Todo containerizado
npm run docker:4player # Todo containerizado
npm run docker:8player # Todo containerizado
npm run docker:prod    # Stack completo con Nginx
```
- ✅ **Deployment unificado** - Una sola unidad
- ✅ **Optimizado** - Nginx sirve assets estáticos
- ✅ **Production-ready** - Configuración de seguridad
- 🌐 **Acceso**: http://localhost:4000 (o :80 en prod)

---

## 🚀 Configuraciones Disponibles

| Configuración | Comando Dev | Comando Docker | Jugadores | Uso |
|--------------|-------------|----------------|-----------|-----|
| **Pruebas Rápidas** | `dev:smoke` | `docker:smoke` | 2 bots | Testing rápido |
| **Torneo 4 Jugadores** | `dev:4player` | `docker:4player` | 4 bots | Torneos pequeños |
| **Torneo 8 Jugadores** | `dev:8player` | `docker:8player` | 8 bots | Torneos completos |
| **Producción** | - | `docker:prod` | Frontend + Backend + 2 | Deploy completo |

---

## 📦 Prerequisitos

```bash
# Verificar Docker instalado
docker --version
docker-compose --version

# Navegar al proyecto
cd tateti-arbitro

# Instalar dependencias
npm install
cd client && npm install && cd ..
```

---

## 🔨 Construcción de Imágenes

### Construcción Rápida (Recomendado)

```bash
# Construir todas las imágenes
npm run docker:build:all
```

### Construcción Manual

```bash
# Solo backend
npm run docker:build

# Solo frontend
npm run docker:build:frontend
```

### Verificar Imágenes

```bash
docker images | grep tateti

# Deberías ver:
# tateti-arbitro:v1.0.0
# tateti-interfaz:v1.0.0
# tateti-random-bot:v1.0.0
```

---

## 🎮 Uso

### **OPCIÓN A: Desarrollo (Frontend FUERA)**

Mejor experiencia con hot-reload instantáneo.

```bash
# 1. Pruebas Rápidas (2 Jugadores)
npm run dev:smoke

# 2. Torneo de 4 Jugadores
npm run dev:4player

# 3. Torneo de 8 Jugadores
npm run dev:8player

# Verificar
curl http://localhost:4000/api/health
curl http://localhost:4000/api/bots/available

# Acceder
# Frontend: http://localhost:5173 (Vite)
# Backend: http://localhost:4000

# Detener
npm run docker:down
```

---

### **OPCIÓN B: Docker Completo (Frontend DENTRO)**

Para testing de integración y pre-producción.

```bash
# 1. Pruebas Rápidas (2 Jugadores)
npm run docker:smoke
# ✅ Construye frontend automáticamente
# ✅ Inicia backend + 2 bots

# 2. Torneo de 4 Jugadores
npm run docker:4player
# ✅ Construye frontend automáticamente
# ✅ Inicia backend + 4 bots

# 3. Torneo de 8 Jugadores
npm run docker:8player
# ✅ Construye frontend automáticamente
# ✅ Inicia backend + 8 bots

# 4. Producción Completa
npm run docker:prod
# ✅ Construye frontend automáticamente
# ✅ Construye imagen de Nginx
# ✅ Inicia stack completo

# Verificar
curl http://localhost:4000/api/health
curl http://localhost:4000/api/bots/available

# Acceder
# Frontend + Backend: http://localhost:4000
# (Producción: http://localhost:80)

# Detener
npm run docker:down
```

---

### **OPCIÓN C: Pipeline Completo (QA → Build → Deploy)**

Un solo comando para todo el flujo.

```bash
# Pipeline completo: QA → Build → Deploy smoke
npm run deploy:smoke

# Pipeline completo: QA → Build → Deploy 4 jugadores
npm run deploy:4player

# Pipeline completo: QA → Build → Deploy 8 jugadores
npm run deploy:8player

# Pipeline completo: QA → Build → Deploy producción
npm run deploy:prod

# Cada comando ejecuta:
# 1. ✅ qa:precommit (format + lint + tests)
# 2. ✅ build:frontend (React → public/)
# 3. ✅ docker build (imágenes)
# 4. ✅ docker-compose up (deploy)
```

**Servicios por Configuración:**

| Config | Backend | Bots | Frontend |
|--------|---------|------|----------|
| smoke | :4000 | 3001-3002 | :5173 (dev) / :4000 (docker) |
| 4player | :4000 | 3001-3004 | :5173 (dev) / :4000 (docker) |
| 8player | :4000 | 3001-3008 | :5173 (dev) / :4000 (docker) |
| prod | :4000 | 3001-3002 | :80 (Nginx) |

---

## 🔧 Comandos Útiles

### Ver Estado

```bash
# Contenedores activos
docker ps

# Logs de todos los servicios
docker-compose -f docker-compose.smoke.yml logs

# Logs de un servicio específico
docker logs tateti-arbitrator-smoke
docker logs tateti-random-bot-1
```

### Reiniciar Servicios

```bash
# Reiniciar backend
docker restart tateti-arbitrator-smoke

# Reiniciar un bot
docker restart tateti-random-bot-1
```

### Limpieza

```bash
# Detener todos los contenedores
npm run docker:down

# Limpiar recursos no utilizados
npm run docker:clean

# Limpiar todo (¡CUIDADO!)
docker system prune -a --volumes -f
```

---

## 🐛 Solución de Problemas

### Puerto ya en uso

```bash
# Ver qué está usando el puerto
netstat -ano | findstr :4000  # Windows
lsof -i :4000                 # Linux/Mac

# Cambiar puerto en docker-compose.yml
ports:
  - "4001:4000"  # Usar 4001 en lugar de 4000
```

### Contenedor no inicia

```bash
# Ver logs detallados
docker logs tateti-arbitrator-smoke

# Reconstruir imagen sin caché
docker-compose -f docker-compose.smoke.yml build --no-cache

# Verificar espacio en disco
docker system df
```

### Bots no responden

```bash
# Verificar que estén corriendo
docker ps | grep bot

# Verificar conectividad
docker network inspect tateti-arbitro_tateti-network

# Reiniciar bot específico
docker restart tateti-random-bot-1
```

### Frontend no conecta al backend

```bash
# Verificar backend
curl http://localhost:4000/api/health

# Verificar configuración de proxy en client/vite.config.js
# Debe apuntar a http://127.0.0.1:4000
```

---

## 📊 Verificación de Salud

```bash
# Backend
curl http://localhost:4000/api/health

# Detallado
curl http://localhost:4000/api/health/detailed

# Bots disponibles
curl http://localhost:4000/api/bots/available

# SSE Stream
curl -N http://localhost:4000/api/stream
```

---

## 🎯 Casos de Uso

### Desarrollo de Funcionalidades

```bash
# Usar configuración de 2 jugadores
npm run docker:smoke
```

### Testing de Torneos

```bash
# Usar configuración de 4 u 8 jugadores
npm run docker:4player
npm run docker:8player
```

### Demostración

```bash
# Usar stack completo de producción
npm run docker:prod
```

---

## ⚠️ Notas Importantes

1. **Node.js 20 LTS** - Versión unificada en todos los contenedores
2. **Puertos Reservados:**
   - `4000` - Backend
   - `80` - Frontend (producción)
   - `3001-3008` - Bots
3. **Red Docker** - Los contenedores se comunican por nombres de servicio
4. **Health Checks** - Todos los servicios tienen verificaciones automáticas
5. **Imágenes Versionadas** - Todas usan tag `v1.0.0`
6. **Frontend Pre-construido** - Se construye localmente antes de Docker

---

## 🆘 Soporte

Si encuentras problemas:

1. **Verificar logs**: `docker logs <nombre-contenedor>`
2. **Verificar puertos**: `netstat -ano | findstr :4000`
3. **Reiniciar**: `npm run docker:down && npm run docker:smoke`
4. **Limpiar**: `npm run docker:clean`
5. **Verificar espacio**: `docker system df`

---

**¡Listo! Sistema Docker configurado y listo para usar.**