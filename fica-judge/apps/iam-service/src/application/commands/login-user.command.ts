export class LoginUserCommand {
  constructor(
    public readonly email: string,
    public readonly passport: string, // Tu variable de contraseña
  ) {}
}