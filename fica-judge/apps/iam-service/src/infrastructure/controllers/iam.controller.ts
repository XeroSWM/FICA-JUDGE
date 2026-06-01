import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../../application/commands/register-user.command';

@Controller('auth')
export class IamController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  async register(@Body() body: any) {
    const { email, password, firstName, lastName } = body;
    const command = new RegisterUserCommand(email, password, firstName, lastName);
    
    return this.commandBus.execute(command);
  }
}