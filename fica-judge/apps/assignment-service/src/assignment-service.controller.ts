import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AssignmentServiceService } from './assignment-service.service';
import { Assignment } from './entities/assignment.entity';

@Controller('assignments')
export class AssignmentServiceController {
  constructor(private readonly assignmentService: AssignmentServiceService) {}

  @Post()
  async createAssignment(@Body() data: Partial<Assignment>) {
    return this.assignmentService.createAssignment(data);
  }

  @Get()
  async getAll() {
    return this.assignmentService.getAllAssignments();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.assignmentService.getAssignmentById(id);
  }

  @Post('attempt')
  async recordAttempt(
    @Body('studentId') studentId: string,
    @Body('assignmentId') assignmentId: string,
    @Body('problemId') problemId: string,
    @Body('isSuccess') isSuccess: boolean,
  ) {
    return this.assignmentService.recordAttempt(studentId, assignmentId, problemId, isSuccess);
  }
}