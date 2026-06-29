import { Controller, Post, Get, Delete, Body, HttpCode, HttpStatus, Param, NotFoundException } from '@nestjs/common';
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
    private readonly queryBus: QueryBus, 
    @InjectModel(Problem.name) private problemModel: Model<ProblemDocument>, 
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProblem(@Body() body: any) {
    console.log("1. BODY RECIBIDO DESDE POSTMAN:", body.constraints);
    const { 
      title, 
      description, 
      difficulty, 
      timeLimit, 
      memoryLimit, 
      tags, 
      templates, 
      testCases, 
      constraints 
    } = body;

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

    console.log("2. COMANDO CREADO:", command.constraints);
    return this.commandBus.execute(command);
  }

  // ENDPOINT PARA OBTENER TODOS LOS PROBLEMAS
  @Get()
  async getProblems() {
    return this.queryBus.execute(new GetProblemsQuery());
  }

  // =======================================================
  // NUEVO ENDPOINT: OBTENER UN PROBLEMA ESPECÍFICO POR ID
  // =======================================================
  @Get(':id')
  async getProblemById(@Param('id') id: string) {
    const problem = await this.problemModel.findById(id).exec();
    
    if (!problem) {
      throw new NotFoundException(`El problema con ID ${id} no fue encontrado`);
    }
    
    return problem;
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