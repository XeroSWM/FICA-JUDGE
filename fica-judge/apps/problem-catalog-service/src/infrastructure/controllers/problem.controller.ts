import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProblemCommand } from '../../application/commands/create-problem.command';
import { GetProblemsQuery } from '../../application/queries/get-problems.query';

@Controller('problems')
export class ProblemController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus, // Inyectamos el bus de consultas
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProblem(@Body() body: any) {
    const { title, description, difficulty, tags, templates, testCases } = body;
    const command = new CreateProblemCommand(title, description, difficulty, tags, templates, testCases);
    return this.commandBus.execute(command);
  }

  // NUEVO ENDPOINT PARA OBTENER LOS PROBLEMAS
  @Get()
  async getProblems() {
    return this.queryBus.execute(new GetProblemsQuery());
  }
}