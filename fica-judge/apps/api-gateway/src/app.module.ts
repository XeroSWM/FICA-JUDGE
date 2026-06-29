import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IamController } from './proxy/iam.controller'; // 👈 Importamos el nuevo controlador
import { CatalogController } from './proxy/catalog.controller';
import { SubmissionController } from './proxy/submission.controller';

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
  providers: [],
})
export class AppModule {}