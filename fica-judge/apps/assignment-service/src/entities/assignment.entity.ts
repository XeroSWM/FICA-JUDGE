import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  // Diferenciamos si es DEBER o EXAMEN
  @Column({ type: 'varchar', length: 20, default: 'DEBER' })
  type: string; 

  // Guardamos los IDs de los problemas de MongoDB como un arreglo simple
  @Column('simple-array')
  problemIds: string[];

  // Control estricto de tiempo
  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  // Configuración de calificaciones (Ej: Sobre 10)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.00 })
  maxScore: number;

  // Penalización por cada WRONG_ANSWER (Ej: 0.25)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.25 })
  penaltyPerAttempt: number;

  @CreateDateColumn()
  createdAt: Date;
}