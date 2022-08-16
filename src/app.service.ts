import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  testRoute(): string {
    return 'Test Route!';
  }
}
