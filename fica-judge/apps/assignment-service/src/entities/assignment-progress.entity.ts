import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('assignment_progress')
export class AssignmentProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  assignmentId: string;

  // El problema específico dentro del deber/examen que está intentando resolver
  @Column()
  problemId: string;

  // Contador para restar los 0.25
  @Column({ type: 'int', default: 0 })
  failedAttempts: number;

  @Column({ type: 'boolean', default: false })
  isSolved: boolean;

  // La nota obtenida en este ejercicio específico tras restar penalizaciones
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalScore: number;

  @UpdateDateColumn()
  lastAttemptAt: Date;
}