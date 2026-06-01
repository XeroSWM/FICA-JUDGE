import { NestFactory } from '@nestjs/core';
import { ProblemCatalogServiceModule } from './problem-catalog-service.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ProblemCatalogServiceModule);
  
  const PORT = process.env.CATALOG_PORT || 3002;
  await app.listen(PORT);
  
  Logger.log(`📚 [Problem Catalog Service] Escuchando en el puerto: ${PORT}`, 'Bootstrap');
}
bootstrap();