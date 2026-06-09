import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateProblemCommand } from '../../application/commands/create-problem.command';

@Controller('problems')
export class ProblemController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProblem(@Body() body: any) {
    // Extraemos los datos del JSON que envía el frontend
    const { title, description, difficulty, tags, templates, testCases } = body;

    // Instanciamos el comando con los datos puros
    const command = new CreateProblemCommand(
      title,
      description,
      difficulty,
      tags,
      templates,
      testCases,
    );

    // Despachamos el comando al Handler de CQRS
    return this.commandBus.execute(command);
  }
}