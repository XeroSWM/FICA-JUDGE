import { Controller, Post, Get, Body, Res, UseGuards, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response, Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class IamController {
  // 👇 AQUÍ SE RESUELVE EL BUG 👇
  // Intenta leer de las variables de entorno, y si no existe (desarrollo local), usa localhost por defecto
  private readonly IAM_URL = process.env.IAM_SERVICE_URL || 'http://localhost:3001/auth';

  constructor(private readonly httpService: HttpService) {}

  @Post('register')
  async register(@Body() body: any, @Res() res: Response) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.IAM_URL}/register`, body)
      );
      return res.status(response.status).json(response.data);
    } catch (error: any) {
      return res
        .status(error.response?.status || 500)
        .json(error.response?.data || { message: 'IAM Service inalcanzable' });
    }
  }

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.IAM_URL}/login`, body)
      );
      return res.status(response.status).json(response.data);
    } catch (error: any) {
      return res
        .status(error.response?.status || 401)
        .json(error.response?.data || { message: 'Credenciales incorrectas o servicio caído' });
    }
  }

  @Post('validate')
  async validateToken(@Body() body: any, @Res() res: Response) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.IAM_URL}/validate`, body)
      );
      return res.status(response.status).json(response.data);
    } catch (error: any) {
      return res
        .status(error.response?.status || 401)
        .json(error.response?.data || { message: 'Token inválido' });
    }
  }
}