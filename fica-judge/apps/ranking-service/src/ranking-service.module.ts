import { Module } from '@nestjs/common';
import { RankingServiceController } from './ranking-service.controller';
import { RankingServiceService } from './ranking-service.service';

@Module({
  imports: [],
  controllers: [RankingServiceController],
  providers: [RankingServiceService],
})
export class RankingServiceModule {}
