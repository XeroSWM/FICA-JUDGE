import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionServiceController } from './submission-service.controller';
import { SubmissionServiceService } from './submission-service.service';
import { Submission } from './entities/submission.entity';
import { MongooseModule } from '@nestjs/mongoose'; 
import { Problem, ProblemSchema } from './schemas/problem.schema'; 

@Module({
  imports: [
    // 1. Conexión a la base de datos exclusiva del Submission Service en el contenedor unificado
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432, // 👈 Puerto centralizado
      username: 'postgres', // 👈 Credenciales unificadas
      password: 'password',
      database: 'fica_judge_submissions', // 👈 Base de datos lógica aislada
      entities: [Submission],
      synchronize: true, 
    }),

    // 2. Registramos la Entidad
    TypeOrmModule.forFeature([Submission]),

    // 3. Conexión a MONGODB (Para leer los casos de prueba secretos)
    MongooseModule.forRoot('mongodb://mongo_admin:mongo_secret@localhost:27017/problem_db?authSource=admin'),
    MongooseModule.forFeature([{ name: Problem.name, schema: ProblemSchema }]),

    // 4. Conexión a RabbitMQ
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
      // MEGÁFONO PARA AVISARLE AL TABLERO DE POSICIONES
      {
        name: 'RANKING_CLIENT', 
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@localhost:5672'],
          queue: 'ranking_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [SubmissionServiceController],
  providers: [SubmissionServiceService],
})
export class SubmissionServiceModule {}