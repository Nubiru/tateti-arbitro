# Ta-Te-Ti Arbitrator Backend - Production Ready
# @lastModified 2025-10-08
# @version 1.0.0
# Node.js 20 LTS - Alpine Linux con endurecimiento de seguridad

FROM node:20-alpine

# Actualizar paquetes de Alpine e instalar herramientas necesarias
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S arbitrator -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de paquetes
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production --audit-level=moderate && \
    npm cache clean --force

# Copiar código fuente del backend
COPY src ./src
COPY index.js ./

# Copiar frontend pre-construido (construido localmente con npm run build:frontend)
COPY public ./public

# Cambiar propiedad del directorio
RUN chown -R arbitrator:nodejs /app

# Cambiar a usuario no-root
USER arbitrator

# Exponer puerto
EXPOSE 4000

# Verificación de salud
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "import('http').then(h=>h.get('http://localhost:4000/api/stream/status', r=>process.exit(r.statusCode===200?0:1)))"

# Etiquetas OCI
LABEL org.opencontainers.image.title="tateti-arbitro" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.description="Ta-Te-Ti Arbitrator Backend" \
      org.opencontainers.image.source="https://github.com/your-repo/tateti-arbitro"

# Iniciar aplicación con dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
