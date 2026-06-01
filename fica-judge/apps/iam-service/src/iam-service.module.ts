import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from './domain/entities/user.entity';
import { IamController } from './infrastructure/controllers/iam.controller';
import { RegisterUserHandler } from './application/commands/register-user.handler';

// Agrupamos los handlers por si a futuro tenemos más (Login, Delete, etc.)
const CommandHandlers = [RegisterUserHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'iam_user',
      password: 'iam_password',
      database: 'iam_db',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [IamController],
  providers: [...CommandHandlers],
})
export class IamServiceModule {}