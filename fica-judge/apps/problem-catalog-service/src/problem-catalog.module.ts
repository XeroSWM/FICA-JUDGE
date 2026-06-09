import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

// 1. Dominio (Esquemas)
import { Problem, ProblemSchema } from './domain/schemas/problem.schema';

// 2. Infraestructura (Controladores)
import { ProblemController } from './infrastructure/controllers/problem.controller';

// 3. Aplicación (Casos de Uso / Handlers)
import { CreateProblemHandler } from './application/commands/create-problem.handler';

// Agrupamos los handlers para mantener el módulo limpio cuando tu aplicación crezca
const CommandHandlers = [CreateProblemHandler];

@Module({
  imports: [
    CqrsModule,
    
    // Conexión dinámica a MongoDB (Compatible con tu docker-compose local y el futuro AWS)
    MongooseModule.forRootAsync({
      useFactory: () => {
        const host = process.env.MONGO_HOST || 'localhost';
        const port = process.env.MONGO_PORT || '27017';
        const user = process.env.MONGO_USER || 'mongo_admin';
        const pass = process.env.MONGO_PASSWORD || 'mongo_secret';
        const db   = process.env.MONGO_DB || 'problem_db';

        return {
          // Cadena de conexión con autenticación
          uri: `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`,
        };
      },
    }),
    
    // Registramos el esquema del problema en el contexto de la base de datos
    MongooseModule.forFeature([{ name: Problem.name, schema: ProblemSchema }]),
  ],
  controllers: [ProblemController], // Recibe las peticiones HTTP
  providers: [...CommandHandlers],  // Ejecuta la lógica de negocio
})
export class ProblemCatalogModule {}