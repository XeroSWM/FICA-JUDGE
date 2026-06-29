import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Ranking extends Document {
  @Prop({ required: true, unique: true })
  studentId: string;

  @Prop({ required: true, default: 0 })
  totalScore: number;

  @Prop({ required: true, default: 0 })
  problemsSolved: number;
}

export const RankingSchema = SchemaFactory.createForClass(Ranking);