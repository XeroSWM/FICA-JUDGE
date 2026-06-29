import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extrae el token de la cabecera: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // DEBE SER EXACTAMENTE LA MISMA CLAVE QUE USASTE EN EL IAM
      secretOrKey: 'TU_CLAVE_SECRETA_FICA_JUDGE_2026', 
    });
  }

  // Si el token es válido y no ha expirado, NestJS ejecuta esta función
  async validate(payload: any) {
    // Lo que retornes aquí, NestJS lo inyectará en la variable 'req.user' de tus controladores
    return { 
      userId: payload.sub, 
      username: payload.username, 
      role: payload.role 
    };
  }
}