import { Controller, Post, Get, Body, Param, Res, UseGuards, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response, Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // 👈 Importamos al guardia

@Controller('submissions')
export class SubmissionController {
  private readonly SUBMISSION_URL = 'http://localhost:3003/submissions';

  constructor(private readonly httpService: HttpService) {}

  // 🔒 PROTEGEMOS ESTA RUTA CON EL JWT
  @UseGuards(JwtAuthGuard)
  @Post()
  async createSubmission(@Body() body: any, @Req() req: any, @Res() res: Response) {
    try {
      // Como pasó el Guardia, req.user tiene los datos del JWT descifrados
      const user = req.user; 

      // INYECCIÓN SEGURA: Reemplazamos cualquier cosa que el frontend intente mandar
      // como 'studentId' por el correo/ID real del usuario logueado.
      const payloadSeguro = {
        ...body,
        studentId: user.email // O user.userId, dependiendo de qué quieres guardar en Postgres
      };

      const response = await firstValueFrom(this.httpService.post(this.SUBMISSION_URL, payloadSeguro));
      return res.status(response.status).json(response.data);
    } catch (error: any) {
      return res.status(error.response?.status || 500).json(error.response?.data || { message: 'Submission Service inalcanzable' });
    }
  }

  // 🔒 PROTEGEMOS LA EJECUCIÓN DIRECTA
  @UseGuards(JwtAuthGuard)
  @Post('run')
  async runCodeDirectly(@Body() body: any, @Res() res: Response) {
    try {
      const response = await firstValueFrom(this.httpService.post(`${this.SUBMISSION_URL}/run`, body));
      return res.status(response.status).json(response.data);
    } catch (error: any) {
      return res.status(error.response?.status || 500).json(error.response?.data || { message: 'Error en la ejecución directa' });
    }
  }

  // 🔒 PROTEGEMOS LA CONSULTA DE RESULTADOS
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSubmissionStatus(@Param('id') id: string, @Res() res: Response) {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.SUBMISSION_URL}/${id}`));
      return res.status(response.status).json(response.data);
    } catch (error: any) {
      return res.status(error.response?.status || 404).json(error.response?.data || { message: 'Envío no encontrado' });
    }
  }
}