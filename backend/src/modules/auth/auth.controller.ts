import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Log in with email and password, sets the session cookie' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.login(dto.email, dto.password);
    res.cookie(
      this.config.get('COOKIE_NAME', 'wfh_token'),
      token,
      this.authService.getCookieOptions(),
    );
    return user;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear the session cookie' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(this.config.get('COOKIE_NAME', 'wfh_token'), { path: '/' });
    return { success: true };
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the currently authenticated user' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.findAuthenticatedUser(user.user_id);
  }
}
