import { NestFactory } from '@nestjs/core';
import { AssignmentServiceModule } from './assignment-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AssignmentServiceModule);
  
  // Habilitamos CORS por si lo consultas directo en desarrollo
  app.enableCors();
  
  await app.listen(3005);
  console.log(`🚀 Assignment Service (Deberes y Exámenes) corriendo en http://localhost:3005`);
}
bootstrap();