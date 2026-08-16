import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../types/authenticated-user';

interface AccessTokenPayload {
  sub: number;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  employee_id: number | null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const cookieName = this.config.get<string>('COOKIE_NAME', 'wfh_token');
    // cookie-parser's types declare `Request.cookies` as `any` — this cast
    // is where that untyped boundary is made explicit and contained.
    const cookies = request.cookies as Record<string, string> | undefined;
    const token = cookies?.[cookieName];

    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // A deactivated employee must be locked out immediately, not only once
    // their token expires — there is no refresh token to revoke instead.
    const user = await this.prisma.users.findUnique({
      where: { id: payload.sub },
      select: { status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is inactive');
    }

    const authenticatedUser: AuthenticatedUser = {
      user_id: payload.sub,
      email: payload.email,
      role: payload.role,
      employee_id: payload.employee_id,
    };
    (request as Request & { user: AuthenticatedUser }).user = authenticatedUser;

    return true;
  }
}
