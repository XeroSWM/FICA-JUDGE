import { Controller, Post, Get, Delete, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProblemCommand } from '../../application/commands/create-problem.command';
import { GetProblemsQuery } from '../../application/queries/get-problems.query';
import { Problem, ProblemDocument } from '../../domain/schemas/problem.schema';

@Controller('problems')
export class ProblemController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus, // Inyectamos el bus de consultas
    @InjectModel(Problem.name) private problemModel: Model<ProblemDocument>, // Inyección para el botón de pánico
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProblem(@Body() body: any) {
    console.log("1. BODY RECIBIDO DESDE POSTMAN:", body.constraints);
    // 1. Extraemos TODOS los campos que vienen desde el cliente (Postman/Frontend)
    const { 
      title, 
      description, 
      difficulty, 
      timeLimit, 
      memoryLimit, 
      tags, 
      templates, 
      testCases, 
      constraints // <-- AQUÍ ESTÁ EL NUEVO CAMPO
    } = body;

    // 2. Creamos el comando pasándole todos los datos
    const command = new CreateProblemCommand(
      title, 
      description, 
      difficulty, 
      timeLimit, 
      memoryLimit, 
      tags, 
      templates, 
      testCases, 
      constraints
    );

    // 3. Ejecutamos el comando
    console.log("2. COMANDO CREADO:", command.constraints);
    return this.commandBus.execute(command);
  }

  // ENDPOINT PARA OBTENER LOS PROBLEMAS
  @Get()
  async getProblems() {
    return this.queryBus.execute(new GetProblemsQuery());
  }

  // =======================================================
  // ENDPOINT TEMPORAL PARA LIMPIAR LA BASE DE DATOS
  // =======================================================
  @Delete('wipe')
  async wipeAll() {
    await this.problemModel.deleteMany({});
    return { message: "¡Base de datos limpiada con éxito! Ya puedes insertar los nuevos ejemplos." };
  }
}