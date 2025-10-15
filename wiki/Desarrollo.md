# Guía de Desarrollo

Flujo de trabajo diario, TDD obligatorio y estándares de código.

## 🔄 Flujo de Trabajo Diario

### 1. Iniciar Ambiente

```bash
# Desarrollo con hot-reload (recomendado)
npm run dev:4player

# O para testing de integración
npm run docker:smoke
```

### 2. Desarrollar con TDD

**TDD es OBLIGATORIO** - Sigue este ciclo:

1. **Problema** → Analiza requerimientos y casos edge
2. **Algoritmo** → Diseña solución sin over-engineering
3. **Tests** → Escribe tests para todos los escenarios
4. **Código** → Implementa guiado por los tests

### 3. Validar Antes de Commit

```bash
# OBLIGATORIO antes de cada commit
npm run qa:precommit
```

### 4. Commit y Push

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

## 🧪 TDD Workflow Detallado

### Ciclo TDD Completo

```bash
# 1. Escribir test (debe fallar)
npm test -- --testPathPattern="mi-funcionalidad"

# 2. Implementar código mínimo (hacer pasar test)
# 3. Refactorizar (mantener tests pasando)
# 4. Repetir para siguiente funcionalidad
```

### Estructura de Tests

```
tests/
├── unit/           # Tests unitarios (80% del esfuerzo)
├── integration/    # Tests de integración (15%)
└── performance/    # Tests de rendimiento (5%)
```

### Cobertura Esperada

- **Unitarios**: ≥85% cobertura
- **Integración**: Todos los flujos críticos
- **Performance**: Componentes críticos

## 🔧 Comandos de Desarrollo

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

# Acceso:
# - Todo en uno: http://localhost:4000
```

## 📁 Estructura de Archivos Clave

### Backend

```
src/
├── app/                 # Aplicación principal
│   ├── controllers/     # Controladores HTTP
│   ├── routes/         # Definición de rutas
│   └── server.js       # Servidor Express
├── domain/             # Lógica de negocio
│   └── game/           # Dominio del juego
├── middleware/         # Middleware personalizado
└── services/           # Servicios de aplicación
```

### Frontend

```
client/src/
├── components/         # Componentes reutilizables
├── containers/         # Contenedores de estado
├── context/           # Context de React
├── screens/           # Pantallas principales
└── services/          # Servicios del cliente
```

## 📋 Estándares de Código

### Reglas Obligatorias

1. **TDD Primero**: Tests antes que código
2. **Sin `any`**: Usar `unknown` y type guards
3. **Máximo 3 logs**: Por archivo, cero en producción
4. **Comentarios inteligentes**: Explicar POR QUÉ, no QUÉ
5. **Nombres descriptivos**: Código autodocumentado

### Estructura de Archivos

```javascript
/**
 * @lastModified 2025-10-10
 * @todo Descripción de funcionalidad pendiente
 * @version 1.0.0
 */

// Imports organizados
import { servicio } from './servicio';
import { validacion } from './validacion';

// Función principal
export function miFuncion(parametros) {
  // Lógica aquí
}

// Funciones auxiliares
function funcionAuxiliar() {
  // Implementación
}
```

### Logging Estructurado

```javascript
// Formato estándar
logger.serviceInfo('GameService', 'core', 'createMatch', 'Partida creada', {
  matchId: 'abc123',
  players: 2
});

// Resultado: [10-10T15:30][INFO][GAME][GameService][core][createMatch]: Partida creada | matchId=abc123 players=2
```

## 🚦 Validación de Calidad

### Pre-commit (Capa 1)

```bash
npm run qa:precommit

# Valida:
# - Prettier (formato)
# - ESLint (linting)
# - Tests unitarios
```

### Pre-push (Capa 2)

```bash
npm run qa:prepush

# Valida:
# - Todo de Capa 1
# - Tests de integración
# - Build del frontend
# - Build de Docker
```

### CI/CD (Capa 3)

```bash
npm run qa:full

# Valida:
# - Todo de Capa 2
# - Cobertura de código
# - Preview deployment
```

## 🐛 Debugging

### Frontend

```bash
# DevTools del navegador
# - Console para logs
# - Network para requests
# - React DevTools para estado
```

### Backend

```bash
# Logs del contenedor
docker logs tateti-arbitrator-smoke

# Debug con breakpoints
# Usar Jest Runner en VSCode
```

### Tests

```bash
# Ejecutar test específico
npm test -- --testPathPattern="mi-test"

# Debug test
# Click "Debug" en Jest Runner (VSCode)
```

## 📊 Monitoreo de Desarrollo

### Estado del Sistema

```bash
# Salud del backend
curl http://localhost:4000/api/health

# Bots disponibles
curl http://localhost:4000/api/bots/available

# Estado de contenedores
docker ps
```

### Métricas de Calidad

```bash
# Cobertura de tests
npm run test:coverage

# Linting
npm run lint

# Formato
npm run format:check
```

## 🔄 Flujo de Git

### Branches

- `master` - Producción estable
- `develop` - Desarrollo activo
- `feature/nombre` - Nuevas funcionalidades
- `hotfix/nombre` - Correcciones urgentes

### Commits

```bash
# Formato de mensajes
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
test: agregar tests
refactor: refactorización de código
```

## ⚡ Comandos Rápidos

```bash
# Desarrollo
npm run dev:4player      # Iniciar desarrollo
npm run qa:precommit     # Validar antes de commit

# Testing
npm test                 # Todos los tests
npm run test:unit        # Solo unitarios
npm run test:integration # Solo integración

# Limpieza
npm run clean:all        # Limpiar todo
npm run docker:down      # Detener Docker
```

## 🎯 Reglas de Oro

1. **SIEMPRE** ejecutar `npm run qa:precommit` antes de commit
2. **USAR** `dev:*` para desarrollo (hot-reload)
3. **USAR** `docker:*` para testing de integración
4. **TDD OBLIGATORIO** - Tests antes que código
5. **NO over-engineering** - Solución simple para problema simple

---

**¿Necesitas más detalles?** Consulta [Testing y Calidad](Testing-y-Calidad) para la estrategia completa de pruebas o el [Cookbook](Cookbook) para ejemplos prácticos.
