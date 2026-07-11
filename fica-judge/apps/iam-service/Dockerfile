# ==========================================
# 1. ETAPA DE CONSTRUCCIÓN (BUILDER)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copiamos los archivos de configuración desde la raíz del monorepo
COPY package*.json tsconfig*.json nest-cli.json ./

# Instalamos TODAS las dependencias
RUN npm install

# Copiamos todo el código fuente del monorepo
COPY . .

# Compilamos específicamente el microservicio IAM
RUN npm run build iam-service

# ==========================================
# 2. ETAPA DE PRODUCCIÓN (RUNNER)
# ==========================================
FROM node:20-alpine

WORKDIR /usr/src/app

# Copiamos solo el package.json
COPY package*.json ./

# Instalamos SOLO dependencias de producción
RUN npm install --omit=dev

# Traemos SOLO el código compilado de este microservicio
COPY --from=builder /usr/src/app/dist/apps/iam-service ./dist

# Exponemos el puerto
EXPOSE 3001

# Ejecutamos el servicio
CMD ["node", "dist/main.js"]