import { NestFactory } from '@nestjs/core';
import { RankingServiceModule } from './ranking-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RankingServiceModule);
  
  // Asignamos el puerto 3004 para el servicio de clasificación
  await app.listen(process.env.PORT ?? 3004);
  console.log(`🏆 Ranking Service corriendo en: ${await app.getUrl()}`);
}
bootstrap();