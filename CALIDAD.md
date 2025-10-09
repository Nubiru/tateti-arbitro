# Estrategia de Calidad en Capas

_Última actualización: 09 de Octubre 2025_

## Filosofía

Nuestra estrategia de calidad sigue el principio de **"Fail Fast, Fail Early"** con validación incremental en 3 capas. Cada capa agrega más verificaciones, atrapando errores lo más temprano posible en el ciclo de desarrollo.

## Capa 1: Pre-commit (Rápido - ~30s)

**Objetivo**: Atrapar el 90% de errores comunes antes de hacer commit

**Qué valida**:
- ✅ Formato de código (Prettier)
- ✅ Linting (ESLint backend + frontend)
- ✅ Tests unitarios (backend + frontend)
- ✅ Tests de cliente React

**Cuándo se ejecuta**:
- Automáticamente antes de cada `git commit`
- Manualmente con `npm run qa:precommit`

**Tiempo estimado**: 30 segundos

**Hook**: `.husky/pre-commit`

```bash
npm run qa:precommit
```

---

## Capa 2: Pre-push (Comprensivo - ~3min)

**Objetivo**: Validación completa antes de enviar código al repositorio remoto

**Qué valida**:
- ✅ Todo lo de Capa 1 (pre-commit)
- ✅ Tests de integración (backend)
- ✅ Build del frontend (Vite)
- ✅ **Build de imagen Docker del backend** (validación de Dockerfile)

**Cuándo se ejecuta**:
- Automáticamente antes de cada `git push`
- Manualmente con `npm run qa:prepush`

**Tiempo estimado**: 2-3 minutos

**Hook**: `.husky/pre-push`

```bash
npm run qa:prepush
```

**Nota crítica**: Esta capa ahora incluye `npm run build:backend` que construye la imagen Docker del arbitrador. Esto asegura que cualquier error de sintaxis en Dockerfiles sea detectado **antes** de hacer push, evitando fallos en CI/CD.

---

## Capa 3: CI/CD (Completo - ~5min)

**Objetivo**: Validación completa en ambiente limpio antes de despliegue

**Qué valida**:
- ✅ Todo lo de Capa 2 (pre-push)
- ✅ **Build de todas las imágenes Docker** (backend + frontend)
- ✅ Cobertura de código (Codecov)
- ✅ Preview deployment (Vercel)

**Cuándo se ejecuta**:
- Automáticamente en cada push a `master`/`main`
- Automáticamente en cada Pull Request

**Tiempo estimado**: 4-5 minutos

**Pipeline**: `.github/workflows/ci-cd.yml`

```bash
npm run qa:cicd
```

---

## Resumen de Comandos

| Comando | Capa | Uso | Tiempo |
|---------|------|-----|--------|
| `npm run qa:precommit` | 1 | Validación rápida local | ~30s |
| `npm run qa:prepush` | 2 | Validación completa + Docker | ~3min |
| `npm run qa:cicd` | 3 | Validación CI/CD completa | ~5min |
| `npm run qa:full` | 3 | Alias de `qa:cicd` | ~5min |

---

## Flujo de Desarrollo Recomendado

```
1. Desarrollar código
   ↓
2. git add .
   ↓
3. git commit -m "mensaje"  → Ejecuta Capa 1 (pre-commit)
   ↓
4. git push                  → Ejecuta Capa 2 (pre-push)
   ↓
5. GitHub Actions            → Ejecuta Capa 3 (CI/CD)
   ↓
6. Merge a master/main
```

---

## Qué Hacer Si Falla Alguna Capa

### Falla Capa 1 (pre-commit)
- **Problema**: Linting, formato, o tests unitarios
- **Solución**: 
  ```bash
  npm run format:write  # Arreglar formato
  npm run lint          # Ver errores de linting
  npm run test:unit     # Ver qué tests fallan
  ```

### Falla Capa 2 (pre-push)
- **Problema**: Tests de integración, build frontend, o Docker
- **Solución**:
  ```bash
  npm run test:integration  # Ver tests de integración
  cd client && npm run build  # Verificar build frontend
  npm run build:backend     # Verificar Docker build
  ```

### Falla Capa 3 (CI/CD)
- **Problema**: Ambiente limpio detectó un issue
- **Solución**: 
  - Revisar logs de GitHub Actions
  - Ejecutar localmente: `npm run qa:cicd`
  - Si pasa local pero falla en CI/CD, puede ser problema de ambiente

---

## Ventajas de Esta Estrategia

1. **Fail Fast**: Errores detectados en segundos, no minutos
2. **Feedback Inmediato**: Desarrollador sabe de inmediato si algo está mal
3. **Prevención de Push Roto**: Docker build validado antes de push
4. **CI/CD Confiable**: Si pasa pre-push, muy probable que pase CI/CD
5. **Tiempo Optimizado**: No esperar 5min de CI/CD para saber que faltó un `;`

---

## Lecciones Aprendidas

### ❌ Problema Anterior
- Pre-commit y pre-push no validaban Docker builds
- Errores de sintaxis en Dockerfile solo se detectaban en CI/CD
- Desarrollador esperaba 5 minutos para descubrir error de sintaxis

### ✅ Solución Actual
- Pre-push valida build de imagen Docker del backend
- Errores de Dockerfile detectados en ~3min localmente
- CI/CD se usa para validación final, no para debugging

---

## Mantenimiento

Este documento debe actualizarse cuando:
- Se agreguen nuevas capas de validación
- Cambien los tiempos estimados significativamente
- Se modifiquen los hooks de Git
- Se actualice el pipeline de CI/CD

**Última revisión**: 09 de Octubre 2025
**Próxima revisión**: 09 de Noviembre 2025
