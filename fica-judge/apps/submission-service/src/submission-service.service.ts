import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Problem } from './schemas/problem.schema';
const Docker = require('dockerode');

@Injectable()
export class SubmissionServiceService {
  private docker: any;

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rabbitClient: ClientProxy,
    @Inject('RANKING_CLIENT') private readonly rankingClient: ClientProxy, 
    @InjectRepository(Submission) private readonly submissionRepository: Repository<Submission>,
    @InjectModel(Problem.name) private readonly problemModel: Model<Problem>, 
  ) {
    this.docker = new Docker({ host: '127.0.0.1', port: 2375 });
  }

  async processNewSubmission(payload: any) {
    console.log("📥 Payload crudo llegando al Backend:", JSON.stringify(payload));
    const newSubmission = this.submissionRepository.create({
      studentId: payload.studentId || 'unknown_student',
      problemId: payload.problemId || 'unknown_problem',
      language: payload.language || 'python',
      sourceCode: payload.sourceCode,
      status: 'PENDING',
      results: [], 
    });
    
    const savedSubmission = await this.submissionRepository.save(newSubmission);

    const eventPayload = {
      ...payload,
      submissionId: savedSubmission.id
    };

    this.rabbitClient.emit('evaluate_code', eventPayload);
    
    return { 
      status: 'PENDING', 
      submissionId: savedSubmission.id,
      message: 'En cola de evaluación' 
    };
  }

  async executeSandbox(payload: any) {
    const { sourceCode, submissionId, problemId, studentId, name, language } = payload;
    let cases: any[] = [];
    let possiblePoints = 0; 
    let problemRecord: any = null;

    // ==========================================
    // EXTRACCIÓN DINÁMICA DE CASOS Y NORMALIZACIÓN DE DIFICULTAD
    // ==========================================
    try {
      problemRecord = await this.problemModel.findById(problemId).lean();
      
      if (!problemRecord || !(problemRecord as any).testCases || (problemRecord as any).testCases.length === 0) {
        console.error(`❌ El problema ${problemId} no tiene casos de prueba en Mongo.`);
        if (submissionId) await this.submissionRepository.update(submissionId, { status: 'SYSTEM_ERROR', results: [] });
        return { status: 'SYSTEM_ERROR', results: [] };
      }

      cases = (problemRecord as any).testCases;
      
      const rawDifficulty = String((problemRecord as any).difficulty || 'FÁCIL')
        .toUpperCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .trim();

      if (rawDifficulty === 'FACIL' || rawDifficulty === 'EASY') possiblePoints = 10;
      else if (rawDifficulty === 'MEDIO' || rawDifficulty === 'MEDIUM') possiblePoints = 30;
      else if (rawDifficulty === 'DIFICIL' || rawDifficulty === 'HARD') possiblePoints = 100;
      else possiblePoints = 10; 

      console.log(`👷‍♂️ WORKER: Evaluando envío [${submissionId}] - Dificultad cruda: ${rawDifficulty} -> ${possiblePoints} pts potenciales.`);

    } catch (error) {
      console.error('❌ Error conectando con MongoDB:', error);
      if (submissionId) await this.submissionRepository.update(submissionId, { status: 'SYSTEM_ERROR', results: [] });
      return { status: 'SYSTEM_ERROR', results: [] };
    }

    const results: any[] = []; 
    let isAccepted = true;
    const lang = language || 'python';

    // ==========================================
    // EJECUCIÓN DEL CÓDIGO EN DOCKER (SANDBOX)
    // ==========================================
    for (const test of cases) {
      let container: any;
      
      try {
        // 👇 INYECCIÓN DE BOILERPLATE (WRAPPER)
        let finalCode = sourceCode;

        if (problemRecord && problemRecord.hiddenWrapper) {
          // Opción 1: Si el problema en Mongo tiene un wrapper oculto dinámico
          finalCode = `${sourceCode}\n\n${problemRecord.hiddenWrapper}`;
        } else if (lang === 'python' || lang === 'python3') {
          // Opción 2: Fallback específico para el problema "Rate Limiter"
          const hiddenWrapper = `
import sys
if __name__ == '__main__':
    entrada = sys.stdin.read().split()
    if len(entrada) > 1:
        n = int(entrada[0])
        timestamps = [int(x) for x in entrada[1:]]
        solucion = Solution()
        print(solucion.rate_limiter(n, timestamps))
`;
          finalCode = `${sourceCode}\n${hiddenWrapper}`;
        }

        const base64Code = Buffer.from(finalCode).toString('base64');
        const base64Input = Buffer.from(test.input || '').toString('base64');

        container = await this.docker.createContainer({
          Image: 'python:3.9-slim',
          Cmd: ['sh', '-c', `echo "${base64Input}" | base64 -d | python3 -u -c "$(echo "${base64Code}" | base64 -d)"`],
          Tty: false,
        });

        await container.start();

        const waitPromise = container.wait();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIME_LIMIT_EXCEEDED')), 5000));

        try {
          await Promise.race([waitPromise, timeoutPromise]);
        } catch (err: any) {
          if (err.message === 'TIME_LIMIT_EXCEEDED') {
            results.push({ input: test.input, passed: false, output: 'Time Limit Exceeded' });
            isAccepted = false;
            continue;
          }
          throw err;
        }

        const outputBuffer = await container.logs({ follow: false, stdout: true, stderr: true });
        
        let offset = 0;
        let output = '';
        
        while (offset < outputBuffer.length) {
          const type = outputBuffer.readUInt8(offset);
          const len = outputBuffer.readUInt32BE(offset + 4);
          const chunk = outputBuffer.slice(offset + 8, offset + 8 + len).toString();
          
          if (type === 1) output += chunk; 
          offset += 8 + len;
        }
        
        output = output.trim();
        const passed = output === test.expectedOutput?.toString().trim();
        
        results.push({ input: test.input, passed, output });
        if (!passed) isAccepted = false;

      } catch (error) {
        results.push({ input: test.input, passed: false, output: 'Error de ejecución' });
        isAccepted = false;
      } finally {
        if (container) await container.remove({ force: true }).catch(() => {});
      }
    }

    const finalStatus = isAccepted ? 'ACCEPTED' : 'WRONG_ANSWER';
    
    // ==========================================
    // CONTROL ESTRICTO DE INTENTOS Y ANTI-FARMEO
    // ==========================================
    let earnedPoints = 0;
    let isNewSolve = false;
    let skipAttempt = false;

    const safeStudentId = studentId || 'unknown_student';
    const safeProblemId = problemId || 'unknown_problem';

    const previousSuccesses = await this.submissionRepository.count({
      where: { studentId: safeStudentId, problemId: safeProblemId, status: 'ACCEPTED' }
    });

    const alreadySolvedBefore = previousSuccesses > 0;

    if (finalStatus === 'ACCEPTED') {
      if (!alreadySolvedBefore) {
        earnedPoints = possiblePoints;
        isNewSolve = true;
      } else {
        skipAttempt = true;
        console.log(`ℹ️ [Sandbox] ${safeStudentId} reenvió una solución correcta a un problema ya resuelto. Protegiendo efectividad.`);
      }
    } else {
      if (alreadySolvedBefore) {
        skipAttempt = true;
        console.log(`ℹ️ [Sandbox] ${safeStudentId} falló un intento de prueba en un problema ya solucionado. Ignorando penalización.`);
      } else {
        earnedPoints = 0;
        isNewSolve = false;
      }
    }
    
    console.log(`✅ Envío [${submissionId}] Finalizado: ${finalStatus}. Puntos ganados: ${earnedPoints} | Ignorar Métricas: ${skipAttempt}`);

    if (submissionId) {
      await this.submissionRepository.update(submissionId, { status: finalStatus, results: results });

      this.rankingClient.emit('submission_evaluated', {
        studentId: safeStudentId,
        name: name,
        status: finalStatus,
        problemId: safeProblemId,
        earnedPoints: earnedPoints, 
        isNewSolve: isNewSolve,
        skipAttempt: skipAttempt
      });
    }

    return { status: finalStatus, results };
  }

  async executeDirectRun(payload: any) {
    const { sourceCode, input, language } = payload;
    let container: any;
    const lang = language || 'python';
    
    try {
      // 👇 INYECCIÓN DE BOILERPLATE PARA EJECUCIÓN DIRECTA
      let finalCode = sourceCode;

      if (lang === 'python' || lang === 'python3') {
        const hiddenWrapper = `
import sys
if __name__ == '__main__':
    entrada = sys.stdin.read().split()
    if len(entrada) > 1:
        n = int(entrada[0])
        timestamps = [int(x) for x in entrada[1:]]
        solucion = Solution()
        print(solucion.rate_limiter(n, timestamps))
`;
        finalCode = `${sourceCode}\n${hiddenWrapper}`;
      }

      const base64Code = Buffer.from(finalCode).toString('base64');
      const base64Input = Buffer.from(input || '').toString('base64');

      container = await this.docker.createContainer({
        Image: 'python:3.9-slim',
        Cmd: ['sh', '-c', `echo "${base64Input}" | base64 -d | python3 -u -c "$(echo "${base64Code}" | base64 -d)"`],
        Tty: false,
      });

      await container.start();

      const waitPromise = container.wait();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIME_LIMIT_EXCEEDED')), 5000));

      await Promise.race([waitPromise, timeoutPromise]);

      const outputBuffer = await container.logs({ follow: false, stdout: true, stderr: true });
      let offset = 0;
      let output = '';
      
      while (offset < outputBuffer.length) {
        const type = outputBuffer.readUInt8(offset);
        const len = outputBuffer.readUInt32BE(offset + 4);
        const chunk = outputBuffer.slice(offset + 8, offset + 8 + len).toString();
        
        output += chunk; 
        offset += 8 + len;
      }

      return { success: true, output: output.trim() };

    } catch (error: any) {
      if (error.message === 'TIME_LIMIT_EXCEEDED') {
        return { success: false, output: 'Error: Límite de tiempo excedido' };
      }
      return { success: false, output: 'Error interno al ejecutar el sandbox.' };
    } finally {
      if (container) await container.remove({ force: true }).catch(() => {});
    }
  }

  // ==========================================
  // HISTORIAL DE ENVÍOS POR ESTUDIANTE
  // ==========================================
  async getHistoryByStudent(studentId: string) {
    return await this.submissionRepository.find({
      where: { studentId: studentId },
      order: { id: 'DESC' }
    });
  }
}