import { Module } from '@nestjs/common';
import { ProblemCatalogServiceController } from './problem-catalog-service.controller';
import { ProblemCatalogServiceService } from './problem-catalog-service.service';

@Module({
  imports: [],
  controllers: [ProblemCatalogServiceController],
  providers: [ProblemCatalogServiceService],
})
export class ProblemCatalogServiceModule {}
