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
    // Megáfono para el Ranking
    @Inject('RANKING_CLIENT') private readonly rankingClient: ClientProxy, 
    
    // Repositorio de PostgreSQL para el historial de envíos
    @InjectRepository(Submission) private readonly submissionRepository: Repository<Submission>,
    // Modelo de MongoDB para leer los problemas y sus test cases secretos
    @InjectModel(Problem.name) private readonly problemModel: Model<Problem>, 
  ) {
    this.docker = new Docker({ host: '127.0.0.1', port: 2375 });
  }

  async processNewSubmission(payload: any) {
    // 1. Creamos y guardamos el registro inicial en Postgres
    const newSubmission = this.submissionRepository.create({
      studentId: payload.studentId || 'unknown_student',
      problemId: payload.problemId || 'unknown_problem',
      language: payload.language || 'python',
      sourceCode: payload.sourceCode,
      status: 'PENDING',
      results: [], // Inicialmente vacío
    });
    
    const savedSubmission = await this.submissionRepository.save(newSubmission);

    // 2. Inyectamos el ID (ahora un UUID o ID autoincremental de Postgres) en el evento
    const eventPayload = {
      ...payload,
      submissionId: savedSubmission.id
    };

    this.rabbitClient.emit('evaluate_code', eventPayload);
    
    // 3. Devolvemos el ID real al Frontend
    return { 
      status: 'PENDING', 
      submissionId: savedSubmission.id,
      message: 'En cola de evaluación' 
    };
  }

  async executeSandbox(payload: any) {
    // 👇 Sacamos el name también para enviarlo al ranking
    const { sourceCode, submissionId, problemId, studentId, name } = payload;
    let cases: any[] = [];
    let possiblePoints = 0; // 👈 Variable para guardar los puntos posibles

    // ==========================================
    // EXTRACCIÓN DINÁMICA DE CASOS Y DIFICULTAD DESDE MONGODB
    // ==========================================
    try {
      const problemRecord = await this.problemModel.findById(problemId);
      
      if (!problemRecord || !problemRecord.testCases || problemRecord.testCases.length === 0) {
        console.error(`❌ El problema ${problemId} no tiene casos de prueba en Mongo.`);
        if (submissionId) await this.submissionRepository.update(submissionId, { status: 'SYSTEM_ERROR', results: [] });
        return { status: 'SYSTEM_ERROR', results: [] };
      }

      cases = problemRecord.testCases;
      
      // 👇 ASIGNACIÓN DE PUNTOS SEGÚN DIFICULTAD 👇
      const difficulty = problemRecord.difficulty?.toUpperCase() || 'FÁCIL';
      if (difficulty === 'FÁCIL' || difficulty === 'FACIL') possiblePoints = 10;
      else if (difficulty === 'MEDIO') possiblePoints = 30;
      else if (difficulty === 'DIFÍCIL' || difficulty === 'DIFICIL') possiblePoints = 100;
      else possiblePoints = 10; // Valor por defecto

      console.log(`👷‍♂️ WORKER: Evaluando envío [${submissionId}] - Dificultad: ${difficulty} (${possiblePoints} pts potenciales)...`);

    } catch (error) {
      console.error('❌ Error conectando con MongoDB:', error);
      if (submissionId) await this.submissionRepository.update(submissionId, { status: 'SYSTEM_ERROR', results: [] });
      return { status: 'SYSTEM_ERROR', results: [] };
    }

    const results: any[] = []; 
    let isAccepted = true;

    // ==========================================
    // EJECUCIÓN DEL CÓDIGO EN DOCKER (SANDBOX)
    // ==========================================
    for (const test of cases) {
      let container: any;
      
      try {
        const base64Code = Buffer.from(sourceCode).toString('base64');
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
            console.log(`⏳ Límite de tiempo excedido en el caso: "${test.input}"`);
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
        
        if (!passed) {
          console.log(`❌ Fallo: Esperado: "${test.expectedOutput}", Recibido: "${output}"`);
        } else {
          console.log(`✅ Caso correcto superado.`);
        }

        results.push({ input: test.input, passed, output });
        if (!passed) isAccepted = false;

      } catch (error) {
        console.error('❌ Error en el Sandbox:', error);
        results.push({ input: test.input, passed: false, output: 'Error de ejecución' });
        isAccepted = false;
      } finally {
        if (container) await container.remove({ force: true }).catch(() => {});
      }
    }

    const finalStatus = isAccepted ? 'ACCEPTED' : 'WRONG_ANSWER';
    
    // 👇 CALCULAMOS PUNTOS GANADOS (Si falló, gana 0, pero cuenta como intento)
    const earnedPoints = isAccepted ? possiblePoints : 0;
    
    console.log(`✅ Envío [${submissionId}] Finalizado: ${finalStatus}. Puntos ganados: ${earnedPoints}`);

    // 4. ACTUALIZAMOS LA BASE DE DATOS con el veredicto final en Postgres
    if (submissionId) {
      await this.submissionRepository.update(submissionId, { status: finalStatus, results: results });
      console.log(`💾 Guardado exitoso en Postgres para ID: ${submissionId}`);

      // 👇 EMITIMOS EL EVENTO SIEMPRE (para que el Ranking registre el intento real)
      this.rankingClient.emit('submission_evaluated', {
        studentId: studentId,
        name: name,
        status: finalStatus,
        problemId: problemId,
        earnedPoints: earnedPoints // <--- Aquí viajan los puntos calculados
      });
      console.log(`📢 Evento enviado al Ranking (Status: ${finalStatus}) para conteo de intentos y puntos.`);
    }

    return { status: finalStatus, results };
  }

  // ==========================================
  // MODO "EJECUTAR CÓDIGO" (Sin guardar en DB ni validar en Mongo)
  // ==========================================
  async executeDirectRun(payload: any) {
    const { sourceCode, input } = payload;
    let container: any;
    
    try {
      const base64Code = Buffer.from(sourceCode).toString('base64');
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
        return { success: false, output: 'Error: Límite de tiempo excedido (Bucle infinito potencial)' };
      }
      return { success: false, output: 'Error interno al ejecutar el sandbox.' };
    } finally {
      if (container) await container.remove({ force: true }).catch(() => {});
    }
  }
}