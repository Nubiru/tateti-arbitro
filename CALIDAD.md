# Control de Calidad - Estrategia de 3 Capas

**Última Actualización:** 2025-10-09

## Resumen

Sistema de validación progresivo en tres capas para garantizar calidad sin frenar el desarrollo. Cada capa construye sobre la anterior, desde validación rápida local hasta pipeline completo de CI/CD.

---

## 🎯 Las Tres Capas

| Capa | Trigger | Duración | Propósito |
|------|---------|----------|-----------|
| **Pre-Commit** | `git commit` | ~30-60s | Evitar código defectuoso en git |
| **Pre-Push** | `git push` | ~2-3min | Garantizar código production-ready |
| **CI/CD** | Push a GitHub | ~5-10min | Validación final con builds completos |

---

## Capa 1: Pre-Commit (Rápido - Esencial)

**Validaciones:**
- ✅ Formato (Prettier)
- ✅ Lint (ESLint)
- ✅ Tests unitarios (Backend + Frontend)

**Ejecutar manualmente:**
```bash
npm run qa:precommit
```

**Omitir (Solo emergencias):**
```bash
git commit --no-verify -m "mensaje"
```

---

## Capa 2: Pre-Push (Comprehensivo - Local)

**Validaciones:**
- ✅ Todo de Capa 1
- ✅ Tests de integración
- ✅ Build de frontend

**Ejecutar manualmente:**
```bash
npm run qa:prepush
```

**Omitir (Solo emergencias):**
```bash
git push --no-verify
```

---

## Capa 3: CI/CD (Completo - Remoto)

**Validaciones:**
- ✅ Todo de Capa 2
- ✅ Builds de Docker (Backend + Frontend)
- ✅ Reportes de cobertura

**Simular localmente:**
```bash
npm run qa:cicd
```

---

## Matriz de Validación

| Validación | Pre-Commit | Pre-Push | CI/CD |
|------------|-----------|----------|-------|
| Formato | ✅ | ✅ | ✅ |
| Lint Backend | ✅ | ✅ | ✅ |
| Lint Frontend | ✅ | ✅ | ✅ |
| Tests Unitarios | ✅ | ✅ | ✅ |
| Tests Integración | ❌ | ✅ | ✅ |
| Build Frontend | ❌ | ✅ | ✅ |
| Builds Docker | ❌ | ❌ | ✅ |
| Cobertura | ❌ | ❌ | ✅ |

---

## Flujo de Desarrollo

```bash
# 1. Hacer cambios y agregar a git
git add .

# 2. Commit (Capa 1 se ejecuta automáticamente)
git commit -m "feat: nueva funcionalidad"

# 3. Push (Capa 2 se ejecuta automáticamente)
git push origin master

# 4. CI/CD se ejecuta automáticamente en GitHub
```

---

## Solución de Problemas

### Pre-Commit falla?
```bash
npm run format:write  # Auto-corregir formato
npm run lint          # Ver errores de lint
npm run test:unit     # Ver tests fallidos
```

### Pre-Push falla?
```bash
npm run test:integration       # Ver tests de integración
cd client && npm run build     # Ver errores de build
```

### CI/CD falla?
```bash
npm run qa:cicd  # Reproducir localmente
```

---

## Objetivos de Rendimiento

| Capa | Objetivo | Máximo |
|------|----------|--------|
| Pre-Commit | 30s | 60s |
| Pre-Push | 2min | 3min |
| CI/CD | 5min | 10min |

---

## Configuración

- **Hook Pre-Commit:** `.husky/pre-commit`
- **Hook Pre-Push:** `.husky/pre-push`
- **CI/CD Workflow:** `.github/workflows/ci-cd.yml`
- **Scripts de QA:** `package.json` (scripts qa:*)

---

## Reglas de Oro

1. ✅ **SIEMPRE** ejecutar `npm run qa:precommit` antes de commit
2. ✅ **NUNCA** omitir pre-push a menos que sea absolutamente necesario
3. ✅ **MONITOREAR** resultados de CI/CD en GitHub Actions
4. ✅ **CORREGIR** fallos inmediatamente - no dejar acumular
5. ✅ **MANTENER** tests rápidos - unitarios <100ms cada uno

---

## Notas Importantes

- **Pre-commit** es rápido y atrapa errores obvios
- **Pre-push** es comprehensivo y asegura production-readiness
- **CI/CD** es completo e incluye builds de Docker
- Las tres capas están perfectamente alineadas ✨

