# Arena Kyvora — deployable image (Next.js standalone).
# Build-time NEXT_PUBLIC_* values are baked into the client bundle.
# Required public ARGs have NO environment defaults — pass them explicitly
# (HML or PRD). Never pass secrets as ARG/ENV.

FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Required — must be provided via --build-arg (no HML/PRD defaults).
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GESTAO_URL
ARG NEXT_PUBLIC_KYVORA_API_BASE_URL
ARG NEXT_PUBLIC_ALLOW_INDEXING
ARG NEXT_PUBLIC_ENABLE_ANALYTICS

# Optional public metadata / analytics IDs (IDs required when analytics=true).
ARG NEXT_PUBLIC_SITE_NAME=Arena Kyvora
ARG NEXT_PUBLIC_WAITLIST_URL=
ARG NEXT_PUBLIC_CONTACT_EMAIL=contato@kyvoraapp.com.br
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=
ARG NEXT_PUBLIC_META_PIXEL_ID=

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME} \
    NEXT_PUBLIC_GESTAO_URL=${NEXT_PUBLIC_GESTAO_URL} \
    NEXT_PUBLIC_KYVORA_API_BASE_URL=${NEXT_PUBLIC_KYVORA_API_BASE_URL} \
    NEXT_PUBLIC_WAITLIST_URL=${NEXT_PUBLIC_WAITLIST_URL} \
    NEXT_PUBLIC_CONTACT_EMAIL=${NEXT_PUBLIC_CONTACT_EMAIL} \
    NEXT_PUBLIC_ENABLE_ANALYTICS=${NEXT_PUBLIC_ENABLE_ANALYTICS} \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID} \
    NEXT_PUBLIC_META_PIXEL_ID=${NEXT_PUBLIC_META_PIXEL_ID} \
    NEXT_PUBLIC_ALLOW_INDEXING=${NEXT_PUBLIC_ALLOW_INDEXING}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Fail closed before baking: missing / localhost / cross-env / indexing-on-HML must not ship.
RUN node scripts/validate-public-env.mjs \
  && npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

CMD ["node", "server.js"]
