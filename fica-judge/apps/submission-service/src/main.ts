// 👇 INYECCIÓN GLOBAL DE CRYPTO (Solución al bug de Webpack + Mongo)
import * as crypto from 'crypto';
(global as any).crypto = crypto;

import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SubmissionServiceModule } from './submission-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 1. Crear la aplicación HTTP base (para los POST del frontend)
  const app = await NestFactory.create(SubmissionServiceModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  // 2. Conectar la capa de Microservicio con RabbitMQ (Conexión Dinámica)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      // 👇 Lee la variable de AWS, o usa localhost como respaldo para desarrollo
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
      queue: 'submissions_queue',
      queueOptions: {
        durable: true, // La cola sobrevive si RabbitMQ se reinicia
      },
    },
  });

  // 3. Iniciar ambos mundos (HTTP y Eventos) simultáneamente
  await app.startAllMicroservices();
  
  // 👇 Asignación de puerto dinámico
  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`🚀 Motor de Evaluación corriendo en el puerto: ${port}`);
}
bootstrap();