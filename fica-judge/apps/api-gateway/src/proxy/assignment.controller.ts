import { Controller, Get, Post, Body, Param, Res, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Ajusta la ruta de tu guard si es necesario

@Controller('assignments')
export class AssignmentController {
  // 👇 Direcciones dinámicas desde tu archivo .env
  private readonly ASSIGNMENT_URL = process.env.ASSIGNMENT_SERVICE_URL || 'http://localhost:3005/assignments';
  private readonly CATALOG_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:3002/problems';

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
  // OBTENER UNO ESPECÍFICO (Fusión de Postgres + Mongo)
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getAssignmentById(@Param('id') id: string, @Res() res: Response) {
    try {
      // 1. Traemos las reglas del examen desde el nuevo microservicio (Postgres)
      const assignmentResponse = await firstValueFrom(this.httpService.get(`${this.ASSIGNMENT_URL}/${id}`));
      const assignment = assignmentResponse.data;

      // 2. Vamos a buscar el JSON completo de CADA problema que tenga este examen
      // Validamos que existan problemIds en el arreglo para no romper el código
      if (assignment.problemIds && assignment.problemIds.length > 0) {
        const fullProblemsDetails = await Promise.all(
          assignment.problemIds.map(async (problemId: string) => {
            try {
              const probRes = await firstValueFrom(this.httpService.get(`${this.CATALOG_URL}/${problemId}`));
              return probRes.data; // Aquí viene el JSON gigante de MongoDB
            } catch (err) {
              console.error(`Error trayendo el problema ${problemId} de Mongo`);
              return { id: problemId, error: "Problema no disponible" };
            }
          })
        );
        
        // 3. Fusionamos todo: Metemos el arreglo de JSONs gigantes dentro del deber
        assignment.problemsData = fullProblemsDetails;
      } else {
        assignment.problemsData = [];
      }

      // 4. Se lo entregamos a React ya armadito
      return res.status(200).json(assignment);

    } catch (error: any) {
      // Si está fuera de fecha (403), pasamos ese error al frontend
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