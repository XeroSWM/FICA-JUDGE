import { Controller, Post, Get, Body, Param, Res, UseGuards, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response, Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@Controller('submissions')
export class SubmissionController {
  private readonly SUBMISSION_URL = 'http://localhost:3003/submissions';

  constructor(private readonly httpService: HttpService) {}

  // 🔒 PROTEGEMOS ESTA RUTA CON EL JWT
  @UseGuards(JwtAuthGuard)
  @Post()
  async createSubmission(@Body() body: any, @Req() req: any, @Res() res: Response) {
    try {
      const user = req.user || {}; 

      // 👇 FIX: Respetamos los datos que envía el frontend (body). 
      // Si por alguna razón el frontend falla, usamos el JWT (user) como plan B.
      const payloadSeguro = {
        ...body,
        studentId: body.studentId || user.email || user.sub || 'unknown_student',
        name: body.name || user.firstName || 'Estudiante FICA'
      };

      console.log('🚀 GATEWAY ENVIANDO AL MICROSERVICIO:', payloadSeguro);

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