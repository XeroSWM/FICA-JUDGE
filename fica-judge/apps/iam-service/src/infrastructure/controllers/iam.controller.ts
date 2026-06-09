import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../../application/commands/register-user.command';
import { LoginUserCommand } from '../../application/commands/login-user.command';

@Controller('auth')
export class IamController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  async register(@Body() body: any) {
    const { email, password, firstName, lastName } = body;
    const command = new RegisterUserCommand(email, password, firstName, lastName);
    
    return this.commandBus.execute(command);
  }

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    const command = new LoginUserCommand(email, password);
    return this.commandBus.execute(command);
  }

}