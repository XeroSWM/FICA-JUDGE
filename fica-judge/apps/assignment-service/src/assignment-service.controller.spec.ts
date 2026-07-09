import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentServiceController } from './assignment-service.controller';
import { AssignmentServiceService } from './assignment-service.service';

describe('AssignmentServiceController', () => {
  let assignmentServiceController: AssignmentServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentServiceController],
      providers: [AssignmentServiceService],
    }).compile();

    assignmentServiceController = app.get<AssignmentServiceController>(AssignmentServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(assignmentServiceController.getHello()).toBe('Hello World!');
    });
  });
});
