import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SubmissionServiceController } from './submission-service.controller';
import { SubmissionServiceService } from './submission-service.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          // Forzamos la conexión para enviar mensajes a la cola
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'submissions_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [SubmissionServiceController],
  providers: [SubmissionServiceService],
})
export class SubmissionServiceModule {}