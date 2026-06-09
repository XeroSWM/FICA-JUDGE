import { Controller, Get } from '@nestjs/common';

@Controller() // Al no poner nada, escucha en la ruta raíz "/"
export class HealthController {
  @Get()
  healthCheck(): string {
    return 'IAM Service is healthy and running in AWS!';
  }
}