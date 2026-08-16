import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { MulterError } from 'multer';
import { MAX_PHOTO_SIZE_BYTES } from '../utils/upload.util';

const MAX_UPLOAD_MB = MAX_PHOTO_SIZE_BYTES / (1024 * 1024);

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, message } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private resolve(exception: unknown): { status: number; message: string | string[] } {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const bodyMessage =
        typeof body === 'object' && body !== null && 'message' in body
          ? (body as { message: string | string[] }).message
          : undefined;
      return { status: exception.getStatus(), message: bodyMessage ?? exception.message };
    }

    if (exception instanceof MulterError && exception.code === 'LIMIT_FILE_SIZE') {
      return {
        status: HttpStatus.PAYLOAD_TOO_LARGE,
        message: `File exceeds the ${MAX_UPLOAD_MB}MB limit`,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          const fields = (exception.meta?.target as string[] | undefined)?.join(', ');
          return {
            status: HttpStatus.CONFLICT,
            message: fields ? `A record with this ${fields} already exists` : 'Duplicate record',
          };
        }
        case 'P2025':
          return { status: HttpStatus.NOT_FOUND, message: 'Record not found' };
        case 'P2003':
          return {
            status: HttpStatus.CONFLICT,
            message: 'This record is still referenced by other data',
          };
        default:
          break;
      }
    }

    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
  }
}
