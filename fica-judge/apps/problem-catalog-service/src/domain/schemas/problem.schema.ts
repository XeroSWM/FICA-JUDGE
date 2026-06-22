// src/domain/schemas/problem.schema.ts (o donde tengas tu esquema)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class TestCase {
  @Prop({ required: true }) input: string;
  @Prop({ required: true }) expectedOutput: string;
  @Prop({ default: false }) isSample: boolean;
}

// NUEVO: Para soportar el editor de código del frontend
@Schema({ _id: false })
class CodeTemplate {
  @Prop({ required: true }) language: string; // Ej: "python", "java", "cpp"
  @Prop({ required: true }) starterCode: string; // El código que aparece por defecto en el editor
}

export type ProblemDocument = Problem & Document;

@Schema({ timestamps: true })
export class Problem {
  @Prop({ required: true, trim: true, maxlength: 150 }) title: string;
  @Prop({ required: true }) description: string;
  @Prop({ required: true, enum: ['FÁCIL', 'MEDIO', 'DIFÍCIL'], default: 'FÁCIL' }) difficulty: string;
  @Prop({ required: true, default: 1000 }) timeLimit: number;
  @Prop({ required: true, default: 256 }) memoryLimit: number;
  
  @Prop({ type: [TestCase], default: [] }) testCases: TestCase[];
  @Prop({ type: [CodeTemplate], default: [] }) templates: CodeTemplate[]; // Plantillas inyectadas al editor
  @Prop({ type: [String], default: [] }) tags: string[];
  
  // NUEVO: Arreglo para las restricciones dinámicas del ejercicio (Constraints)
  @Prop({ type: [String], default: [] }) constraints: string[];
}

export const ProblemSchema = SchemaFactory.createForClass(Problem);