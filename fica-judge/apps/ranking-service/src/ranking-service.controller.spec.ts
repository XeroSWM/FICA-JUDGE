import { Test, TestingModule } from '@nestjs/testing';
import { RankingServiceController } from './ranking-service.controller';
import { RankingServiceService } from './ranking-service.service';

describe('RankingServiceController', () => {
  let rankingServiceController: RankingServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RankingServiceController],
      providers: [RankingServiceService],
    }).compile();

    rankingServiceController = app.get<RankingServiceController>(RankingServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(rankingServiceController.getHello()).toBe('Hello World!');
    });
  });
});
