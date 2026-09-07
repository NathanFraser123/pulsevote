FROM node:22-alpine3.20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine3.20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Create non-root user and group
RUN addgroup -S nodegrp && adduser -S nodeuser -G nodegrp

# Copy dependencies and application files with correct ownership
COPY --chown=nodeuser:nodegrp --from=deps /app/node_modules ./node_modules
COPY --chown=nodeuser:nodegrp . .

USER nodeuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+ (process.env.PORT||5000) +'/health', r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]