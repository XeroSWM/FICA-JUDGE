import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionServiceController } from './submission-service.controller';
import { SubmissionServiceService } from './submission-service.service';
import { Submission } from './entities/submission.entity';
import { MongooseModule } from '@nestjs/mongoose'; // 👈 Importamos Mongoose
import { Problem, ProblemSchema } from './schemas/problem.schema'; // 👈 Importamos el esquema

@Module({
  imports: [
    // 1. Conexión a la nueva base de datos exclusiva del Submission Service
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433, // 👈 Puerto actualizado para coincidir con el docker-compose
      username: 'submission_user', 
      password: 'submission_password', 
      database: 'submission_db', 
      entities: [Submission],
      synchronize: true, // TypeORM creará la tabla 'submissions' automáticamente
    }),

    // 2. Registramos la Entidad
    TypeOrmModule.forFeature([Submission]),

    // 2. Conexión a MONGODB (Para leer los casos de prueba secretos)
    MongooseModule.forRoot('mongodb://mongo_admin:mongo_secret@localhost:27017/problem_db?authSource=admin'),
    MongooseModule.forFeature([{ name: Problem.name, schema: ProblemSchema }]),

    // 3. Conexión a RabbitMQ
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@localhost:5672'],
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