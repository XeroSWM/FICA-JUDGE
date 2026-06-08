import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from './domain/entities/user.entity';
import { IamController } from './infrastructure/controllers/iam.controller';
import { HealthController } from './infrastructure/controllers/health.controller'; // IMPORTANTE: Importar el nuevo controlador
import { RegisterUserHandler } from './application/commands/register-user.handler';

// Agrupamos los handlers por si a futuro tenemos más (Login, Delete, etc.)
const CommandHandlers = [RegisterUserHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      // Leemos las variables inyectadas por Terraform en AWS. 
      // Si no existen (ej. en tu PC), usa localhost por defecto.
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'iam_user',
      password: process.env.DB_PASSWORD || 'iam_password',
      database: process.env.DB_NAME || 'iam_db',
      entities: [User],
      synchronize: true, // Mantenemos true para facilitar las pruebas en QA
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [IamController, HealthController], // IMPORTANTE: Añadir el HealthController aquí
  providers: [...CommandHandlers],
})
export class IamServiceModule {}