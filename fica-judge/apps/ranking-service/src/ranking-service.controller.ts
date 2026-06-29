import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RankingService } from './ranking-service.service';

@Controller('ranking')
export class RankingServiceController {
  constructor(private readonly rankingService: RankingService) {}

  // 🌐 ENDPOINT HTTP: Responde al API Gateway cuando React pide la tabla
  @Get('leaderboard')
  async getLeaderboard() {
    return this.rankingService.getLeaderboard();
  }

  // 🐰 EVENT LISTENER: Escucha silenciosamente a RabbitMQ en segundo plano
  @EventPattern('submission_evaluated')
  async handleSubmissionEvaluated(@Payload() data: any) {
    console.log('🏆 Evento recibido desde RabbitMQ:', data);
    await this.rankingService.processSubmissionEvent(data);
  }
}