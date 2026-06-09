import { NestFactory } from '@nestjs/core';
import { IamServiceModule } from './iam-service.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Creamos la aplicación NestJS
  const app = await NestFactory.create(IamServiceModule);
  // 1. Habilitar CORS para permitir peticiones desde el S3 Frontend
  // Al dejarlo así, permites el origen de tu bucket S3 o cualquier otro que intente conectar
  app.enableCors({
    origin: '*', // En un entorno de producción estricto, aquí pondrías la URL de tu bucket S3
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Opcional pero recomendado: Validación automática de datos (DTOs)
  // Esto asegura que los datos que vienen del frontend cumplan con los formatos esperados
  app.useGlobalPipes(new ValidationPipe());

  // 3. Configuración del puerto dinámico (para entornos Cloud)
  const PORT = process.env.IAM_PORT || 3001;
  // 4. Iniciar el servicio
  await app.listen(PORT);
  Logger.log(`🚀 [IAM Service] Escuchando en el puerto: ${PORT}`, 'Bootstrap');
  Logger.log(`🌍 [CORS] Habilitado globalmente`, 'Bootstrap');
}

// Ejecutar el bootstrap
bootstrap().catch((err) => {
  Logger.error(`❌ [IAM Service] Error al iniciar: ${err}`, 'Bootstrap');
});
