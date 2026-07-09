import { Controller, Get } from '@nestjs/common';
import { AssignmentServiceService } from './assignment-service.service';

@Controller()
export class AssignmentServiceController {
  constructor(private readonly assignmentServiceService: AssignmentServiceService) {}

  @Get()
  getHello(): string {
    return this.assignmentServiceService.getHello();
  }
}
