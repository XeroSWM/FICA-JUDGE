import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SubmissionServiceModule } from './submission-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 1. Crear la aplicación HTTP base (para los POST del frontend)
  const app = await NestFactory.create(SubmissionServiceModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  // 2. Conectar la capa de Microservicio con RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      // Forzamos la conexión con las credenciales por defecto
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'submissions_queue',
      queueOptions: {
        durable: true, // La cola sobrevive si RabbitMQ se reinicia
      },
    },
  });

  // 3. Iniciar ambos mundos (HTTP y Eventos) simultáneamente
  await app.startAllMicroservices();
  await app.listen(3003);
  console.log('🚀 Motor de Evaluación corriendo en http://localhost:3003');
}
bootstrap();