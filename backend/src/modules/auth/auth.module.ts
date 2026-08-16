import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          // JwtModule's type wants a template-literal duration string, but
          // this comes from env at runtime — cast rather than hardcode it.
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '12h') as `${number}h`,
          issuer: config.get<string>('JWT_ISSUER', 'wfh-attendance'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
