import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterUserCommand } from './register-user.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(command: RegisterUserCommand): Promise<any> {
    const { email, passwordPlain, firstName, lastName } = command;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException(`El correo ${email} ya está registrado.`);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);

    const user = this.userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    try {
      await this.userRepository.save(user);
      return {
        id: user.id,
        email: user.email,
        message: 'Usuario registrado exitosamente',
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al registrar el usuario en la base de datos.');
    }
  }
}