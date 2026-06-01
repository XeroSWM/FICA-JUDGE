import { Controller, Get } from '@nestjs/common';
import { ProblemCatalogServiceService } from './problem-catalog-service.service';

@Controller()
export class ProblemCatalogServiceController {
  constructor(private readonly problemCatalogServiceService: ProblemCatalogServiceService) {}

  @Get()
  getHello(): string {
    return this.problemCatalogServiceService.getHello();
  }
}
