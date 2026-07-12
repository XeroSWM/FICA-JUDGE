# ==========================================
# 1. ETAPA DE CONSTRUCCIÓN (BUILDER)
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json tsconfig*.json nest-cli.json ./
RUN npm install

COPY . .
RUN npm run build api-gateway

# ==========================================
# 2. ETAPA DE PRODUCCIÓN (RUNNER)
# ==========================================
FROM node:18-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist/apps/api-gateway ./dist

# El Gateway normalmente corre en el puerto 3000
EXPOSE 3000

CMD ["node", "dist/main.js"]