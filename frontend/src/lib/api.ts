import axios, { AxiosError } from 'axios';
import type { ApiErrorBody, PaginationMeta } from '@/types/api';

// Same-origin: Next's rewrite proxy sends /api/* to the backend, so the
// session cookie is attached automatically and CORS never comes into play
// from the browser's perspective.
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = (error as AxiosError<ApiErrorBody>).response?.data;
    if (body?.message) return Array.isArray(body.message) ? body.message.join(', ') : body.message;
  }
  return 'Something went wrong. Please try again.';
}

interface Envelope<T> {
  data: T;
  meta: PaginationMeta | null;
}

/** Unwraps the backend's `{ data, meta }` envelope into the plain payload. */
export async function unwrap<T>(promise: Promise<{ data: Envelope<T> }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}

/** Same, but keeps `meta` — used for paginated list endpoints. */
export async function unwrapPaginated<T>(
  promise: Promise<{ data: Envelope<T[]> }>,
): Promise<{ data: T[]; meta: PaginationMeta }> {
  const response = await promise;
  return { data: response.data.data, meta: response.data.meta as PaginationMeta };
}
