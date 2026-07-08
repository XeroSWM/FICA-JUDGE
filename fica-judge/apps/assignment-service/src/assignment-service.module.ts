import { Module } from '@nestjs/common';
import { AssignmentServiceController } from './assignment-service.controller';
import { AssignmentServiceService } from './assignment-service.service';

@Module({
  imports: [],
  controllers: [AssignmentServiceController],
  providers: [AssignmentServiceService],
})
export class AssignmentServiceModule {}
