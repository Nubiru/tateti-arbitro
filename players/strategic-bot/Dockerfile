FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

RUN addgroup -g 1001 -S nodejs
RUN adduser -S player -u 1001
RUN chown -R player:nodejs /app
USER player

EXPOSE 3004

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "const port=process.env.PORT||3004;import('http').then(h=>h.get('http://127.0.0.1:'+port+'/health', r=>process.exit(r.statusCode===200?0:1)))"

LABEL org.opencontainers.image.title="tateti-strategic-bot" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.description="Strategic Bot for Ta-Te-Ti (Turn-based positional algorithm)" \
      org.opencontainers.image.source="https://github.com/your-repo/tateti-arbitro"

CMD ["npm", "start"]

