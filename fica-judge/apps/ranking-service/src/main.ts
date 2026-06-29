import { NestFactory } from '@nestjs/core';
import { RankingServiceModule } from './ranking-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RankingServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
