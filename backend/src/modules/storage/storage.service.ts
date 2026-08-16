import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UploadedFile {
  key: string;
  url: string;
}

/**
 * Client for the separately deployed storage helper service. This is the one
 * genuine microservice boundary in the system: a different process, deployed
 * independently, reached only over HTTP — see the README for why the rest of
 * the API is a modular monolith rather than split further.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.getOrThrow<string>('STORAGE_HELPER_BASE_URL');
    this.timeoutMs = Number(this.config.get('STORAGE_HELPER_TIMEOUT_MS', 15000));
  }

  async upload(file: Express.Multer.File): Promise<UploadedFile> {
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
      file.originalname,
    );

    try {
      const response = await fetch(`${this.baseUrl}/storage/upload`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        throw new Error(`upload failed with status ${response.status}`);
      }

      const body = (await response.json()) as UploadedFile;
      return body;
    } catch (error) {
      this.logger.error(`Storage upload failed: ${(error as Error).message}`);
      throw new ServiceUnavailableException('File storage is temporarily unavailable');
    }
  }

  /** Best-effort delete used for compensation and photo replacement — never
   * throws, since a failed delete should leave a harmless orphan rather than
   * fail the caller's own operation. */
  async delete(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/storage?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      if (!response.ok) {
        this.logger.warn(`Storage delete for "${key}" returned ${response.status}`);
      }
    } catch (error) {
      this.logger.warn(`Storage delete for "${key}" failed: ${(error as Error).message}`);
    }
  }
}
