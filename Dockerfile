# Stage 1: Install dependencies menggunakan Node.js resmi berbasis Debian Slim
FROM node:22-slim AS deps
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci

# Stage 2: Build project Next.js
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner (image resmi Node minim paket, bukan install manual dari script pihak ketiga)
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# wget dipakai untuk HEALTHCHECK
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Buat user & group agar tidak berjalan sebagai root (security best practice)
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 -g nodejs nextjs

# Salin hasil standalone build Next.js yang ringan
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./.next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/standalone/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./.next/standalone/public
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Wrapper server.js (structured file logging + uncaughtException/unhandledRejection handling)
COPY --from=builder --chown=nextjs:nodejs /app/logger.js ./logger.js
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./server.js

RUN mkdir -p /data/logs/com/saasno/frontend \
    && chown -R nextjs:nodejs /data/logs/com/saasno/frontend

# Entrypoint bernama docker-entrypoint.sh seperti image resmi lain (Postgres, Redis, ...); perintahnya tetap CMD di bawah
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD sh -c 'wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1'

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]