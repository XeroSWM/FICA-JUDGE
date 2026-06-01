import { Test, TestingModule } from '@nestjs/testing';
import { SharedContractsService } from './shared-contracts.service';

describe('SharedContractsService', () => {
  let service: SharedContractsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedContractsService],
    }).compile();

    service = module.get<SharedContractsService>(SharedContractsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
