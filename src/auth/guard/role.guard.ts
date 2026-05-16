import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly readonly: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.readonly.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest().user;

    if (!user || !user.role) {
      throw new UnauthorizedException('User role not found');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new UnauthorizedException(
        `Access denied. Requires roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
