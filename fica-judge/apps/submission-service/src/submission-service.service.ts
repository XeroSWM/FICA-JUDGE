import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class SubmissionServiceService {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly rabbitClient: ClientProxy,
  ) {}

  async processNewSubmission(payload: any) {
    // 1. Guardaremos el envío en la base de datos (Pendiente)
    
    // 2. Disparamos el evento a RabbitMQ
    this.rabbitClient.emit('evaluate_code', payload);

    return { 
      message: 'Código recibido. Evaluador en proceso...',
      status: 'PENDING'
    };
  }

  async executeSandbox(payload: any) {
    console.log('👷‍♂️ WORKER: Recibí el código de RabbitMQ. Preparando Docker...');
    console.log(payload);
    // Lógica del contenedor efímero (Pendiente)
  }
}