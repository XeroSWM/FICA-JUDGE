import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ranking')
export class RankingController {
  private readonly RANKING_URL = 'http://localhost:3004/ranking';

  constructor(private readonly httpService: HttpService) {}

  // Obtener la tabla de posiciones global (Ruta protegida para usuarios logueados)
  @UseGuards(JwtAuthGuard)
  @Get('leaderboard')
  async getLeaderboard(@Res() res: Response) {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.RANKING_URL}/leaderboard`));
      return res.status(response.status).json(response.data);
    } catch (error: any) {
      return res.status(error.response?.status || 500).json(
        error.response?.data || { message: 'Servicio de clasificación inalcanzable' }
      );
    }
  }
}