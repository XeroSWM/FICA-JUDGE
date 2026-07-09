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

      // FIX: Respetamos los datos que envía el frontend (body). 
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

  // 🔒 NUEVA RUTA: Historial del usuario
  // ¡IMPORTANTE! Esta ruta debe ir ANTES de @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Get('history/me')
  async getMyHistory(@Req() req: any, @Res() res: Response) {
    try {
      const user = req.user || {};
      const studentId = user.email || user.sub || 'unknown_student';
      
      console.log(`🔍 Buscando historial para: ${studentId}`);

      const response = await firstValueFrom(this.httpService.get(`${this.SUBMISSION_URL}/history/${studentId}`));
      return res.status(200).json(response.data);
    } catch (error: any) {
      console.error("Error al obtener historial:", error.message);
      return res.status(error.response?.status || 500).json({ message: 'Error obteniendo historial' });
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
  @Get('history/:studentId')
  async getStudentHistory(@Param('studentId') studentId: string, @Res() res: Response) {
    try {
      console.log(`🔍 Buscando historial exacto para: ${studentId}`);

      const response = await firstValueFrom(this.httpService.get(`${this.SUBMISSION_URL}/history/${studentId}`));
      return res.status(200).json(response.data);
    } catch (error: any) {
      console.error("Error al obtener historial:", error.message);
      return res.status(error.response?.status || 500).json({ message: 'Error obteniendo historial' });
    }
  }

  // 👇 ==========================================
  // NUEVO PUENTE: CONSULTAR ESTADO DE UN ENVÍO POR ID
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSubmissionById(@Param('id') id: string, @Res() res: Response) {
    try {
      // 1. El Gateway redirige la petición al microservicio
      const response = await firstValueFrom(
        this.httpService.get(`${this.SUBMISSION_URL}/${id}`)
      );
      
      // 2. Si el microservicio responde que no existe
      if (response.data?.status === 'NOT_FOUND') {
        return res.status(404).json({ message: 'Envío no encontrado' });
      }

      // 3. Se lo devolvemos al Frontend
      return res.status(200).json(response.data);
    } catch (error: any) {
      console.error(`Error consultando el envío ${id} en el Gateway:`, error.message);
      return res.status(error.response?.status || 500).json({ 
        message: 'Error al consultar el estado del envío' 
      });
    }
  }
}