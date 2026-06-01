# ==========================================
# ETAPA 1: Construcción (Builder)
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copiar manifiestos de dependencias
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# Copiar el código fuente completo
COPY apps/ ./apps/
COPY libs/ ./libs/

# ARG para definir qué aplicación construir (ej. iam-service)
ARG APP_MAIN_FILE
RUN npm run build ${APP_MAIN_FILE}

# ==========================================
# ETAPA 2: Producción (Runner)
# ==========================================
FROM node:18-alpine

WORKDIR /usr/src/app

# Variable de entorno de producción por defecto
ENV NODE_ENV=production

# Copiar dependencias y compilar solo para producción
COPY package*.json ./
RUN npm ci --only=production

# Obtener el nombre de la app a través de ARG para saber qué carpeta de dist/ copiar
ARG APP_MAIN_FILE
COPY --from=builder /usr/src/app/dist/apps/${APP_MAIN_FILE} ./dist/apps/${APP_MAIN_FILE}
COPY --from=builder /usr/src/app/dist/libs ./dist/libs

# Configurar un usuario sin privilegios por seguridad (Rootless Docker)
USER node

# Iniciar el microservicio específico
CMD node dist/apps/${APP_NAME}/main.js