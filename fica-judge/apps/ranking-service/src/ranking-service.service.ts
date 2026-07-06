import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ranking } from './schemas/ranking.schema';

@Injectable()
export class RankingService {
  constructor(@InjectModel(Ranking.name) private rankingModel: Model<Ranking>) {}

  async processSubmissionEvent(data: any) {
    // 👇 PROTECCIÓN TOTAL DE EFECTIVIDAD: Si el problema ya fue solucionado en el pasado,
    // abortamos la transacción de forma atómica para no alterar los intentos reales.
    if (data.skipAttempt) {
      console.log(`ℹ️ [Ranking] Envío omitido para el alumno '${data.studentId}'. El ejercicio ya se encuentra resuelto.`);
      return;
    }

    const solvedToAdd = data.isNewSolve ? 1 : 0;
    const pointsToAdd = data.earnedPoints || 0; 
    const studentKey = data.studentId || 'unknown_student';

    await this.rankingModel.findOneAndUpdate(
      { studentId: studentKey },
      { 
        $inc: { 
          totalScore: pointsToAdd, 
          problemsSolved: solvedToAdd,
          totalAttempts: 1 // Solo se acumula si es un intento sobre un problema no resuelto con éxito aún
        },
        $setOnInsert: {
          name: data.name || (data.studentId && data.studentId !== 'unknown_student' ? data.studentId : 'Wilson Xavier'),
          courseSection: 'Sistemas Distribuidos 8A'
        }
      },
      { new: true, upsert: true }
    );
    
    console.log(`💾 MongoDB Actualizado -> Alumno: ${studentKey} | Puntos Sumados: ${pointsToAdd} | Resueltos: +${solvedToAdd}`);
  }

  async getLeaderboard() {
    const rankings = await this.rankingModel.find().sort({ totalScore: -1 }).limit(10).lean().exec();
    
    return rankings.map(user => {
      const effect = user.totalAttempts > 0 
        ? Math.round((user.problemsSolved / user.totalAttempts) * 100) 
        : 0;

      return {
        ...user,
        attempts: user.totalAttempts, 
        effectiveness: effect        
      };
    });
  }
}