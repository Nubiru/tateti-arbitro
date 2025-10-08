# 🐳 Guía Completa de Docker - Ta-Te-Ti Arbitro v1.0.0

## 📋 Resumen de Configuraciones

| Configuración           | Archivo                           | Descripción                 | Bots                   | Imágenes Versionadas | Uso               |
| ----------------------- | --------------------------------- | --------------------------- | ---------------------- | -------------------- | ----------------- |
| **Pruebas de Humo**     | `docker-compose.test.yml`         | Backend + 4 bots            | 4 Random               | v1.0.0-test          | Testing rápido    |
| **Torneos 8 Jugadores** | `docker-compose.8player.yml`      | Backend + 8 bots            | 4 Random + 4 Algoritmo | v1.0.0               | Torneos completos |
| **Producción Completa** | `docker-compose.yml`              | Frontend + Backend + 8 bots | 8 Bots (4+4)           | v1.0.0               | Deploy completo   |
| **Backend Testing**     | `docker-compose.backend-test.yml` | Solo backend + 2 bots       | 2 Random               | v1.0.0-backend-test  | Testing backend   |

## 🏗️ Arquitectura de Servicios Refactorizada

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

## 🔍 Descubrimiento Dinámico de Bots

El sistema incluye **descubrimiento automático de bots** que detecta hasta 16 jugadores:

- **Docker API**: Consulta contenedores en ejecución
- **Health Checks**: Verifica estado de cada bot (2s timeout)
- **Metadata**: Obtiene información de `/info` endpoint
- **Cache**: Almacena resultados por 30 segundos
- **Frontend**: Pobla automáticamente lista de jugadores

---

## Node.js Version

This project uses Node.js 20 LTS in all environments:
- Local development: Use nvm to install Node 20
- Docker containers: node:20-alpine and node:20-slim
- CI/CD pipeline: Node 20 via GitHub Actions

## 🚀 Guía Paso a Paso

### **Paso 1: Preparación del Sistema**

```bash
# 1. Verificar que Docker esté instalado y funcionando
docker --version
docker-compose --version

# 2. Navegar al directorio del proyecto
cd tateti-arbitro

# 3. Instalar dependencias (si no está hecho)
npm install
cd client && npm install && cd ..

# 4. Configurar variables de entorno (OBLIGATORIO)
cp .env.example .env
# Editar .env con tus valores específicos
```

### **Paso 2: Construcción de Imágenes (OBLIGATORIO)**

```bash
# Construir TODAS las imágenes con versiones v1.0.0
npm run docker:build:all

# Verificar que las imágenes se construyeron correctamente
docker images | grep tateti

# Deberías ver:
# tateti-arbitro:v1.0.0
# tateti-interfaz:v1.0.0
# tateti-random-bot:v1.0.0
# tateti-algoritmo-bot:v1.0.0
```

### **Paso 3: Despliegue de Producción Completa**

#### **Opción A: Stack Completo (Frontend + Backend + 8 Bots)**

```bash
# Levantar stack completo de producción
docker-compose up

# Verificar que todos los servicios están funcionando
docker-compose ps

# Acceder a la aplicación:
# - Frontend: http://localhost
# - Backend API: http://localhost:4000
# - Bot Discovery: http://localhost:4000/api/bots/available
```

#### **Opción B: Pruebas de Humo (4 Jugadores)**

```bash
# Levantar stack de pruebas
docker-compose -f docker-compose.test.yml up

# Verificar health checks
curl http://localhost:4000/health

# Detener cuando termine
docker-compose -f docker-compose.test.yml down
```

#### **Opción C: Torneo de 8 Jugadores**

```bash
# Levantar torneo completo
docker-compose -f docker-compose.8player.yml up

# Verificar que todos los bots están saludables
curl http://localhost:4000/api/bots/available

# Detener cuando termine
docker-compose -f docker-compose.8player.yml down
```

### **Paso 4: Desarrollo Local (Solo Backend)**

```bash
# Solo backend con 2 bots para desarrollo
npm run dev:backend

# Luego en otra terminal, iniciar frontend:
npm run dev:frontend
```

#### **Verificar que Funciona**

```bash
# Verificar contenedores
docker ps

# Verificar backend
curl http://localhost:4000/api/health

# Verificar frontend
# Abrir navegador en http://localhost:5173
```

#### **Detener Servicios**

```bash
# Detener todo
Ctrl+C  # Si usaste dev:full
npm run docker:down:test  # Si usaste dev:backend
```

---

### **Paso 3: Desarrollo con 8 Jugadores (Torneos)**

#### **Opción A: Backend + Frontend en Paralelo (Recomendado)**

```bash
# Iniciar backend (8 bots) + frontend automáticamente
npm run dev:full:8player

# El sistema iniciará:
# - Backend en Docker (puerto 4000)
# - 4 Random Bots (puertos 3001-3004)
# - 4 Algorithm Bots (puertos 3005-3008)
# - Frontend en desarrollo (puerto 5173)
```

#### **Opción B: Solo Backend (8 bots)**

```bash
# Solo backend con 8 bots
npm run dev:backend:8player

# Luego en otra terminal, iniciar frontend:
npm run dev:frontend
```

#### **Verificar que Funciona**

```bash
# Verificar todos los contenedores (debería haber 9)
docker ps

# Verificar backend
curl http://localhost:4000/api/health

# Verificar bots individuales
curl http://localhost:3001/health  # RandomBot1
curl http://localhost:3005/health  # AlgoBot1

# Verificar frontend
# Abrir navegador en http://localhost:5173
# Ir a ConfigScreen y seleccionar "Torneo" con 8 jugadores
```

#### **Detener Servicios**

```bash
# Detener todo
Ctrl+C  # Si usaste dev:full:8player
npm run docker:down:8player  # Si usaste dev:backend:8player
```

---

### **Paso 4: Producción Completa**

```bash
# Construir y ejecutar todo (frontend + backend + 4 bots)
npm run docker:up

# Verificar
docker ps
curl http://localhost:4000/api/health

# Detener
npm run docker:down
```

---

## 🔧 Comandos de Gestión

### **Ver Estado del Sistema**

```bash
# Ver contenedores activos
docker ps

# Ver logs de un contenedor específico
docker logs tateti-arbitrator-8player
docker logs tateti-random-bot-1
docker logs tateti-algo-bot-1

# Ver logs de todos los servicios
docker-compose -f docker-compose.8player.yml logs
```

### **Reiniciar Servicios**

```bash
# Reiniciar solo el backend
docker restart tateti-arbitrator-8player

# Reiniciar todos los bots
docker-compose -f docker-compose.8player.yml restart

# Reconstruir y reiniciar todo
npm run dev:backend:8player
```

### **Limpiar Sistema**

```bash
# Detener y eliminar contenedores
npm run docker:down:8player

# Limpiar imágenes y volúmenes no utilizados
npm run docker:clean

# Limpiar todo (¡CUIDADO!)
docker system prune -a --volumes -f
```

---

## 🐛 Solución de Problemas

### **Error: Puerto ya en uso**

```bash
# Ver qué está usando el puerto
netstat -ano | findstr :4000  # Windows
lsof -i :4000                 # Linux/Mac

# Detener proceso o cambiar puerto en docker-compose.yml
```

### **Error: Contenedor no inicia**

```bash
# Ver logs detallados
docker logs tateti-arbitrator-8player

# Reconstruir imagen
docker-compose -f docker-compose.8player.yml build --no-cache

# Verificar espacio en disco
docker system df
```

### **Error: Bots no responden**

```bash
# Verificar que los bots estén corriendo
docker ps | grep bot

# Verificar conectividad de red
docker network ls
docker network inspect tateti-arbitro_tateti-network

# Reiniciar bots específicos
docker restart tateti-random-bot-1
```

### **Error: Frontend no conecta al backend**

```bash
# Verificar que el backend esté en puerto 4000
curl http://localhost:4000/api/health

# Verificar configuración de proxy en client/vite.config.js
# Debe apuntar a http://127.0.0.1:4000
```

---

## 📊 Monitoreo y Logs

### **Ver Logs en Tiempo Real**

```bash
# Logs de todos los servicios
docker-compose -f docker-compose.8player.yml logs -f

# Logs de un servicio específico
docker logs -f tateti-arbitrator-8player
docker logs -f tateti-random-bot-1
```

### **Métricas del Sistema**

```bash
# Estado de salud del backend
curl http://localhost:4000/api/health

# Estado detallado
curl http://localhost:4000/api/health/detailed

# Verificar conexiones SSE
curl -N http://localhost:4000/api/stream
```

---

## 🎯 Casos de Uso Comunes

### **1. Desarrollo de Nuevas Funcionalidades**

```bash
# Usar configuración de 2 jugadores para desarrollo rápido
npm run dev:full
```

### **2. Testing de Torneos**

```bash
# Usar configuración de 8 jugadores
npm run dev:full:8player
```

### **3. Demostración al Profesor**

```bash
# Usar configuración de producción
npm run docker:up
```

### **4. Debugging de Problemas**

```bash
# Solo backend para debugging
npm run dev:backend:8player

# Ver logs específicos
docker logs -f tateti-arbitrator-8player
```

---

## 🔍 Bot Discovery - Nueva Funcionalidad

### **¿Qué es Bot Discovery?**

El sistema ahora incluye **descubrimiento automático de bots** que permite:

- **Detección automática** de bots disponibles en el sistema
- **Health checking** en tiempo real de todos los bots
- **Auto-población** de la lista de jugadores en la interfaz
- **Estado de conexión** visual para cada bot (verde=saludable, rojo=offline)

### **API de Bot Discovery**

```bash
# Obtener lista de bots disponibles
curl http://localhost:4000/api/bots/available

# Respuesta esperada:
{
  "bots": [
    {
      "name": "RandomBot1",
      "port": 3001,
      "status": "healthy",
      "type": "random",
      "capabilities": ["3x3", "5x5"],
      "lastSeen": "2025-10-06T15:30:00.000Z",
      "isHuman": false
    },
    // ... más bots
  ],
  "total": 8,
  "healthy": 8,
  "timestamp": "2025-10-06T15:30:00.000Z"
}
```

### **Configuración de Bots**

El sistema soporta hasta **8 bots** con la siguiente configuración:

| Bot Name   | Puerto | Tipo      | Capacidades | Servicio Docker |
| ---------- | ------ | --------- | ----------- | --------------- |
| RandomBot1 | 3001   | random    | 3x3, 5x5    | random-bot-1    |
| RandomBot2 | 3002   | random    | 3x3, 5x5    | random-bot-2    |
| RandomBot3 | 3003   | random    | 3x3, 5x5    | random-bot-3    |
| RandomBot4 | 3004   | random    | 3x3, 5x5    | random-bot-4    |
| AlgoBot1   | 3005   | algorithm | 3x3, 5x5    | algo-bot-1      |
| AlgoBot2   | 3006   | algorithm | 3x3, 5x5    | algo-bot-2      |
| AlgoBot3   | 3007   | algorithm | 3x3, 5x5    | algo-bot-3      |
| AlgoBot4   | 3008   | algorithm | 3x3, 5x5    | algo-bot-4      |

### **Verificación de Bot Discovery**

```bash
# 1. Verificar que el backend esté funcionando
curl http://localhost:4000/health

# 2. Verificar bot discovery API
curl http://localhost:4000/api/bots/available

# 3. Verificar bots individuales
curl http://localhost:3001/health  # RandomBot1
curl http://localhost:3005/health  # AlgoBot1

# 4. Verificar en la interfaz web
# Abrir http://localhost y verificar que se muestran los bots descubiertos
```

---

## ⚠️ Notas Importantes

1. **Frontend SÍ está en Docker** - Stack completo containerizado con Nginx
2. **Puertos 3001-3008** - Reservados para bots, no usar para otras aplicaciones
3. **Puerto 4000** - Backend principal, debe estar libre
4. **Puerto 80** - Frontend de producción (Nginx), se inicia automáticamente
5. **Red Docker** - Los contenedores se comunican por nombres de servicio, no localhost
6. **Health Checks** - Todos los servicios tienen verificaciones de salud automáticas
7. **Bot Discovery** - Sistema automático de descubrimiento y health checking
8. **Versionado** - Todas las imágenes están versionadas con v1.0.0
9. **🏗️ Servicios Refactorizados** - GameOptionsService y PlayerService incluidos en build
10. **✅ 100% Tests Passing** - Cobertura completa de pruebas unitarias

---

## 🆘 Soporte

Si encuentras problemas:

1. **Verificar logs**: `docker logs <nombre-contenedor>`
2. **Verificar puertos**: `netstat -ano | findstr :4000`
3. **Reiniciar servicios**: `npm run docker:down:8player && npm run dev:full:8player`
4. **Limpiar sistema**: `npm run docker:clean`
5. **Verificar espacio**: `docker system df`

---

**¡Listo! Ahora puedes usar el sistema de Ta-Te-Ti Arbitro con Docker de manera eficiente.**
