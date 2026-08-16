import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');

  const corsOrigins = config
    .get<string>('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim());
  app.enableCors({ origin: corsOrigins, credentials: true });

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('WFH Attendance API')
      .setDescription('Employee clock-in and HRD monitoring for a work-from-home team')
      .setVersion('1.0')
      .addCookieAuth('wfh_token')
      .build(),
  );
  // Without this, DTOs built from Zod schemas produce empty Swagger docs —
  // @nestjs/swagger only reads class properties decorated with @ApiProperty,
  // so nestjs-zod's schemas need this post-processing pass instead.
  SwaggerModule.setup('api', app, cleanupOpenApiDoc(document));

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`API listening on http://localhost:${port}/api/v1 (docs at /api)`);
}

void bootstrap();
