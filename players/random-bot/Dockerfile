FROM node:18-alpine

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

# Expose port
EXPOSE 3001

# Health check with ES6 syntax
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "import('http').then(h=>h.get('http://localhost:3001/health', r=>process.exit(r.statusCode===200?0:1)))"

# OCI Labels
LABEL org.opencontainers.image.title="tateti-random-bot" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.description="Random Bot for Ta-Te-Ti (3x3 and 5x5)" \
      org.opencontainers.image.source="https://github.com/your-repo/tateti-arbitro"

# Start the player
CMD ["npm", "start"]
