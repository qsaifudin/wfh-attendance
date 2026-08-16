import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PaginatedResult<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

function isPaginated(value: unknown): value is PaginatedResult<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'meta' in value &&
    Array.isArray((value as PaginatedResult<unknown>).data)
  );
}

/** Wraps every response in `{ data, meta }` — paginated results already carry
 * that shape and pass through untouched. */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((result: unknown) => {
        if (isPaginated(result)) return result;
        return { data: result, meta: null };
      }),
    );
  }
}
