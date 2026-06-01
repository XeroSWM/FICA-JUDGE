export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly passwordPlain: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {}
}
