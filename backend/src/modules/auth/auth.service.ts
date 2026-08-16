import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

const employeeInclude = {
  employee: {
    include: { department: true },
  },
} as const;

export function serializeAuthUser(
  user: {
    id: number;
    email: string;
    role: 'ADMIN' | 'EMPLOYEE';
    status: 'ACTIVE' | 'INACTIVE';
    employee: {
      id: number;
      full_name: string;
      position: string;
      photo_url: string | null;
      department: { id: number; name: string };
    } | null;
  } | null,
) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    employee: user.employee
      ? {
          id: user.employee.id,
          full_name: user.employee.full_name,
          position: user.employee.position,
          photo_url: user.employee.photo_url,
          department: user.employee.department,
        }
      : null,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
      include: employeeInclude,
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is inactive');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      employee_id: user.employee?.id ?? null,
    });

    return { token, user: serializeAuthUser(user) };
  }

  async findAuthenticatedUser(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: employeeInclude,
    });
    return serializeAuthUser(user);
  }

  getCookieOptions() {
    const isProd = this.config.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: this.config.get('COOKIE_SECURE', isProd ? 'true' : 'false') === 'true',
      maxAge: 12 * 60 * 60 * 1000, // 12h — matches JWT_EXPIRES_IN, no refresh token
      path: '/',
    };
  }
}
