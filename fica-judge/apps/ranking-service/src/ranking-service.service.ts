import { Injectable } from '@nestjs/common';

@Injectable()
export class RankingServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
