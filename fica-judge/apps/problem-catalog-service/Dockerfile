# 1. Fase de construcción
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Compilamos específicamente este microservicio del monorepo
RUN npm run build problem-catalog-service

# 2. Fase de producción
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
# Copiamos solo los archivos compilados desde la fase anterior
COPY --from=builder /app/dist ./dist

# Exponemos el puerto
EXPOSE 3002

# Ejecutamos el archivo principal del catálogo
CMD ["node", "dist/apps/problem-catalog-service/main"]