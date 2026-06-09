import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

// 1. Dominio
import { Problem, ProblemSchema } from './domain/schemas/problem.schema';

// 2. Infraestructura
import { ProblemController } from './infrastructure/controllers/problem.controller';

// 3. Aplicación (Handlers)
import { CreateProblemHandler } from './application/commands/create-problem.handler';
import { GetProblemsHandler } from './application/queries/get-problems.handler'; // <--- IMPORTA AQUÍ

// Agrupamos
const CommandHandlers = [CreateProblemHandler];
const QueryHandlers = [GetProblemsHandler]; // <--- NUEVO ARREGLO DE QUERIES

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forRootAsync({
      useFactory: () => {
        const host = process.env.MONGO_HOST || 'localhost';
        const port = process.env.MONGO_PORT || '27017';
        const user = process.env.MONGO_USER || 'mongo_admin';
        const pass = process.env.MONGO_PASSWORD || 'mongo_secret';
        const db   = process.env.MONGO_DB || 'problem_db';
        return {
          uri: `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`,
        };
      },
    }),
    MongooseModule.forFeature([{ name: Problem.name, schema: ProblemSchema }]),
  ],
  controllers: [ProblemController],
  providers: [
    ...CommandHandlers, 
    ...QueryHandlers // <--- AGREGADO AQUÍ
  ],
})
export class ProblemCatalogModule {}