import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from './domain/entities/user.entity';

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
      entities: [User], // <-- Registramos la entidad explícitamente aquí
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]), // <-- Y la preparamos para usarla en los repositorios
  ],
  controllers: [], // Vacío por ahora, los crearemos en infrastructure/
  providers: [],
})
export class IamServiceModule {}