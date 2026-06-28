import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  problemId: string;

  @Column()
  language: string;

  @Column('text')
  sourceCode: string;

  @Column({ default: 'PENDING' })
  status: string;

  // El superpoder de Postgres para guardar arreglos dinámicos
  @Column({ type: 'jsonb', default: [] })
  results: any[];

  @CreateDateColumn()
  createdAt: Date;
}