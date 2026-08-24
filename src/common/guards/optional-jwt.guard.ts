import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Deja pasar aunque no haya token. Lo usa el checkout: el pedido se puede hacer
 * como invitado, pero si el cliente venía con sesión se enlaza a su cuenta.
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context) as any;
  }

  handleRequest(_err: any, user: any) {
    return user || undefined;
  }
}
