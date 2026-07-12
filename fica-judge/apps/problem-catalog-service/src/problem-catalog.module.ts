import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

// 1. Dominio
import { Problem, ProblemSchema } from './domain/schemas/problem.schema';

// 2. Infraestructura
import { ProblemController } from './infrastructure/controllers/problem.controller';

// 3. Aplicación (Handlers)
import { CreateProblemHandler } from './application/commands/create-problem.handler';
import { GetProblemsHandler } from './application/queries/get-problems.handler'; 

// Agrupamos
const CommandHandlers = [CreateProblemHandler];
const QueryHandlers = [GetProblemsHandler]; 

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forRootAsync({
      useFactory: () => {
        // 👇 CORRECCIÓN: Leemos la URI completa que inyecta Terraform
        // Si no existe (desarrollo local), armamos la de localhost por defecto.
        const uri = process.env.MONGO_URI || 'mongodb://mongo_admin:mongo_secret@localhost:27017/problem_db?authSource=admin';
        
        return {
          uri,
        };
      },
    }),
    MongooseModule.forFeature([{ name: Problem.name, schema: ProblemSchema }]),
  ],
  controllers: [ProblemController],
  providers: [
    ...CommandHandlers, 
    ...QueryHandlers 
  ],
})
export class ProblemCatalogModule {}