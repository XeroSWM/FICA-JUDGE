import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IamController } from './proxy/iam.controller'; // 👈 Importamos el nuevo controlador
import { CatalogController } from './proxy/catalog.controller';
import { SubmissionController } from './proxy/submission.controller';
import { JwtStrategy } from './auth/jwt.strategy';
import { RankingController } from './proxy/ranking.controller';
import { AssignmentController } from './proxy/assignment.controller';

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
    AssignmentController,
    RankingController,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}