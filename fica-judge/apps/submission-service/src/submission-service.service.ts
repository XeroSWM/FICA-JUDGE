import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity'; // Asumiendo que crearás esta entidad
const Docker = require('dockerode');

@Injectable()
export class SubmissionServiceService {
  private docker: any;

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rabbitClient: ClientProxy,
    // Inyectamos el Repositorio de PostgreSQL vía TypeORM
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
  ) {
    this.docker = new Docker({
      host: '127.0.0.1',
      port: 2375
    });
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
    const { sourceCode, testCases, submissionId } = payload;
    const cases = testCases || [{ input: '', expectedOutput: '' }];
    
    console.log(`👷‍♂️ WORKER: Evaluando envío [${submissionId || 'TEST'}] con ${cases.length} casos...`);
    const results: any[] = []; 
    let isAccepted = true;

    for (const test of cases) {
      let container: any;
      
      try {
        const base64Code = Buffer.from(sourceCode).toString('base64');
        const base64Input = Buffer.from(test.input || '').toString('base64');

        container = await this.docker.createContainer({
          Image: 'python:3.9-slim',
          Cmd: [
            'sh',
            '-c',
            `echo "${base64Input}" | base64 -d | python3 -u -c "$(echo "${base64Code}" | base64 -d)"`
          ],
          Tty: false,
        });

        await container.start();

        const waitPromise = container.wait();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIME_LIMIT_EXCEEDED')), 5000)
        );

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
          
          if (type === 1) { 
            output += chunk; 
          }
          offset += 8 + len;
        }
        
        output = output.trim();
        const passed = output === test.expectedOutput?.toString().trim();
        
        if (!passed) {
          console.log(`❌ Fallo: Esperado: "${test.expectedOutput}", Recibido: "${output}"`);
        } else {
          console.log(`✅ Caso correcto: "${test.input}"`);
        }

        results.push({ input: test.input, passed, output });
        if (!passed) isAccepted = false;

      } catch (error) {
        console.error('❌ Error en el Sandbox:', error);
        results.push({ input: test.input, passed: false, output: 'Error de ejecución' });
        isAccepted = false;
      } finally {
        if (container) {
          await container.remove({ force: true }).catch(() => {});
        }
      }
    }

    const finalStatus = isAccepted ? 'ACCEPTED' : 'WRONG_ANSWER';
    console.log(`✅ Envío [${submissionId || 'TEST'}] Finalizado: ${finalStatus}`);

    // 4. ACTUALIZAMOS LA BASE DE DATOS con el veredicto final en Postgres
    if (submissionId) {
      await this.submissionRepository.update(submissionId, {
        status: finalStatus,
        results: results // TypeORM serializará esto automáticamente si la columna es de tipo JSONB
      });
      console.log(`💾 Guardado exitoso en Postgres para ID: ${submissionId}`);
    }

    return { status: finalStatus, results };


  }
}