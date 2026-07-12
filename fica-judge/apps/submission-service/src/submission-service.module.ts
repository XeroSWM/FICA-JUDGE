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
    // 1. Conexión a POSTGRESQL (Dinámica)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'fica_judge_submissions',
      entities: [Submission],
      synchronize: true, 
      ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
    }),

    // 2. Registramos la Entidad
    TypeOrmModule.forFeature([Submission]),

    // 3. Conexión a MONGODB (Dinámica)
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://mongo_admin:mongo_secret@localhost:27017/problem_db?authSource=admin'
    ),
    MongooseModule.forFeature([{ name: Problem.name, schema: ProblemSchema }]),

    // 4. Conexión a RABBITMQ (Dinámica)
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT', 
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
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
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
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