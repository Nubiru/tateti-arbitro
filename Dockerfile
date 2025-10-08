# Construcción multi-etapa para Ta-Te-Ti Arbitrator - Alpine con endurecimiento de seguridad
# @lastModified 2025-10-06
# @version 1.0.0
# @todo Contenedor basado en Alpine listo para producción con endurecimiento de seguridad

# Nota: El frontend se construye localmente y se copia al contenedor
# Esto evita problemas de construcción de Docker con Rollup/Vite en contenedores

# Etapa de construcción - Usar Debian para mejor compatibilidad
FROM node:20-slim AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de paquetes primero para mejor caché
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev) con auditoría de seguridad
RUN npm ci --audit-level=moderate

# Copiar código fuente
COPY . .

# Etapa de producción - Alpine con actualizaciones de seguridad
FROM node:20-alpine AS production

# Actualizar paquetes de Alpine e instalar actualizaciones de seguridad
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de paquetes
COPY package*.json ./

# Instalar solo dependencias de producción con auditoría de seguridad
RUN npm ci --only=production --audit-level=moderate && npm cache clean --force

# Copiar aplicación construida
COPY --from=builder /app/src ./src
COPY --from=builder /app/index.js ./

# Copiar frontend pre-construido (construido localmente)
COPY public ./public

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S arbitrator -u 1001

# Cambiar propiedad del directorio de la aplicación
RUN chown -R arbitrator:nodejs /app
USER arbitrator

# Exponer puerto
EXPOSE 4000

# Verificación de salud
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "import('http').then(http => http.get('http://localhost:4000/api/stream/status', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }))"

# Etiquetas OCI
LABEL org.opencontainers.image.title="tateti-arbitro" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.description="Ta-Te-Ti Arbitrator Backend with Frontend" \
      org.opencontainers.image.source="https://github.com/your-repo/tateti-arbitro"

# Iniciar la aplicación con dumb-init para manejo adecuado de señales
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
