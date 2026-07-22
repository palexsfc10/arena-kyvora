# Arena Admin — imagem deployável (Vite → nginx estático).
# VITE_* são embutidos no bundle em tempo de build. Sem analytics. Sem segredos.

FROM node:22-alpine AS builder

WORKDIR /app

# Defaults target HML. Production builds MUST override both ARGs explicitly.
ARG VITE_API_BASE_URL=https://hml-api.kyvoraapp.com.br
ARG VITE_APP_ENV=staging

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_APP_ENV=${VITE_APP_ENV}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN node scripts/validate-admin-env.mjs \
  && npm run build

FROM nginx:1.27-alpine

# Static SPA only — no build tools, no node_modules, no .env.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx master needs root to bind :80; workers drop to nginx user (image default).
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
