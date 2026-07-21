# Arena Kyvora — production / HML image (Next.js standalone).
# Build-time NEXT_PUBLIC_* values are baked into the client bundle.

FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

ARG NEXT_PUBLIC_SITE_URL=https://hml-arena.kyvoraapp.com.br
ARG NEXT_PUBLIC_SITE_NAME=Arena Kyvora
ARG NEXT_PUBLIC_GESTAO_URL=https://hml.kyvoraapp.com.br
ARG NEXT_PUBLIC_KYVORA_API_BASE_URL=https://hml-api.kyvoraapp.com.br
ARG NEXT_PUBLIC_WAITLIST_URL=
ARG NEXT_PUBLIC_CONTACT_EMAIL=contato@kyvoraapp.com.br
ARG NEXT_PUBLIC_ENABLE_ANALYTICS=false
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=
ARG NEXT_PUBLIC_META_PIXEL_ID=

ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME} \
    NEXT_PUBLIC_GESTAO_URL=${NEXT_PUBLIC_GESTAO_URL} \
    NEXT_PUBLIC_KYVORA_API_BASE_URL=${NEXT_PUBLIC_KYVORA_API_BASE_URL} \
    NEXT_PUBLIC_WAITLIST_URL=${NEXT_PUBLIC_WAITLIST_URL} \
    NEXT_PUBLIC_CONTACT_EMAIL=${NEXT_PUBLIC_CONTACT_EMAIL} \
    NEXT_PUBLIC_ENABLE_ANALYTICS=${NEXT_PUBLIC_ENABLE_ANALYTICS} \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID} \
    NEXT_PUBLIC_META_PIXEL_ID=${NEXT_PUBLIC_META_PIXEL_ID}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Fail closed before baking: empty / localhost / prod-on-HML must not ship.
RUN node scripts/validate-public-env.mjs \
  && npm run build

FROM node:20-alpine AS runner
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

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

CMD ["node", "server.js"]
