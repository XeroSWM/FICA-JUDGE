import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IamController } from './proxy/iam.controller'; // 👈 Importamos el nuevo controlador
import { CatalogController } from './proxy/catalog.controller';
import { SubmissionController } from './proxy/submission.controller';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [
    IamController, // 👈 Registramos el proxy de autenticación
    CatalogController,
    SubmissionController,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}