import { Controller, Get, Post, Body, Param, Res, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Ajusta la ruta de tu guard si es necesario

@Controller('assignments')
export class AssignmentController {
  // 👇 Aquí aplicamos la lectura dinámica desde tu archivo .env
  private readonly ASSIGNMENT_URL = process.env.ASSIGNMENT_SERVICE_URL || 'http://localhost:3005/assignments';

  constructor(private readonly httpService: HttpService) {}

  // ==========================================
  // CREAR UN DEBER/EXAMEN (Solo profesores/admin)
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Post()
  async createAssignment(@Body() body: any, @Res() res: Response) {
    try {
      const response = await firstValueFrom(this.httpService.post(this.ASSIGNMENT_URL, body));
      return res.status(201).json(response.data);
    } catch (error: any) {
      return res.status(error.response?.status || 500).json(error.response?.data || { message: 'Error conectando al Assignment Service' });
    }
  }

  // ==========================================
  // LISTAR TODOS LOS DEBERES Y EXÁMENES
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllAssignments(@Res() res: Response) {
    try {
      const response = await firstValueFrom(this.httpService.get(this.ASSIGNMENT_URL));
      return res.status(200).json(response.data);
    } catch (error: any) {
      return res.status(error.response?.status || 500).json({ message: 'Error obteniendo asignaciones' });
    }
  }

  // ==========================================
  // OBTENER UNO ESPECÍFICO (Aquí se validan las fechas)
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getAssignmentById(@Param('id') id: string, @Res() res: Response) {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.ASSIGNMENT_URL}/${id}`));
      return res.status(200).json(response.data);
    } catch (error: any) {
      // Si el microservicio dice que está fuera de fecha (403), pasamos ese error al frontend
      return res.status(error.response?.status || 500).json(error.response?.data || { message: 'Error consultando la asignación' });
    }
  }

  // ==========================================
  // REGISTRAR UN INTENTO (Suma fallos o calcula nota)
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Post('attempt')
  async recordAttempt(@Body() body: any, @Res() res: Response) {
    try {
      const response = await firstValueFrom(this.httpService.post(`${this.ASSIGNMENT_URL}/attempt`, body));
      return res.status(200).json(response.data);
    } catch (error: any) {
      return res.status(error.response?.status || 500).json(error.response?.data || { message: 'Error registrando el intento' });
    }
  }
}