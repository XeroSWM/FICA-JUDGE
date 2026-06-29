import { Controller, Post, Get, Body, Param, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('submissions')
export class SubmissionController {
  private readonly SUBMISSION_URL = 'http://localhost:3003/submissions';

  constructor(private readonly httpService: HttpService) {}

  @Post()
  async createSubmission(@Body() body: any, @Res() res: Response) {
    try {
      const response = await firstValueFrom(this.httpService.post(this.SUBMISSION_URL, body));
      return res.status(response.status).json(response.data);
    } catch (error: any) {
      return res.status(error.response?.status || 500).json(error.response?.data || { message: 'Submission Service inalcanzable' });
    }
  }

  @Post('run')
  async runCodeDirectly(@Body() body: any, @Res() res: Response) {
    try {
      const response = await firstValueFrom(this.httpService.post(`${this.SUBMISSION_URL}/run`, body));
      return res.status(response.status).json(response.data);
    } catch (error: any) {
      return res.status(error.response?.status || 500).json(error.response?.data || { message: 'Error en la ejecución directa' });
    }
  }

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