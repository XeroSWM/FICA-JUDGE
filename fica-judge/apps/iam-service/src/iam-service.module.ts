import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt'; // <-- NUEVO IMPORT PARA JWT
import { User } from './domain/entities/user.entity';
import { IamController } from './infrastructure/controllers/iam.controller';
import { HealthController } from './infrastructure/controllers/health.controller';
import { RegisterUserHandler } from './application/commands/register-user.handler';
import { LoginUserHandler } from './application/commands/login-user.handler';

const CommandHandlers = [RegisterUserHandler, LoginUserHandler]; 

@Module({
  imports: [
    CqrsModule,
    // <-- REGISTRO DEL MÓDULO JWT
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'TU_CLAVE_SECRETA_FICA_JUDGE_2026', 
      signOptions: { expiresIn: '8h' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      
      // 👇 APLICAMOS LAS CREDENCIALES DEL CONTENEDOR UNIFICADO
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'fica_judge_iam',
      
      entities: [User],
      synchronize: true,
      ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [IamController, HealthController],
  providers: [...CommandHandlers],
})
export class IamServiceModule {}