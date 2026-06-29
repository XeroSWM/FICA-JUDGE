import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // <-- NUEVO IMPORT PARA JWT
import { LoginUserCommand } from './login-user.command';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt'; 

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService, // <-- INYECCIÓN DEL SERVICIO JWT
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

    // 3. Crear el Payload del JWT
    const payload = {
      sub: user.id, // ID real de la base de datos
      email: user.email,
      role: user.role,
    };

    // 4. Retornar los datos limpios con el token real
    return {
      message: 'Inicio de sesión exitoso',
      access_token: this.jwtService.sign(payload), // <-- MAGIA DE JWT
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