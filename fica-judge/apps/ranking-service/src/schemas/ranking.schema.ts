import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Ranking extends Document {
  @Prop({ required: true })
  studentId: string;

  // NUEVOS CAMPOS PARA EL PROTOTIPO
  @Prop({ default: 'Estudiante FICA' })
  name: string;

  @Prop({ default: 'Sistemas Distribuidos 8A' })
  courseSection: string;

  @Prop({ default: 0 })
  totalScore: number;

  @Prop({ default: 0 })
  problemsSolved: number;

  // NUEVO CAMPO PARA LOS INTENTOS
  @Prop({ default: 0 })
  totalAttempts: number; 
}

export const RankingSchema = SchemaFactory.createForClass(Ranking);