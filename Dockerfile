FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-bookworm-slim AS builder
WORKDIR /app
ARG APP_URL
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
ENV APP_URL=$APP_URL NEXT_PUBLIC_APP_URL=$APP_URL NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN export NEXT_DEPLOYMENT_ID="$(date +%Y%m%d%H%M%S)" && npx prisma generate && npm run build

FROM deps AS prod-deps
RUN npm prune --omit=dev

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./prisma7.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules
RUN mkdir -p public/uploads storage/cv \
  && chown -R nextjs:nodejs public/uploads storage
USER nextjs
EXPOSE 8185
ENV PORT=8185
ENV HOSTNAME=0.0.0.0
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
