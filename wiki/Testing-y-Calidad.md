# Testing y Calidad

Estrategia de validación incremental en 3 capas siguiendo el principio "Fail Fast, Fail Early".

## 📊 Estrategia de 3 Capas

### Capa 1: Pre-commit (~30s)

**Objetivo**: Errores comunes antes de commit

**Valida:**
- ✅ Formato de código (Prettier)
- ✅ Linting (ESLint)
- ✅ Tests unitarios

**Ejecución:**
```bash
npm run qa:precommit
```

**Hook**: `.husky/pre-commit` (automático)

### Capa 2: Pre-push (~3min)

**Objetivo**: Validación completa antes de push

**Valida:**
- ✅ Todo de Capa 1
- ✅ Tests de integración
- ✅ Build del frontend
- ✅ Build de imagen Docker

**Ejecución:**
```bash
npm run qa:prepush
```

**Hook**: `.husky/pre-push` (automático)

### Capa 3: CI/CD (~5min)

**Objetivo**: Validación en ambiente limpio

**Valida:**
- ✅ Todo de Capa 2
- ✅ Build de todas las imágenes Docker
- ✅ Cobertura de código
- ✅ Preview deployment

**Ejecución:**
```bash
npm run qa:full
```

**Pipeline**: `.github/workflows/ci-cd.yml` (automático)

## 🔄 Flujo de Desarrollo

```
1. Desarrollar código
   ↓
2. git add .
   ↓
3. git commit   → Capa 1 (pre-commit)
   ↓
4. git push     → Capa 2 (pre-push)
   ↓
5. GitHub       → Capa 3 (CI/CD)
   ↓
6. Merge a master
```

## 🧪 TDD Obligatorio

### Ciclo TDD Completo

1. **Problema** → Analiza requerimientos y casos edge
2. **Algoritmo** → Diseña solución sin over-engineering
3. **Tests** → Escribe tests para todos los escenarios
4. **Código** → Implementa guiado por los tests

### Estructura de Tests

```
tests/
├── unit/           # Tests unitarios (80% del esfuerzo)
├── integration/    # Tests de integración (15%)
└── performance/    # Tests de rendimiento (5%)
```

### Jest Runner (VSCode)

**Workflow con Jest Runner:**

1. **Escribir Test**: Crear test con escenarios completos
2. **Ejecutar (Debe Fallar)**: Click "Run" - ver rojo (esperado)
3. **Implementar Código**: Código mínimo para pasar test
4. **Ejecutar (Debe Pasar)**: Click "Run" - ver verde
5. **Refactorizar**: Modificar código, tests auto-re-ejecutan
6. **Debug**: Click "Debug" para breakpoints

## 📋 Comandos de Testing

### Tests Unitarios

```bash
# Todos los tests unitarios
npm run test:unit

# Test específico
npm test -- --testPathPattern="mi-funcionalidad"

# Con cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

### Tests de Integración

```bash
# Todos los tests de integración
npm run test:integration

# Test específico
npm run test:integration -- --testPathPattern="discovery"

# Con timeout extendido
npm run test:integration -- --timeout=10000
```

### Tests del Cliente

```bash
# Tests del frontend
npm run test:client

# Cobertura del cliente
cd client && npm run test:coverage
```

## 🎯 Cobertura Esperada

### Objetivos de Cobertura

- **Unitarios**: ≥85% cobertura
- **Integración**: Todos los flujos críticos
- **Performance**: Componentes críticos

### Verificar Cobertura

```bash
# Cobertura completa
npm run test:coverage

# Cobertura específica
npm test -- --coverage --testPathPattern="GameService"
```

## 🔍 Tipos de Tests

### Tests Unitarios (Speed-First)

**Características:**
- Velocidad: Instantáneo (<1s)
- Mock: Todo (sin dependencias externas)
- Cobertura: Todos los casos (normal, fail, success, edge)
- Precisión: Validación específica input/output
- Async: No (tests síncronos)

**Ejemplo:**
```javascript
describe('GameService', () => {
  test('debe crear partida con jugadores válidos', () => {
    const players = [{ name: 'Bot1' }, { name: 'Bot2' }];
    const game = gameService.createGame(players);
    
    expect(game.id).toBeDefined();
    expect(game.players).toHaveLength(2);
  });
});
```

### Tests de Integración

**Características:**
- Dependencias: Reales (API, base de datos)
- Tiempo: 10s timeout
- Workers: 2 paralelos
- Scope: Flujos completos

**Ejemplo:**
```javascript
describe('API Integration', () => {
  test('debe crear partida via API', async () => {
    const response = await request(app)
      .post('/api/match')
      .send({ player1: { name: 'Bot1' }, player2: { name: 'Bot2' } });
    
    expect(response.status).toBe(201);
    expect(response.body.matchId).toBeDefined();
  });
});
```

## 🛠️ Solución de Fallos

### Falla Capa 1 (Pre-commit)

```bash
# Arreglar formato
npm run format:write

# Ver errores de linting
npm run lint

# Ver tests fallando
npm run test:unit
```

### Falla Capa 2 (Pre-push)

```bash
# Tests de integración
npm run test:integration

# Build frontend
cd client && npm run build

# Build Docker
npm run build:backend
```

### Falla Capa 3 (CI/CD)

```bash
# Ejecutar localmente
npm run qa:full

# Revisar logs de GitHub Actions
# Verificar variables de entorno
```

## 📊 Configuración de Jest

### Estructura de Configuración

- **Root Config**: `jest.config.js` - Monorepo con referencias
- **Unit Tests**: `jest.config.unit.js` - Speed-first (1s timeout, 4 workers)
- **Integration Tests**: `jest.config.integration.js` - Dependencias reales (10s timeout, 2 workers)
- **Performance Tests**: `jest.config.performance.js` - Load testing (30s timeout, 1 worker)

### Organización de Tests

- **Unit Tests**: `tests/unit/` - 80% enfoque, ejecución instantánea
- **Integration Tests**: `tests/integration/` - 15% enfoque, dependencias reales
- **Performance Tests**: `tests/performance/` - 5% enfoque, validación de carga
- **Mocks**: `tests/mocks/` - Organizados por servicio y componente

## 🔧 VSCode Integration

### Jest Runner Features

- **One-Click Execution**: Ejecutar tests individuales, suites o archivos
- **Inline Debugging**: Breakpoints directamente en VSCode
- **Watch Mode**: Re-ejecución automática en cambios
- **Real-Time Results**: Resultados instantáneos sin terminal
- **Coverage Integration**: Indicadores visuales de cobertura

### Comandos VSCode

```bash
# Iniciar Jest en watch mode
Ctrl+Shift+P → "Jest Runner: Start Jest in Watch Mode"

# Ejecutar test específico
Click "Run" sobre el test

# Debug test
Click "Debug" sobre el test
```

## 🧪 Testing de Servicios

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

### Integración de Servicios

```bash
npm run test:integration -- --testPathPattern="services"
```

## 🎮 Testing de Configuraciones

### Modo Individual (2 Jugadores)

```bash
npm run test:2player
```

**Verificar:**
- [ ] 2 jugadores generados
- [ ] Juego inicia correctamente
- [ ] Juego completa con ganador
- [ ] GameOptionsService valida configuración
- [ ] PlayerService genera jugadores

### Torneo 4 Jugadores

```bash
npm run test:4player
```

**Verificar:**
- [ ] 4 jugadores descubiertos
- [ ] Bracket mostrado
- [ ] Partidas completadas
- [ ] Ganador determinado
- [ ] Servicios manejan configuración

### Torneo 8 Jugadores

```bash
npm run test:8player
```

**Verificar:**
- [ ] 8 jugadores descubiertos
- [ ] Bracket completo
- [ ] Todas las partidas finalizadas
- [ ] Servicios validan configuración
- [ ] Fallbacks funcionan

## 💡 Ventajas de la Estrategia

1. **Fail Fast**: Errores en segundos, no minutos
2. **Feedback Inmediato**: Saber de inmediato si algo falla
3. **CI/CD Confiable**: Si pasa pre-push, muy probable que pase CI/CD
4. **Tiempo Optimizado**: No esperar 5min para descubrir error de sintaxis

## 🔍 Debugging de Tests

### Contenedores

```bash
# Estado de contenedores
docker ps

# Logs
docker logs tateti-arbitrator-smoke
docker logs tateti-smart-bot-1
```

### Endpoints

```bash
# Estado del stream
curl http://localhost:4000/api/stream/status

# Bots disponibles
curl http://localhost:4000/api/bots/available
```

## 🧹 Limpieza

```bash
# Detener contenedores
npm run docker:down

# Limpiar todo
npm run clean:all
npm run docker:clean
```

## ✅ Criterios de Éxito

### Servicios
- [ ] GameOptionsService: 100% cobertura
- [ ] PlayerService: 100% cobertura
- [ ] Integración funciona
- [ ] Validaciones correctas
- [ ] Fallbacks operan

### Sistema Completo
- [ ] Todos los tests pasan
- [ ] Cobertura ≥85%
- [ ] Build exitoso
- [ ] Deploy funcional

---

**¿Necesitas ejemplos específicos?** Consulta el [Cookbook](Cookbook) para recetas de testing o [Desarrollo](Desarrollo) para el workflow TDD completo.
