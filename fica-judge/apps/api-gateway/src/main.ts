import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  
  // Prefijo global para la API
  app.setGlobalPrefix('api/v1');
  
  // Habilitar CORS para el Frontend
  app.enableCors();

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  
  Logger.log(`🚀 [API Gateway] Ejecutándose en: http://localhost:${PORT}/api/v1`, 'Bootstrap');
}
bootstrap();