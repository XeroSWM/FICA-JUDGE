import { Injectable } from '@nestjs/common';

@Injectable()
export class AssignmentServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
