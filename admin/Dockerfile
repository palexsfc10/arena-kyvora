# Arena Admin — imagem de produção (Vite build servido via nginx estático).
# Valores VITE_* são embutidos no bundle em tempo de build.

FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=https://api.kyvoraapp.com.br
ARG VITE_APP_ENV=production
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_APP_ENV=${VITE_APP_ENV}

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
