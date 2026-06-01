import { NestFactory } from '@nestjs/core';
import { ProblemCatalogServiceModule } from './problem-catalog-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProblemCatalogServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
