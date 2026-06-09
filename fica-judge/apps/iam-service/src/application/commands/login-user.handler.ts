import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUserCommand } from './login-user.command';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt'; // <-- IMPORTAMOS BCRYPT AQUÍ

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(command: LoginUserCommand): Promise<any> {
    const { email, passport } = command;

    // 1. Buscar al usuario por su correo
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new UnauthorizedException('El correo no está registrado.');
    }

    // 2. MAGIA DE BCRYPT: Comparar el texto plano con el hash guardado
    const isPasswordValid = await bcrypt.compare(passport, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta.');
    }

    // 3. Retornar los datos limpios
    return {
      message: 'Inicio de sesión exitoso',
      token: 'jwt-token-simulado-fica-judge',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}