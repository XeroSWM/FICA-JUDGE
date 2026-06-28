import { Controller, Post, Body } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SubmissionServiceService } from './submission-service.service';

@Controller('submissions')
export class SubmissionServiceController {
  constructor(private readonly submissionService: SubmissionServiceService) {}

  @Post()
  async submitCode(@Body() submissionData: any) {
    console.log('🌐 API: Recibiendo petición HTTP del frontend');
    return this.submissionService.processNewSubmission(submissionData);
  }

  @EventPattern('evaluate_code')
  async handleEvaluateCodeEvent(@Payload() data: any) {
    await this.submissionService.executeSandbox(data);
  }
}