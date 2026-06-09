import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetProblemsQuery } from './get-problems.query';
import { Problem, ProblemDocument } from '../../domain/schemas/problem.schema';

@QueryHandler(GetProblemsQuery)
export class GetProblemsHandler implements IQueryHandler<GetProblemsQuery> {
  constructor(
    @InjectModel(Problem.name) private problemModel: Model<ProblemDocument>,
  ) {}

  async execute(query: GetProblemsQuery): Promise<Problem[]> {
    // Retorna todos los problemas. Más adelante podemos añadir paginación o filtros por dificultad aquí.
    return this.problemModel.find().select('-testCases').exec(); 
    // Nota: Excluimos 'testCases' para no enviarle las respuestas secretas al frontend en la vista general
  }
}