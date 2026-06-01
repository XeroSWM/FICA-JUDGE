import { Injectable } from '@nestjs/common';

@Injectable()
export class ProblemCatalogServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
