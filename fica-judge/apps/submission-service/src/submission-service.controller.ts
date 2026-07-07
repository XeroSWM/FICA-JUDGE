import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SubmissionServiceService } from './submission-service.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';

@Controller('submissions')
export class SubmissionServiceController {
  constructor(
    private readonly submissionService: SubmissionServiceService,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>
  ) {}

  // ==========================================
  // RUTAS HTTP (Frontend -> Backend)
  // ==========================================
  @Post()
  async createSubmission(@Body() payload: any) {
    return this.submissionService.processNewSubmission(payload);
  }

  // 👇 NUEVA RUTA: HISTORIAL POR ESTUDIANTE
  // NOTA: Debe ir ANTES de @Get(':id') para que NestJS no confunda 'history' con un ID.
  @Get('history/:studentId')
  async getHistory(@Param('studentId') studentId: string) {
    return this.submissionService.getHistoryByStudent(studentId);
  }

  @Get(':id')
  async getSubmissionStatus(@Param('id') id: string) {
    const submission = await this.submissionRepository.findOne({ where: { id } });
    if (!submission) {
      return { status: 'NOT_FOUND' };
    }
    return submission;
  }

  // ==========================================
  // WORKER RABBITMQ (Broker -> Sandbox)
  // ==========================================
  @EventPattern('evaluate_code')
  async handleEvaluateCode(@Payload() payload: any) {
    console.log(`📥 Evento recibido desde RabbitMQ para Submission ID: ${payload.submissionId}`);
    
    // Ejecutamos el sandbox con la carga útil recibida
    await this.submissionService.executeSandbox(payload);
  }

  @Post('run')
  async runCodeDirectly(@Body() payload: any) {
    return this.submissionService.executeDirectRun(payload);
  }
}