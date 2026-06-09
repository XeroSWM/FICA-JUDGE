import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from './domain/entities/user.entity';
import { IamController } from './infrastructure/controllers/iam.controller';
import { HealthController } from './infrastructure/controllers/health.controller';
import { RegisterUserHandler } from './application/commands/register-user.handler';
import { LoginUserHandler } from './application/commands/login-user.handler'; // <-- 1. IMPORTAR AQUÍ

// <-- 2. AGREGAR AL ARREGLO AQUÍ
const CommandHandlers = [RegisterUserHandler, LoginUserHandler]; 

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'iam_user',
      password: process.env.DB_PASSWORD || 'iam_password',
      database: process.env.DB_NAME || 'iam_db',
      entities: [User],
      synchronize: true,
      // NUEVO: Habilitamos SSL si la variable DB_HOST existe (es decir, estamos en AWS)
      ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [IamController, HealthController],
  providers: [...CommandHandlers],
})
export class IamServiceModule {}