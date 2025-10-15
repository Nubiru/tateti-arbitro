# Inicio Rápido

Guía para tener el sistema funcionando en menos de 5 minutos.

## 📋 Prerrequisitos

- **Node.js 20 LTS** ([Descargar](https://nodejs.org/))
- **Docker y Docker Compose** ([Descargar](https://www.docker.com/))

### Verificar Instalación

```bash
node --version    # v20.x.x
docker --version  # Docker version 24.x.x
```

## 🚀 Instalación en 3 Pasos

### 1. Clonar y Instalar

```bash
git clone <tu-repositorio>
cd upc-arbitro-tateti

# Instalar dependencias del backend
npm install

# Instalar dependencias del frontend
cd client && npm install && cd ..
```

### 2. Ejecutar Sistema

```bash
# Modo desarrollo (recomendado para empezar)
npm run dev:smoke
```

### 3. Verificar Funcionamiento

Abre tu navegador en:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000

## ✅ Verificación Rápida

### Backend Saludable

```bash
curl http://localhost:4000/api/health
# Respuesta esperada: {"status":"healthy","timestamp":"..."}
```

### Bots Disponibles

```bash
curl http://localhost:4000/api/bots/available
# Respuesta esperada: {"bots":[...],"total":4,"healthy":4}
```

### Frontend Funcionando

- Ve a http://localhost:5173
- Deberías ver la interfaz del juego
- Los bots se cargan automáticamente

## 🎮 Primer Juego

Una vez que todo esté funcionando:

1. **Crear partida**:
   ```bash
   curl -X POST http://localhost:4000/api/match \
     -H "Content-Type: application/json" \
     -d '{
       "player1": {"name": "SmartBot1", "port": 3003},
       "player2": {"name": "StrategicBot1", "port": 3004},
       "boardSize": 3
     }'
   ```

2. **Ver eventos en tiempo real**:
   ```bash
   curl -N http://localhost:4000/api/stream
   ```

3. **En el frontend**: La partida aparecerá automáticamente

## 🔧 Comandos Esenciales

| Necesito... | Comando |
|-------------|---------|
| Desarrollar con hot-reload | `npm run dev:4player` |
| Probar en Docker | `npm run docker:smoke` |
| Validar antes de commit | `npm run qa:precommit` |
| Detener sistema | `npm run docker:down` |

## 🌐 Puertos del Sistema

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend | 4000 | http://localhost:4000 |
| Bots | 3001-3008 | http://localhost:3001+ |

## 🐛 Problemas Comunes

### Puerto 4000 ocupado

```bash
# Ver qué usa el puerto
netstat -ano | findstr :4000

# Cambiar puerto en .env
PORT=4001
```

### Docker no funciona en Windows

Crear archivo `.env` en la raíz:
```env
DOCKER_DISCOVERY=false
```

### Bots no aparecen

```bash
# Verificar contenedores
docker ps

# Ver logs
docker logs tateti-smart-bot-1
```

## 📚 Próximos Pasos

- **[Desarrollo](Desarrollo)** - Flujo de trabajo diario
- **[Bots y Jugadores](Bots-y-Jugadores)** - Entender el sistema de bots
- **[Testing y Calidad](Testing-y-Calidad)** - Estrategia de pruebas
- **[Cookbook](Cookbook)** - Ejemplos prácticos

## ⚡ Comandos Rápidos

```bash
# Desarrollo completo
npm run dev:4player    # 4 bots
npm run dev:8player    # 8 bots

# Docker completo
npm run docker:smoke   # Todo containerizado

# Validación
npm run qa:precommit   # OBLIGATORIO antes de commit

# Limpieza
npm run clean:all      # Limpiar todo
```

---

**¿Todo funcionando?** ¡Excelente! Ahora puedes explorar la [guía de desarrollo](Desarrollo) o el [cookbook de ejemplos](Cookbook).
