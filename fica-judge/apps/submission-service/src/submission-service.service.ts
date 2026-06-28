import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
const Docker = require('dockerode');

@Injectable()
export class SubmissionServiceService {
  private docker: any;

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rabbitClient: ClientProxy,
  ) {
    this.docker = new Docker({
      host: 'localhost',
      port: 2375
    });
  }

  async processNewSubmission(payload: any) {
    this.rabbitClient.emit('evaluate_code', payload);
    return { status: 'PENDING', message: 'En cola de evaluación' };
  }

  async executeSandbox(payload: any) {
    const { sourceCode, testCases } = payload;
    const cases = testCases || [{ input: '', expectedOutput: '' }];
    
    console.log(`👷‍♂️ WORKER: Ejecutando ${cases.length} casos...`);
    const results: any[] = []; 
    let isAccepted = true;

    for (const test of cases) {
      let container: any;
      try {
        console.log(`--- Iniciando contenedor para input: "${test.input}" ---`);
        
        container = await this.docker.createContainer({
          Image: 'python:3.9-slim',
          // Agregamos '-u' para que Python no bufferice la salida
          Cmd: ['python3', '-u', '-c', sourceCode],
          Tty: false,
          OpenStdin: true,
          StdinOnce: true,
        });

        console.log(`Paso 1: Contenedor creado.`);
        const stream = await container.attach({ stream: true, stdin: true, stdout: true, stderr: true });

        console.log(`Paso 2: Iniciando...`);
        await container.start();

        console.log(`Paso 3: Enviando input...`);
        if (test.input) {
          stream.write(test.input + '\n');
        }
        stream.end(); // CERRAMOS el input para que Python sepa que es el EOF

        console.log(`Paso 4: Esperando salida (wait)...`);
        await container.wait();

        console.log(`Paso 5: Leyendo logs...`);
        const outputBuffer = await container.logs({ follow: false, stdout: true, stderr: true });
        
        const output = outputBuffer.toString().replace(/[\x00-\x1F\x7F-\x9F]/g, "").trim();
        console.log(`Paso 6: Resultado obtenido: "${output}"`);

        const passed = output === test.expectedOutput?.toString().trim();
        results.push({ input: test.input, passed, output });
        if (!passed) isAccepted = false;

      } catch (error) {
        console.error('❌ Error crítico en el sandbox:', error);
        results.push({ input: test.input, passed: false, output: 'Error' });
        isAccepted = false;
      } finally {
        if (container) {
          console.log(`Paso 7: Limpiando contenedor...`);
          await container.remove({ force: true }).catch(() => {});
        }
      }
    }

    const status = isAccepted ? 'ACCEPTED' : 'WRONG_ANSWER';
    console.log(`✅ Resultado Final: ${status}`);
    return { status, results };
  }
}