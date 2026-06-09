import { NestFactory } from '@nestjs/core';
import { ProblemCatalogModule } from './problem-catalog.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ProblemCatalogModule);
  // CORS habilitado para pruebas con el Frontend local
  app.enableCors();
  // Validación de datos entrantes
  app.useGlobalPipes(new ValidationPipe());

  // PUERTO 3002 asignado a Problem Catalog
  const PORT = process.env.CATALOG_PORT || 3002;
  await app.listen(PORT);
  Logger.log(`🚀 [Problem Catalog Service] Escuchando en el puerto: ${PORT}`, 'Bootstrap');
}
bootstrap();