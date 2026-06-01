import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // <-- Agregamos !

  @Column({ unique: true })
  email!: string; // <-- Agregamos !

  @Column()
  passwordHash!: string; // <-- Agregamos !

  @Column()
  firstName!: string; // <-- Agregamos !

  @Column()
  lastName!: string; // <-- Agregamos !

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole; // <-- Agregamos !

  @Column({ default: true })
  isActive!: boolean; // <-- Agregamos !

  @CreateDateColumn()
  createdAt!: Date; // <-- Agregamos !

  @UpdateDateColumn()
  updatedAt!: Date; // <-- Agregamos !
}