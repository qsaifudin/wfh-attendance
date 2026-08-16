import { UnsupportedMediaTypeException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png'];
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — well under the helper's 50MB cap

/** Shared multer config for every photo upload field (employee avatar, clock-in proof). */
export const photoUploadOptions: MulterOptions = {
  limits: { fileSize: MAX_PHOTO_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      callback(new UnsupportedMediaTypeException('Only JPEG or PNG images are allowed'), false);
      return;
    }
    callback(null, true);
  },
};
