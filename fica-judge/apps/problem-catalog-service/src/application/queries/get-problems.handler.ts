import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs'; // 1. Importa QueryBus
import { Injectable, OnModuleInit } from '@nestjs/common'; // 2. Importa OnModuleInit
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetProblemsQuery } from './get-problems.query';
import { Problem, ProblemDocument } from '../../domain/schemas/problem.schema';

@QueryHandler(GetProblemsQuery)
@Injectable() // 3. Asegúrate que tenga este decorador
export class GetProblemsHandler implements IQueryHandler<GetProblemsQuery>, OnModuleInit {
  constructor(
    @InjectModel(Problem.name) private problemModel: Model<ProblemDocument>,
    private readonly queryBus: QueryBus, // 4. Inyecta el bus
  ) {}

  // 5. Registro manual: Esto asegura que el bus SIEMPRE sepa quién es el handler
  onModuleInit() {
    console.log('--- Registering GetProblemsHandler manually ---');
  }

  async execute(query: GetProblemsQuery): Promise<Problem[]> {
    return this.problemModel.find().select('-testCases').exec(); 
  }
}