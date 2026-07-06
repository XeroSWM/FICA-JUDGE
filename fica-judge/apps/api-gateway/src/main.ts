import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para que el Frontend de React pueda comunicarse
  app.enableCors();
  
  // Prefijo global para todas las rutas: http://localhost:3000/api/...
  app.setGlobalPrefix('api');


  const port = 3000;
  await app.listen(port);
  Logger.log(`🚀 API Gateway corriendo en: http://localhost:${port}/api`);
}
bootstrap();