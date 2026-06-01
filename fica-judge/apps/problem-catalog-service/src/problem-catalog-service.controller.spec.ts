import { Test, TestingModule } from '@nestjs/testing';
import { ProblemCatalogServiceController } from './problem-catalog-service.controller';
import { ProblemCatalogServiceService } from './problem-catalog-service.service';

describe('ProblemCatalogServiceController', () => {
  let problemCatalogServiceController: ProblemCatalogServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProblemCatalogServiceController],
      providers: [ProblemCatalogServiceService],
    }).compile();

    problemCatalogServiceController = app.get<ProblemCatalogServiceController>(ProblemCatalogServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(problemCatalogServiceController.getHello()).toBe('Hello World!');
    });
  });
});
