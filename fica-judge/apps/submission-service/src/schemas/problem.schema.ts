import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Asegúrate de que 'problems' sea el nombre real de tu colección en MongoDB
@Schema({ collection: 'problems' }) 
export class Problem extends Document {
  @Prop()
  title: string;

  // Solo nos interesa extraer el arreglo de casos de prueba
  @Prop({ type: Array, default: [] })
  testCases: any[]; 
}

export const ProblemSchema = SchemaFactory.createForClass(Problem);