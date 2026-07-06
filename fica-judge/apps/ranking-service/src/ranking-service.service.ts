import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ranking } from './schemas/ranking.schema';

@Injectable()
export class RankingService {
  constructor(@InjectModel(Ranking.name) private rankingModel: Model<Ranking>) {}

  async processSubmissionEvent(data: any) {
    const isAccepted = data.status === 'ACCEPTED';
    
    // El puntaje dinámico calculado por el Submission Service (10, 30 o 100 pts)
    const pointsToAdd = data.earnedPoints || 0; 
    const solvedToAdd = isAccepted ? 1 : 0;
    
    // Validamos que el ID no llegue nulo para no romper el índice de Mongo
    const studentKey = data.studentId || 'unknown_student';

    await this.rankingModel.findOneAndUpdate(
      { studentId: studentKey },
      { 
        $inc: { 
          totalScore: pointsToAdd, 
          problemsSolved: solvedToAdd,
          totalAttempts: 1 // Suma 1 a los intentos reales SIEMPRE
        },
        $setOnInsert: {
          // Si el estudiante entra por primera vez a la tabla, inicializamos sus strings
          name: data.name || (data.studentId && data.studentId !== 'unknown_student' ? data.studentId : 'Wilson Xavier'),
          courseSection: 'Sistemas Distribuidos 8A'
        }
      },
      { new: true, upsert: true }
    );
    
    console.log(`💾 MongoDB Actualizado -> Alumno: ${studentKey} | Puntos Sumados: ${pointsToAdd} | Resueltos: +${solvedToAdd}`);
  }

  async getLeaderboard() {
    // Buscamos el top 10 de estudiantes con mayor puntaje acumulado
    const rankings = await this.rankingModel.find().sort({ totalScore: -1 }).limit(10).lean().exec();
    
    // Calculamos dinámicamente la efectividad exacta en base a ejecuciones reales
    return rankings.map(user => {
      const effect = user.totalAttempts > 0 
        ? Math.round((user.problemsSolved / user.totalAttempts) * 100) 
        : 0;

      return {
        ...user,
        attempts: user.totalAttempts, // Mapeo directo para emparejar la columna de tu frontend
        effectiveness: effect        // Porcentaje real que exige tu mockup de UI
      };
    });
  }
}