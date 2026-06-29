import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ranking } from './schemas/ranking.schema';

@Injectable()
export class RankingService {
  constructor(@InjectModel(Ranking.name) private rankingModel: Model<Ranking>) {}

  async processSubmissionEvent(data: any) {
    // Solo sumamos puntos si el código en Docker fue aceptado
    if (data.status !== 'ACCEPTED') return;

    const points = 10; // Puntaje base por problema resuelto
    
    // El 'upsert: true' inserta al estudiante si no existe, o lo actualiza si ya existe
    await this.rankingModel.findOneAndUpdate(
      { studentId: data.studentId },
      { $inc: { totalScore: points, problemsSolved: 1 } },
      { new: true, upsert: true }
    );
  }

  async getLeaderboard() {
    // Retorna el Top 10 de estudiantes ordenados por mayor puntaje
    return this.rankingModel.find().sort({ totalScore: -1 }).limit(10).exec();
  }
}