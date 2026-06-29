import { Controller, Get } from '@nestjs/common';
import { RankingServiceService } from './ranking-service.service';

@Controller()
export class RankingServiceController {
  constructor(private readonly rankingServiceService: RankingServiceService) {}

  @Get()
  getHello(): string {
    return this.rankingServiceService.getHello();
  }
}
