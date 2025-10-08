# Ta-Te-Ti Arbitro - Plan de Pruebas

## Resumen
Este documento proporciona instrucciones claras y paso a paso para probar diferentes configuraciones de juego y escenarios, incluyendo el **sistema de descubrimiento dinámico de bots** y la nueva **arquitectura de servicios refactorizada** con GameOptionsService y PlayerService.

## Prerrequisitos
- Docker instalado y ejecutándose
- Node.js 20 LTS instalado
- Todas las dependencias instaladas (`npm install`)

## 🔍 Validación Pre-commit (OBLIGATORIO)

```bash
# Antes de cada commit - valida que pasarán los hooks
npm run qa:precommit

# Si ✅ pasa, entonces:
git add .
git commit -m "tu mensaje"
```

## Configuraciones de Prueba

### 1. Modo Individual (2 Jugadores)
**Propósito**: Probar el juego básico 1v1 entre 2 bots

**Configuración**:
```bash
# Iniciar backend con 2 bots aleatorios
npm run dev:backend

# En otra terminal, iniciar frontend
npm run dev:frontend
```

**Pasos de Prueba**:
1. Abrir http://localhost:3000
2. Seleccionar modo "Individual"
3. **Verificar descubrimiento dinámico**: Deben aparecer 2 bots automáticamente (AlgoBot1, AlgoBot2)
4. Hacer clic en "Iniciar Partida" (Start Match)
5. Verificar que el juego se ejecuta y completa
6. **Verificar comunicación HTTP**: El arbitro envía `board` al bot, bot retorna `move`

**Resultado Esperado**: El juego se ejecuta exitosamente con 2 bots descubiertos dinámicamente

---

### 2. Torneo de 4 Jugadores
**Propósito**: Probar modo torneo con 4 jugadores (2 aleatorios + 2 bots de algoritmo)

**Configuración**:
```bash
# Iniciar backend con 4 jugadores
npm run dev:backend:4player

# En otra terminal, iniciar frontend
npm run dev:frontend
```

**Pasos de Prueba**:
1. Abrir http://localhost:3000
2. Seleccionar modo "Torneo" (Tournament)
3. Seleccionar "4 jugadores"
4. **Verificar descubrimiento dinámico**: Deben aparecer 4 bots automáticamente (2 Random + 2 Algoritmo)
5. Hacer clic en "Iniciar Torneo" (Start Tournament)
6. Verificar que se ejecuta el bracket del torneo y las partidas
7. **Verificar comunicación HTTP**: Cada bot recibe `board` y retorna `move`

**Resultado Esperado**: El torneo se ejecuta con 4 jugadores descubiertos dinámicamente en formato de bracket

---

### 3. Torneo de 8 Jugadores
**Propósito**: Probar torneo grande con 8 jugadores (4 aleatorios + 4 bots de algoritmo)

**Configuración**:
```bash
# Iniciar backend con 8 jugadores
npm run dev:backend:8player

# En otra terminal, iniciar frontend
npm run dev:frontend
```

**Pasos de Prueba**:
1. Abrir http://localhost:3000
2. Seleccionar modo "Torneo" (Tournament)
3. Seleccionar "8 jugadores"
4. **Verificar descubrimiento dinámico**: Deben aparecer 8 bots automáticamente (4 Random + 4 Algoritmo)
5. Hacer clic en "Iniciar Torneo" (Start Tournament)
6. Verificar que se ejecuta el bracket del torneo y las partidas
7. **Verificar comunicación HTTP**: Cada bot recibe `board` y retorna `move`

**Resultado Esperado**: El torneo se ejecuta con 8 jugadores descubiertos dinámicamente en formato de bracket

---

## 🔍 Pruebas de Descubrimiento Dinámico

### Verificar API de Descubrimiento
```bash
# Verificar que el backend esté funcionando
curl http://localhost:4000/api/health

# Verificar endpoint de descubrimiento
curl http://localhost:4000/api/bots/available

# Respuesta esperada:
# {
#   "bots": [
#     {
#       "name": "RandomBot1",
#       "port": 3001,
#       "status": "healthy",
#       "type": "random",
#       "capabilities": ["3x3", "5x5"]
#     }
#   ],
#   "total": 4,
#   "healthy": 4
# }
```

### Verificar Health Checks de Bots
```bash
# Verificar bots individuales
curl http://localhost:3001/health  # RandomBot1
curl http://localhost:3002/health  # RandomBot2
curl http://localhost:3003/health  # AlgoBot1
curl http://localhost:3004/health  # AlgoBot2

# Verificar metadata de bots
curl http://localhost:3001/info  # RandomBot1 info
curl http://localhost:3003/info  # AlgoBot1 info
```

### Verificar Comunicación HTTP
```bash
# Probar movimiento de bot
curl "http://localhost:3001/move?board=[null,null,null,null,null,null,null,null,null]"

# Respuesta esperada:
# {
#   "movimiento": 4,
#   "timestamp": "2025-10-07T10:00:00.000Z"
# }
```

---

## 🏗️ Pruebas de Servicios Refactorizados

### GameOptionsService Tests
```bash
# Pruebas unitarias de GameOptionsService
npm test -- --testPathPattern="GameOptionsService"

# Verificar cobertura de pruebas
npm run test:coverage -- --testPathPattern="GameOptionsService"
```

### PlayerService Tests
```bash
# Pruebas unitarias de PlayerService
npm test -- --testPathPattern="PlayerService"

# Verificar cobertura de pruebas
npm run test:coverage -- --testPathPattern="PlayerService"
```

### Pruebas de Integración de Servicios
```bash
# Pruebas de integración completa
npm run test:integration -- --testPathPattern="services"

# Pruebas de servicios con mocks
npm test -- --testPathPattern="services" --verbose
```

## Comandos de Prueba Rápida

### Pruebas de Un Comando
```bash
# Probar modo individual de 2 jugadores
npm run test:2player

# Probar torneo de 4 jugadores
npm run test:4player

# Probar torneo de 8 jugadores
npm run test:8player
```

### Modo de Desarrollo
```bash
# Desarrollo completo con 2 jugadores
npm run dev:full

# Desarrollo completo con 4 jugadores
npm run dev:full:4player

# Desarrollo completo con 8 jugadores
npm run dev:full:8player
```

## Solución de Problemas

### Problemas Comunes

1. **Error 500 Internal Server Error**
   - **Causa**: Backend no ejecutándose o problemas con endpoints de API
   - **Solución**: Verificar `docker ps` y reiniciar backend
   - **Estado**: ✅ **SOLUCIONADO** - Bug de timestamp corregido

2. **Connection Refused**
   - **Causa**: Frontend no puede alcanzar backend
   - **Solución**: Verificar configuración de proxy en `client/vite.config.js`

3. **No Players Discovered (No se Descubren Jugadores)**
   - **Causa**: Endpoint de descubrimiento de bots no funciona
   - **Solución**: Verificar endpoint `/api/bots/available`

4. **Invalid Move Errors (Errores de Movimiento Inválido)**
   - **Causa**: Bot retorna movimientos inválidos
   - **Solución**: Verificar implementación del bot y validación de movimientos

### Comandos de Depuración
```bash
# Verificar contenedores ejecutándose
docker ps

# Verificar logs del backend
docker logs tateti-arbitrator-backend-test

# Verificar logs de bots
docker logs tateti-random-bot-1-backend-test

# Probar endpoints de API
curl http://localhost:4000/api/stream/status
curl http://localhost:4000/api/bots/available
```

## Comandos de Limpieza
```bash
# Detener todos los contenedores
npm run clean:all

# Limpiar sistema Docker
npm run docker:clean
```

## Referencia de Scripts

| Script | Propósito | Configuración |
|--------|-----------|---------------|
| `dev:backend` | Backend de 2 jugadores | docker-compose.backend-test.yml |
| `dev:backend:4player` | Backend de 4 jugadores | docker-compose.4player.yml |
| `dev:backend:8player` | Backend de 8 jugadores | docker-compose.8player.yml |
| `dev:frontend` | Solo frontend | Servidor de desarrollo Vite |
| `dev:full` | Stack completo de 2 jugadores | Backend + Frontend |
| `dev:full:4player` | Stack completo de 4 jugadores | Backend + Frontend |
| `dev:full:8player` | Stack completo de 8 jugadores | Backend + Frontend |
| `test:2player` | Prueba de 2 jugadores | Backend + Frontend |
| `test:4player` | Prueba de 4 jugadores | Backend + Frontend |
| `test:8player` | Prueba de 8 jugadores | Backend + Frontend |
| `clean:all` | Detener todos los contenedores | Todas las configuraciones |

## Criterios de Éxito

### Modo Individual
- [ ] 2 jugadores generados automáticamente
- [ ] El juego inicia exitosamente
- [ ] El juego se completa con un ganador
- [ ] Sin errores 500
- [ ] ✅ **NUEVO**: GameOptionsService valida configuración correctamente
- [ ] ✅ **NUEVO**: PlayerService genera jugadores apropiadamente

### Torneo de 4 Jugadores
- [ ] 4 jugadores descubiertos automáticamente
- [ ] Bracket del torneo mostrado
- [ ] Todas las partidas completadas
- [ ] Ganador determinado
- [ ] ✅ **NUEVO**: GameOptionsService maneja configuración de torneo
- [ ] ✅ **NUEVO**: PlayerService gestiona múltiples jugadores

### Torneo de 8 Jugadores
- [ ] 8 jugadores descubiertos automáticamente
- [ ] Bracket del torneo mostrado
- [ ] Todas las partidas completadas
- [ ] Ganador determinado
- [ ] ✅ **NUEVO**: GameOptionsService valida configuraciones complejas
- [ ] ✅ **NUEVO**: PlayerService maneja fallbacks automáticamente

### 🏗️ Servicios Refactorizados
- [ ] ✅ **GameOptionsService**: 100% cobertura de pruebas unitarias
- [ ] ✅ **PlayerService**: 100% cobertura de pruebas unitarias
- [ ] ✅ **Integración**: Servicios funcionan correctamente en conjunto
- [ ] ✅ **Validación**: Configuraciones inválidas se manejan gracefully
- [ ] ✅ **Fallbacks**: Sistema de respaldo funciona correctamente

## Notas
- Todas las configuraciones usan el mismo frontend
- Puertos del backend: 4000 (arbitro), 3001-3008 (bots)
- Puerto del frontend: 3000 (o 3001 si 3000 está ocupado)
- Proxy de API configurado en `client/vite.config.js`