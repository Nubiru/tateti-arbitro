# Estrategia de Calidad

Sistema de validación incremental en 3 capas siguiendo el principio "Fail Fast, Fail Early".

## 📊 Capas de Validación

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

---

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

---

### Capa 3: CI/CD (~5min)

**Objetivo**: Validación en ambiente limpio

**Valida:**
- ✅ Todo de Capa 2
- ✅ Build de todas las imágenes Docker
- ✅ Cobertura de código
- ✅ Preview deployment

**Ejecución:**
```bash
npm run qa:cicd
# o
npm run qa:full
```

**Pipeline**: `.github/workflows/ci-cd.yml` (automático)

---

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

## 🛠️ Solución de Fallos

### Falla Capa 1

```bash
npm run format:write   # Arreglar formato
npm run lint           # Ver errores
npm run test:unit      # Ver tests
```

### Falla Capa 2

```bash
npm run test:integration        # Tests de integración
cd client && npm run build      # Build frontend
npm run build:backend           # Build Docker
```

### Falla Capa 3

```bash
# Ejecutar localmente
npm run qa:cicd

# Revisar logs de GitHub Actions
```

## 💡 Ventajas

1. **Fail Fast**: Errores en segundos, no minutos
2. **Feedback Inmediato**: Saber de inmediato si algo falla
3. **CI/CD Confiable**: Si pasa pre-push, muy probable que pase CI/CD
4. **Tiempo Optimizado**: No esperar 5min para descubrir error de sintaxis

---

**Última actualización**: 2025-10-10
