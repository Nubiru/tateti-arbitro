#!/bin/bash
# Script de Verificación de Capa Smoke
# Prueba toda la funcionalidad principal del despliegue smoke
# @lastModified 2025-10-08
# @version 1.0.0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 PRUEBAS DE VERIFICACIÓN DE CAPA SMOKE (4 BOTS)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colores para salida
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de pruebas
PASARON=0
FALLARON=0

# Función auxiliar para probar endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    
    echo -n "Probando ${name}... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}✅ PASÓ${NC} (HTTP $response)"
        ((PASARON++))
        return 0
    else
        echo -e "${RED}❌ FALLÓ${NC} (HTTP $response, esperado $expected_status)"
        ((FALLARON++))
        return 1
    fi
}

# Prueba 1: Salud del Árbitro
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PRUEBA 1: ENDPOINT DE SALUD DEL ÁRBITRO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Árbitro /api/health" "http://localhost:4000/api/health" "200"
echo ""

# Prueba 2: Verificaciones de Salud de Bots
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PRUEBA 2: ENDPOINTS DE SALUD DE BOTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "RandomBot1 /health" "http://localhost:3001/health" "200"
test_endpoint "RandomBot2 /health" "http://localhost:3002/health" "200"
test_endpoint "SmartBot1 /health" "http://localhost:3003/health" "200"
test_endpoint "StrategicBot1 /health" "http://localhost:3004/health" "200"
echo ""

# Prueba 3: Descubrimiento de Bots
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PRUEBA 3: ENDPOINT DE DESCUBRIMIENTO DE BOTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "Probando /api/bots/available... "

bots_response=$(curl -s "http://localhost:4000/api/bots/available" 2>/dev/null)

if [ $? -eq 0 ]; then
    healthy_count=$(echo "$bots_response" | grep -o '"status":"healthy"' | wc -l)
    total_count=$(echo "$bots_response" | grep -o '"name":"RandomBot\|SmartBot\|StrategicBot"' | wc -l)
    
    if [ "$healthy_count" -ge 4 ] && [ "$total_count" -ge 4 ]; then
        echo -e "${GREEN}✅ PASÓ${NC} (Encontrados $healthy_count bots saludables de $total_count)"
        ((PASARON++))
    else
        echo -e "${RED}❌ FALLÓ${NC} (Encontrados $healthy_count bots saludables, esperados 4)"
        ((FALLARON++))
    fi
else
    echo -e "${RED}❌ FALLÓ${NC} (No se pudo conectar al endpoint)"
    ((FALLARON++))
fi
echo ""

# Prueba 4: Endpoint de Stream SSE (OMITIR - SSE mantiene conexión abierta)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PRUEBA 4: ENDPOINT DE STREAM SSE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}⚠️  OMITIDO${NC} (SSE mantiene conexión abierta - probado en frontend)"
echo ""

# Prueba 5: Ejecución de Partida
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PRUEBA 5: EJECUCIÓN DE PARTIDA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "Probando POST /api/match... "

match_payload='{
  "player1": {"name": "RandomBot1", "port": 3001},
  "player2": {"name": "RandomBot2", "port": 3002},
  "boardSize": "3x3"
}'

match_response=$(curl -s --max-time 30 -X POST "http://localhost:4000/api/match" \
  -H "Content-Type: application/json" \
  -d "$match_payload" 2>/dev/null)

if [ $? -eq 0 ]; then
    # Check if response contains expected fields
    if echo "$match_response" | grep -q '"result"' && echo "$match_response" | grep -q '"winner"'; then
        echo -e "${GREEN}✅ PASÓ${NC}"
        echo "   Partida completada exitosamente"
        winner=$(echo "$match_response" | grep -o '"name":"[^"]*"' | head -1)
        result=$(echo "$match_response" | grep -o '"result":"[^"]*"' | head -1)
        echo "   Ganador: $winner"
        echo "   Resultado: $result"
        ((PASARON++))
    else
        echo -e "${RED}❌ FALLÓ${NC}"
        echo "   Respuesta faltan campos esperados"
        echo "   Respuesta: $match_response"
        ((FALLARON++))
    fi
else
    echo -e "${RED}❌ FALLÓ${NC} (No se pudo conectar al endpoint)"
    ((FALLARON++))
fi
echo ""

# Prueba 6: Estado de Contenedores
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PRUEBA 6: ESTADO DE SALUD DE CONTENEDORES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

containers=(
    "tateti-arbitrator-smoke"
    "tateti-random-bot-1"
    "tateti-random-bot-2"
    "tateti-smart-bot-1"
    "tateti-strategic-bot-1"
)

for container in "${containers[@]}"; do
    echo -n "Probando $container... "
    
    status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null)
    
    if [ "$status" == "healthy" ]; then
        echo -e "${GREEN}✅ PASÓ${NC} (saludable)"
        ((PASARON++))
    else
        echo -e "${RED}❌ FALLÓ${NC} (estado: $status)"
        ((FALLARON++))
    fi
done
echo ""

# Resumen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMEN DE PRUEBAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Total de Pruebas: $((PASARON + FALLARON))"
echo -e "${GREEN}Pasaron: $PASARON${NC}"
echo -e "${RED}Fallaron: $FALLARON${NC}"
echo ""

if [ $FALLARON -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ TODAS LAS PRUEBAS PASARON - CAPA SMOKE (4 BOTS) LISTA${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "🚀 Listo para proceder a la siguiente capa: TORNEO DE 4 JUGADORES"
    echo "   Ejecutar: npm run deploy:4player"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ ALGUNAS PRUEBAS FALLARON${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Por favor corrige las pruebas fallidas antes de proceder."
    exit 1
fi
