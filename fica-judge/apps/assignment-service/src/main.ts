import { NestFactory } from '@nestjs/core';
import { AssignmentServiceModule } from './assignment-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AssignmentServiceModule);
  
  // Habilitar CORS si es necesario comunicarse directo, o dejarlo solo para el Gateway
  app.enableCors();
  
  // Asignamos el puerto 3005
  await app.listen(3005);
  console.log(`📚 Assignment Service corriendo en: http://localhost:3005`);
}
bootstrap();