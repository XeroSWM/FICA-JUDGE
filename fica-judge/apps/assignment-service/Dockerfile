# ==========================================
# 1. ETAPA DE CONSTRUCCIÓN (BUILDER)
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copiamos los archivos de configuración desde la raíz del monorepo
COPY package*.json tsconfig*.json nest-cli.json ./

# Instalamos TODAS las dependencias de desarrollo y producción
RUN npm install

# Copiamos todo el código fuente del monorepo
COPY . .

# Compilamos específicamente el microservicio de asignaciones
RUN npm run build assignment-service

# ==========================================
# 2. ETAPA DE PRODUCCIÓN (RUNNER)
# ==========================================
FROM node:18-alpine

WORKDIR /usr/src/app

# Copiamos solo el package.json para las dependencias finales
COPY package*.json ./

# Instalamos SOLO dependencias de producción para mantener la imagen ligera
RUN npm install --omit=dev

# Traemos SOLO el código compilado de este microservicio
COPY --from=builder /usr/src/app/dist/apps/assignment-service ./dist

# Exponemos el puerto en el que corre tu servicio de deberes y exámenes
EXPOSE 3005

# Ejecutamos el punto de entrada del microservicio
CMD ["node", "dist/main.js"]