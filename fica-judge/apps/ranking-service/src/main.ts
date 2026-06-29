import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RankingServiceModule } from './ranking-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RankingServiceModule);

  // 1. Conectamos los "audífonos" para escuchar a RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
      queue: 'ranking_queue',
      queueOptions: {
        durable: false
      },
    },
  });

  // 2. Encendemos la escucha de eventos en segundo plano
  await app.startAllMicroservices(); 
  
  // 3. Encendemos el puerto HTTP para que el API Gateway pueda pedir la tabla
  await app.listen(process.env.PORT ?? 3004); 
  
  console.log(`🏆 Ranking Service corriendo HTTP en: ${await app.getUrl()}`);
  console.log(`🐰 Ranking Service conectado al Bróker de Mensajería escuchando eventos...`);
}
bootstrap();