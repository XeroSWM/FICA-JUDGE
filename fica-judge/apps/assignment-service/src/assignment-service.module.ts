import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentServiceController } from './assignment-service.controller';
import { AssignmentServiceService } from './assignment-service.service';
import { Assignment } from './entities/assignment.entity';
import { AssignmentProgress } from './entities/assignment-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432, 
      username: 'postgres',
      password: 'password',
      database: 'fica_judge_assignments', // 👈 La DB que creamos en el script
      entities: [Assignment, AssignmentProgress],
      synchronize: true, // TypeORM creará las tablas automáticamente
    }),
    TypeOrmModule.forFeature([Assignment, AssignmentProgress]),
  ],
  controllers: [AssignmentServiceController],
  providers: [AssignmentServiceService],
})
export class AssignmentServiceModule {}