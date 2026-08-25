import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOW_PENDING_PASSWORD_KEY } from '../decorators/allow-pending-password.decorator';

/**
 * Corta en seco a quien todavia arrastra la clave que le pusieron al crear la
 * cuenta. La obligacion se aplica en el servidor, no solo en la pantalla: sin
 * esto bastaria con llamar a la API a mano para saltarse el cambio.
 *
 * Va SIEMPRE detras de JwtAuthGuard en la lista de @UseGuards, porque necesita
 * el usuario que aquel deja en la peticion. Por lo mismo no puede registrarse
 * como guard global: esos corren antes que los del controlador.
 */
@Injectable()
export class PasswordChangeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<boolean>(ALLOW_PENDING_PASSWORD_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (allowed) return true;

    const { user } = context.switchToHttp().getRequest();
    if (user?.mustChangePassword) {
      throw new ForbiddenException('Cambia tu contraseña antes de continuar');
    }
    return true;
  }
}
