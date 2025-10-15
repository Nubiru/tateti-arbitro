# Ta-Te-Ti Arbitro

Sistema de arbitraje para partidas de Ta-Te-Ti entre bots HTTP con descubrimiento dinámico de jugadores, interfaz web en tiempo real y soporte para torneos.

[![Node.js Version](https://img.shields.io/badge/node-20.x.x-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/tests-passing-green.svg)](https://github.com)

## 🏗️ Arquitectura del Sistema

```
Frontend (React 18) ◄──► Backend (Express 5) ◄──► Bots HTTP
     :5173/:4000              :4000                 :3001+
                                  │
                                  ▼
                        Descubrimiento Híbrido
                        (Docker API + Vercel API)
```

**Componentes Principales:**
- **Frontend**: React 18 con SSE para actualizaciones en tiempo real
- **Backend**: Express 5 con arbitraje y descubrimiento híbrido de bots
- **Bots**: 3 estrategias (Random, Smart, Strategic) + Vercel bots
- **Discovery**: Docker API + Vercel API para descubrimiento automático
- **Servicios**: GameOptionsService y PlayerService para gestión centralizada

## 🚀 Inicio Rápido

¿Primera vez? Comienza aquí:

1. **Instalar dependencias**:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Ejecutar sistema**:
   ```bash
   npm run dev:smoke
   ```

3. **Verificar funcionamiento**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000

📖 **[Guía Completa de Inicio Rápido →](Inicio-Rapido)**

## 📚 Navegación de la Wiki

### Para Desarrolladores
- **[Desarrollo](Desarrollo)** - Flujo de trabajo diario y TDD
- **[Testing y Calidad](Testing-y-Calidad)** - Estrategia de 3 capas
- **[Docker y Despliegue](Docker-y-Despliegue)** - Containerización y deployment

### Para Usuarios
- **[Bots y Jugadores](Bots-y-Jugadores)** - Sistema de bots y descubrimiento
- **[API Reference](API-Reference)** - Endpoints y ejemplos
- **[Cookbook](Cookbook)** - Recetas y ejemplos prácticos

## 🎯 Características Principales

- **Descubrimiento Automático**: Detecta bots sin configuración manual
- **Tiempo Real**: Actualizaciones instantáneas via Server-Sent Events
- **Escalabilidad**: Soporte para 2-16 jugadores
- **Híbrido**: Bots locales (Docker) + cloud (Vercel)
- **TDD Obligatorio**: Desarrollo guiado por pruebas
- **Calidad Garantizada**: Validación en 3 capas

## 🤖 Tipos de Bots

| Bot | Estrategia | Nivel | Uso |
|-----|-----------|-------|-----|
| **RandomBot** | Movimientos aleatorios | Principiante | Validación |
| **SmartBot** | WIN→BLOCK→CENTER | Intermedio | Partidas balanceadas |
| **StrategicBot** | Posicional por turnos | Avanzado | Torneos |

## 🌐 Soporte Multiplataforma

- **Desarrollo**: Hot-reload con Vite
- **Docker**: Ambiente production-ready
- **Vercel**: Bots serverless en la nube
- **Railway/Render**: Backend en la nube

## 📊 Estado del Proyecto

- **Versión**: 1.0.0
- **Node.js**: 20 LTS
- **Cobertura**: ≥85%
- **Tests**: Unitarios + Integración
- **Licencia**: ISC

---

**¿Necesitas ayuda?** Consulta el [Cookbook](Cookbook) para ejemplos prácticos o la [API Reference](API-Reference) para detalles técnicos.
