FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S player -u 1001

# Change ownership
RUN chown -R player:nodejs /app
USER player

# Expose port (will be set via environment variable)
EXPOSE 3001

# Health check - uses PORT environment variable
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "const port=process.env.PORT||3001;import('http').then(h=>h.get('http://127.0.0.1:'+port+'/health', r=>process.exit(r.statusCode===200?0:1)))"

# OCI Labels
LABEL org.opencontainers.image.title="tateti-random-bot" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.description="Random Bot for Ta-Te-Ti (3x3 and 5x5)" \
      org.opencontainers.image.source="https://github.com/your-repo/tateti-arbitro"

# Start the player
CMD ["npm", "start"]