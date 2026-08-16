/**
 * Phone photos carry an EXIF rotation flag that a naive canvas draw ignores,
 * producing sideways avatars. `createImageBitmap` with `imageOrientation:
 * 'from-image'` bakes the correct rotation into pixels once, up front — so
 * the cropper and the final export never have to think about EXIF again.
 */
export async function normalizeOrientation(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error('Failed to read image'))),
      'image/png',
    );
  });
}

export interface CropPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Crops `imageUrl` to `crop` and returns a square JPEG capped at
 * `outputSize` — the source is already orientation-normalized, so this is a
 * plain pixel copy. */
export function cropImageToBlob(
  imageUrl: string,
  crop: CropPixels,
  outputSize = 512,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas is not supported in this browser'));

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        outputSize,
        outputSize,
      );
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Failed to crop image'))),
        'image/jpeg',
        0.85,
      );
    };
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = imageUrl;
  });
}
