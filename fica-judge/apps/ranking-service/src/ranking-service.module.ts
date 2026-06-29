import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingServiceController } from './ranking-service.controller';
import { RankingService } from './ranking-service.service';
import { Ranking, RankingSchema } from './schemas/ranking.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/fica_judge_ranking'),
    MongooseModule.forFeature([{ name: Ranking.name, schema: RankingSchema }]),
  ],
  controllers: [RankingServiceController],
  providers: [RankingService],
})
export class RankingServiceModule {}