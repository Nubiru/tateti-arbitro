# Cookbook - Recetario de Ejemplos

Recetas prácticas para usar el sistema Ta-Te-Ti Arbitro.

## 🚀 Recetas Básicas

### Crear una Partida Simple

```bash
# 1. Verificar que el sistema esté funcionando
curl http://localhost:4000/api/health

# 2. Ver bots disponibles
curl http://localhost:4000/api/bots/available

# 3. Crear partida entre SmartBot y StrategicBot
curl -X POST http://localhost:4000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "player1": {"name": "SmartBot1", "port": 3003},
    "player2": {"name": "StrategicBot1", "port": 3004},
    "boardSize": 3
  }'

# 4. Escuchar eventos en tiempo real
curl -N http://localhost:4000/api/stream
```

### Crear un Torneo de 4 Jugadores

```bash
# Crear torneo con todos los bots disponibles
curl -X POST http://localhost:4000/api/tournament \
  -H "Content-Type: application/json" \
  -d '{
    "players": [
      {"name": "RandomBot1", "port": 3001},
      {"name": "SmartBot1", "port": 3003},
      {"name": "StrategicBot1", "port": 3004},
      {"name": "RandomBot2", "port": 3002}
    ],
    "boardSize": 3,
    "format": "single-elimination"
  }'
```

### Probar un Bot Manualmente

```bash
# 1. Health check del bot
curl http://localhost:3003/health

# 2. Información del bot
curl http://localhost:3003/info

# 3. Probar movimiento en tablero vacío
curl "http://localhost:3003/move?board=[0,0,0,0,0,0,0,0,0]"

# 4. Probar movimiento en tablero parcial
curl "http://localhost:3003/move?board=[1,0,0,0,2,0,0,0,0]"
```

## 🔧 Recetas de Desarrollo

### Iniciar Ambiente de Desarrollo

```bash
# Opción 1: Desarrollo con hot-reload
npm run dev:4player

# Opción 2: Docker completo
npm run docker:smoke

# Verificar que todo funciona
curl http://localhost:4000/api/health
curl http://localhost:4000/api/bots/available
```

### Ejecutar Tests Específicos

```bash
# Test de un servicio específico
npm test -- --testPathPattern="GameService"

# Test de integración
npm run test:integration -- --testPathPattern="discovery"

# Test con cobertura
npm run test:coverage -- --testPathPattern="PlayerService"
```

### Debugging de Tests

```bash
# Ejecutar test en modo debug (VSCode)
# Click "Debug" sobre el test en Jest Runner

# O desde terminal
node --inspect-brk node_modules/.bin/jest --runInBand --testPathPattern="mi-test"
```

## 🐳 Recetas de Docker

### Construir y Ejecutar Bot Personalizado

```bash
# 1. Crear estructura del bot
mkdir players/mi-bot
cd players/mi-bot

# 2. Crear package.json
cat > package.json << EOF
{
  "name": "mi-bot",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
EOF

# 3. Crear index.js
cat > index.js << EOF
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3009;

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', player: 'MiBot' });
});

app.get('/info', (req, res) => {
  res.json({ 
    name: 'MiBot', 
    strategy: 'Custom', 
    version: '1.0.0' 
  });
});

app.get('/move', (req, res) => {
  const board = JSON.parse(req.query.board);
  // Lógica simple: primera posición vacía
  const move = board.indexOf(0);
  res.json({ move });
});

app.listen(PORT, () => {
  console.log(\`Bot corriendo en puerto \${PORT}\`);
});
EOF

# 4. Crear Dockerfile
cat > Dockerfile << EOF
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3009
CMD ["npm", "start"]
EOF

# 5. Construir imagen
docker build -t mi-bot:v1.0.0 .

# 6. Ejecutar bot
docker run -d --name mi-bot-1 -p 3009:3009 -e PORT=3009 mi-bot:v1.0.0

# 7. Probar bot
curl http://localhost:3009/health
curl "http://localhost:3009/move?board=[0,0,0,0,0,0,0,0,0]"
```

### Agregar Bot a Docker Compose

```bash
# Agregar a docker-compose.4player.yml
cat >> docker-compose.4player.yml << EOF

  mi-bot-1:
    build: ./players/mi-bot
    ports:
      - "3009:3009"
    environment:
      - PORT=3009
    networks:
      - tateti-network
EOF

# Reiniciar con nuevo bot
npm run docker:down
npm run docker:4player
```

## 🌐 Recetas de Vercel

### Desplegar Bot en Vercel

```bash
# 1. Crear proyecto Vercel
mkdir mi-bot-vercel
cd mi-bot-vercel

# 2. Crear package.json
cat > package.json << EOF
{
  "name": "mi-bot-vercel",
  "version": "1.0.0",
  "scripts": {
    "dev": "vercel dev",
    "build": "echo 'No build needed'",
    "start": "echo 'Serverless functions'"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
EOF

# 3. Crear api/health.js
mkdir api
cat > api/health.js << EOF
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'healthy', 
    player: 'MiVercelBot',
    timestamp: new Date().toISOString()
  });
}
EOF

# 4. Crear api/move.js
cat > api/move.js << EOF
export default function handler(req, res) {
  const { board } = req.query;
  const boardArray = JSON.parse(board);
  
  // Lógica simple: primera posición vacía
  const move = boardArray.indexOf(0);
  
  res.status(200).json({ move });
}
EOF

# 5. Crear api/info.js
cat > api/info.js << EOF
export default function handler(req, res) {
  res.status(200).json({
    name: 'MiVercelBot',
    strategy: 'Vercel',
    version: '1.0.0',
    capabilities: ['3x3', '5x5']
  });
}
EOF

# 6. Desplegar
npx vercel --prod

# 7. Probar bot desplegado
curl https://mi-bot-vercel.vercel.app/api/health
curl "https://mi-bot-vercel.vercel.app/api/move?board=[0,0,0,0,0,0,0,0,0]"
```

### Configurar Bot Vercel en el Arbitrador

```bash
# Agregar a variables de entorno
echo "VERCEL_BOTS_ENABLED=true" >> .env
echo "VERCEL_BOT_URLS=https://mi-bot-vercel.vercel.app" >> .env

# Reiniciar sistema
npm run docker:down
npm run dev:4player

# Verificar que aparece en bots disponibles
curl http://localhost:4000/api/bots/available
```

## 🧪 Recetas de Testing

### Crear Test Unitario Completo

```javascript
// tests/unit/services/MiServicio.unit.test.js
describe('MiServicio', () => {
  let miServicio;

  beforeEach(() => {
    miServicio = new MiServicio();
  });

  describe('crearPartida', () => {
    test('debe crear partida con jugadores válidos', () => {
      // Arrange
      const jugadores = [
        { nombre: 'Bot1', puerto: 3001 },
        { nombre: 'Bot2', puerto: 3002 }
      ];

      // Act
      const partida = miServicio.crearPartida(jugadores);

      // Assert
      expect(partida.id).toBeDefined();
      expect(partida.jugadores).toHaveLength(2);
      expect(partida.estado).toBe('activa');
    });

    test('debe fallar con jugadores inválidos', () => {
      // Arrange
      const jugadores = [];

      // Act & Assert
      expect(() => {
        miServicio.crearPartida(jugadores);
      }).toThrow('Se requieren al menos 2 jugadores');
    });
  });
});
```

### Crear Test de Integración

```javascript
// tests/integration/api/match.integration.test.js
describe('API /api/match', () => {
  test('debe crear partida via API', async () => {
    // Arrange
    const datosPartida = {
      player1: { name: 'Bot1', port: 3001 },
      player2: { name: 'Bot2', port: 3002 },
      boardSize: 3
    };

    // Act
    const response = await request(app)
      .post('/api/match')
      .send(datosPartida);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.matchId).toBeDefined();
    expect(response.body.players).toHaveLength(2);
  });
});
```

## 🔍 Recetas de Debugging

### Debugging de Contenedores

```bash
# Ver logs de todos los contenedores
docker logs tateti-arbitrator-smoke
docker logs tateti-smart-bot-1
docker logs tateti-strategic-bot-1

# Ver logs en tiempo real
docker logs -f tateti-arbitrator-smoke

# Entrar al contenedor
docker exec -it tateti-arbitrator-smoke sh

# Ver estado de contenedores
docker ps
docker stats
```

### Debugging de Red

```bash
# Verificar conectividad entre contenedores
docker exec tateti-arbitrator-smoke ping tateti-smart-bot-1

# Verificar puertos
netstat -tulpn | grep :4000
netstat -tulpn | grep :3003

# Verificar DNS interno
docker exec tateti-arbitrator-smoke nslookup tateti-smart-bot-1
```

### Debugging de Tests

```bash
# Ejecutar test específico con verbose
npm test -- --testPathPattern="mi-test" --verbose

# Ejecutar con debug
node --inspect-brk node_modules/.bin/jest --runInBand --testPathPattern="mi-test"

# Ver cobertura detallada
npm run test:coverage -- --testPathPattern="mi-test"
open coverage/lcov-report/index.html
```

## 🚀 Recetas de Despliegue

### Pipeline Completo de Despliegue

```bash
# 1. Validación completa
npm run qa:precommit

# 2. Build de frontend
npm run build:frontend

# 3. Build de Docker
npm run build:all

# 4. Deploy
npm run deploy:prod

# 5. Verificar despliegue
curl https://tu-backend.railway.app/api/health
curl https://tu-frontend.vercel.app
```

### Despliegue Manual Paso a Paso

```bash
# 1. Preparar ambiente
npm run clean:all
npm install

# 2. Build frontend
cd client
npm install
npm run build
cd ..

# 3. Build Docker
docker build -t tateti-arbitrator:v1.0.0 .
docker build -t tateti-smart-bot:v1.0.0 ./players/smart-bot

# 4. Deploy con Docker Compose
docker-compose -f docker-compose.yml up -d

# 5. Verificar
curl http://localhost:4000/api/health
```

## 🧹 Recetas de Limpieza

### Limpieza Completa del Sistema

```bash
# Detener todos los contenedores
npm run docker:down

# Limpiar imágenes no utilizadas
docker image prune -f

# Limpiar volúmenes
docker volume prune -f

# Limpiar red
docker network prune -f

# Limpiar frontend
npm run clean:frontend

# Limpiar node_modules
rm -rf node_modules client/node_modules
npm install
cd client && npm install && cd ..
```

### Limpieza Selectiva

```bash
# Solo contenedores
docker stop $(docker ps -q)
docker rm $(docker ps -aq)

# Solo imágenes
docker rmi $(docker images -q)

# Solo frontend
rm -rf client/dist
rm -rf public/
```

## 📊 Recetas de Monitoreo

### Monitoreo Básico

```bash
# Estado del sistema
curl http://localhost:4000/api/health
curl http://localhost:4000/api/health/detailed

# Estadísticas
curl http://localhost:4000/api/stats
curl http://localhost:4000/api/stats/bots

# Estado de bots
curl http://localhost:4000/api/bots/available
```

### Monitoreo Avanzado

```bash
# Logs en tiempo real
docker logs -f tateti-arbitrator-smoke | grep ERROR

# Uso de recursos
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Conectividad de red
docker network ls
docker network inspect tateti-network
```

## 🎯 Recetas de Optimización

### Optimizar Tests

```bash
# Ejecutar tests en paralelo
npm test -- --maxWorkers=4

# Ejecutar solo tests modificados
npm test -- --onlyChanged

# Ejecutar tests con caché
npm test -- --cache
```

### Optimizar Docker

```bash
# Build con caché
docker build --cache-from tateti-arbitrator:latest -t tateti-arbitrator:v1.0.0 .

# Multi-stage build
# Usar .dockerignore para excluir archivos innecesarios

# Limpiar caché de Docker
docker builder prune -f
```

---

**¿Necesitas más recetas?** Consulta la [API Reference](API-Reference) para detalles técnicos o [Desarrollo](Desarrollo) para el workflow completo.
