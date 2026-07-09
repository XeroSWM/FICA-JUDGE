import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { AssignmentProgress } from './entities/assignment-progress.entity';

@Injectable()
export class AssignmentServiceService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(AssignmentProgress)
    private progressRepository: Repository<AssignmentProgress>,
  ) {}

  // 1. Crear un nuevo Deber o Examen
  async createAssignment(data: Partial<Assignment>) {
    const assignment = this.assignmentRepository.create(data);
    return await this.assignmentRepository.save(assignment);
  }

  // 2. Obtener todos los deberes/exámenes
  async getAllAssignments() {
    return await this.assignmentRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  // 3. Obtener un examen y VALIDAR FECHAS
  async getAssignmentById(id: string) {
    const assignment = await this.assignmentRepository.findOne({ where: { id } });
    
    if (!assignment) {
      throw new HttpException('Examen/Deber no encontrado', HttpStatus.NOT_FOUND);
    }

    const now = new Date();
    
    // Si es examen, aplicamos validación estricta de tiempo
    if (assignment.type === 'EXAMEN') {
      if (now < new Date(assignment.startDate)) {
        throw new HttpException('El examen aún no ha comenzado', HttpStatus.FORBIDDEN);
      }
      if (now > new Date(assignment.endDate)) {
        throw new HttpException('El examen ya ha finalizado', HttpStatus.FORBIDDEN);
      }
    }

    return assignment;
  }

  // 4. Registrar un intento (Fallo o Acierto) y calcular nota
  async recordAttempt(studentId: string, assignmentId: string, problemId: string, isSuccess: boolean) {
    const assignment = await this.assignmentRepository.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new HttpException('Asignación no encontrada', HttpStatus.NOT_FOUND);

    let progress = await this.progressRepository.findOne({
      where: { studentId, assignmentId, problemId }
    });

    // Si es su primer intento, creamos el registro
    if (!progress) {
      progress = this.progressRepository.create({
        studentId,
        assignmentId,
        problemId,
        failedAttempts: 0,
        isSolved: false,
      });
    }

    // Si ya lo resolvió antes, no hacemos nada para evitar farmeo
    if (progress.isSolved) {
      return progress;
    }

    if (!isSuccess) {
      progress.failedAttempts += 1;
    } else {
      progress.isSolved = true;
      // Fórmula de calificación: Nota Max - (Fallos * Penalización)
      let calculatedScore = assignment.maxScore - (progress.failedAttempts * assignment.penaltyPerAttempt);
      
      // Evitamos notas negativas
      progress.finalScore = calculatedScore < 0 ? 0 : calculatedScore;
    }

    return await this.progressRepository.save(progress);
  }
}