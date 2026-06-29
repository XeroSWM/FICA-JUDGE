import { Controller, Get, Post, Put, Delete, Param, Body, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response, Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('problems')
export class CatalogController {
  // Definimos la URL interna de tu microservicio de catálogo
  private readonly CATALOG_URL = 'http://localhost:3002/problems';

  constructor(private readonly httpService: HttpService) {}

  @Get()
  async getAllProblems(@Res() res: Response) {
    try {
      const response = await firstValueFrom(this.httpService.get(this.CATALOG_URL));
      return res.status(response.status).json(response.data);
    } catch (error: any) {
      return res.status(error.response?.status || 500).json(error.response?.data || { message: 'Catalog Service inalcanzable' });
    }
  }

  @Get(':id')
  async getProblemById(@Param('id') id: string, @Res() res: Response) {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.CATALOG_URL}/${id}`));
      return res.status(response.status).json(response.data);
    } catch (error: any) {
      return res.status(error.response?.status || 404).json(error.response?.data || { message: 'Problema no encontrado' });
    }
  }
}