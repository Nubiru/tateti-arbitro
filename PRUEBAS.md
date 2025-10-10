# Plan de Pruebas

Instrucciones para probar diferentes configuraciones del sistema.

## 📋 Prerequisitos

- Docker instalado
- Node.js 20 LTS
- Dependencias instaladas (`npm install`)

## 🔍 Validación Pre-commit

```bash
# OBLIGATORIO antes de cada commit
npm run qa:precommit

# Si ✅ pasa:
git add .
git commit -m "mensaje"
```

## 🎮 Configuraciones

### Modo Individual (2 Jugadores)

**Propósito**: Juego 1v1 básico

```bash
# Iniciar
npm run dev:smoke

# Acceso
# http://localhost:5173

# Verificar
curl http://localhost:4000/api/health
curl http://localhost:4000/api/bots/available
```

**Verificar:**
- [ ] 2 bots descubiertos automáticamente
- [ ] Partida inicia correctamente
- [ ] Juego se completa con ganador

---

### Torneo 4 Jugadores

**Propósito**: Torneo con 4 jugadores

```bash
# Iniciar
npm run dev:4player

# Verificar
curl http://localhost:4000/api/bots/available
```

**Verificar:**
- [ ] 4 bots descubiertos
- [ ] Bracket mostrado
- [ ] Todas las partidas completadas
- [ ] Ganador determinado

---

### Torneo 8 Jugadores

**Propósito**: Torneo grande

```bash
# Iniciar
npm run dev:8player
```

**Verificar:**
- [ ] 8 bots descubiertos
- [ ] Bracket completo
- [ ] Todas las partidas finalizadas

---

## 🔍 Pruebas de Descubrimiento

### API de Descubrimiento

```bash
# Backend
curl http://localhost:4000/api/health

# Bots
curl http://localhost:4000/api/bots/available

# Respuesta esperada:
# {
#   "bots": [...],
#   "total": 4,
#   "healthy": 4
# }
```

### Health Checks

```bash
# Verificar bots
curl http://localhost:3001/health  # RandomBot1
curl http://localhost:3003/health  # SmartBot1

# Metadata
curl http://localhost:3003/info
```

### Comunicación HTTP

```bash
# Probar movimiento
curl "http://localhost:3003/move?board=[0,0,0,0,0,0,0,0,0]"

# Respuesta esperada:
# {"move":4}
```

---

## 🏗️ Servicios

### GameOptionsService

```bash
npm test -- --testPathPattern="GameOptionsService"
npm run test:coverage -- --testPathPattern="GameOptionsService"
```

### PlayerService

```bash
npm test -- --testPathPattern="PlayerService"
npm run test:coverage -- --testPathPattern="PlayerService"
```

### Integración

```bash
npm run test:integration -- --testPathPattern="services"
```

---

## ⚡ Comandos Rápidos

```bash
# Un comando
npm run test:2player
npm run test:4player
npm run test:8player

# Desarrollo completo
npm run dev:full
npm run dev:full:4player
npm run dev:full:8player
```

---

## 🐛 Debug

```bash
# Contenedores
docker ps

# Logs
docker logs tateti-arbitrator-smoke
docker logs tateti-smart-bot-1

# Endpoints
curl http://localhost:4000/api/stream/status
curl http://localhost:4000/api/bots/available
```

## 🧹 Limpieza

```bash
# Detener
npm run docker:down

# Limpiar
npm run clean:all
npm run docker:clean
```

---

## ✅ Criterios de Éxito

### Modo Individual
- [ ] 2 jugadores generados
- [ ] Juego inicia
- [ ] Juego completa con ganador
- [ ] GameOptionsService valida configuración
- [ ] PlayerService genera jugadores

### Torneo 4 Jugadores
- [ ] 4 jugadores descubiertos
- [ ] Bracket mostrado
- [ ] Partidas completadas
- [ ] Ganador determinado
- [ ] Servicios manejan configuración

### Torneo 8 Jugadores
- [ ] 8 jugadores descubiertos
- [ ] Bracket completo
- [ ] Todas las partidas finalizadas
- [ ] Servicios validan configuración
- [ ] Fallbacks funcionan

### Servicios
- [ ] GameOptionsService: 100% cobertura
- [ ] PlayerService: 100% cobertura
- [ ] Integración funciona
- [ ] Validaciones correctas
- [ ] Fallbacks operan

---

## 📝 Notas

- Puertos: Backend (4000), Frontend (5173), Bots (3001-3008)
- Proxy configurado en `client/vite.config.js`
- Todas las configuraciones usan mismo frontend

---

**Última actualización**: 2025-10-10
