# ==========================================
# 1. ETAPA DE CONSTRUCCIÓN (BUILDER)
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json tsconfig*.json nest-cli.json ./
RUN npm install

COPY . .
RUN npm run build ranking-service

# ==========================================
# 2. ETAPA DE PRODUCCIÓN (RUNNER)
# ==========================================
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist/apps/ranking-service ./dist

# Asegúrate de que este EXPOSE coincida con el puerto de tu servicio
EXPOSE 3004

CMD ["node", "dist/main.js"]