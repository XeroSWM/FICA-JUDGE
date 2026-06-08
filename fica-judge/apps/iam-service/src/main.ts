import { NestFactory } from '@nestjs/core';
import { IamServiceModule } from './iam-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(IamServiceModule);
  
  // 1. HABILITAR CORS (Debe ir aquí, antes del listen)
  app.enableCors();

  const PORT = process.env.IAM_PORT || 3001;
  
  // 2. ESCUCHAR EL PUERTO
  await app.listen(PORT);
  
  Logger.log(`🔐 [IAM Service] Escuchando en el puerto: ${PORT}`, 'Bootstrap');
}
bootstrap();