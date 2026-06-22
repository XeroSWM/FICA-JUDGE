import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProblemCommand } from './create-problem.command';
import { Problem, ProblemDocument } from '../../domain/schemas/problem.schema';

@CommandHandler(CreateProblemCommand)
export class CreateProblemHandler implements ICommandHandler<CreateProblemCommand> {
  constructor(
    @InjectModel(Problem.name) private problemModel: Model<ProblemDocument>,
  ) {}

  async execute(command: CreateProblemCommand): Promise<Problem> {
    const newProblem = new this.problemModel({
      title: command.title,
      description: command.description,
      difficulty: command.difficulty,
      timeLimit: command.timeLimit,       
      memoryLimit: command.memoryLimit,  
      tags: command.tags,
      templates: command.templates,
      testCases: command.testCases,
      constraints: command.constraints, 
    });
    
    return await newProblem.save();
  }
}