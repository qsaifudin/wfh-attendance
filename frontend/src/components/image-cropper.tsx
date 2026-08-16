'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { ZoomIn } from 'lucide-react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cropImageToBlob, normalizeOrientation } from '@/lib/image';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

interface ImageCropperProps {
  file: File | null;
  onConfirm: (blob: Blob) => void;
  onOpenChange: (open: boolean) => void;
}

/** Drag to reposition, pinch or slide to zoom, crop to a 1:1 round mask —
 * used for employee profile photos only. The live clock-in photo is never
 * croppable, so this component is intentionally separate from CameraCapture. */
export function ImageCropper({ file, onConfirm, onOpenChange }: ImageCropperProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  // Pure function of `file` — computed at render time instead of via an
  // effect + setState, which is both simpler and avoids a synchronous
  // setState call inside an effect body (a footgun for cascading renders,
  // and something the React Compiler explicitly warns about now).
  const validationError = useMemo(() => {
    if (!file) return null;
    if (!ALLOWED_TYPES.includes(file.type)) return 'Only JPEG or PNG images are allowed.';
    if (file.size > MAX_SIZE_BYTES) return 'Image must be 5MB or smaller.';
    return null;
  }, [file]);

  const error = validationError ?? loadError;

  useEffect(() => {
    // Nothing to load: no file, or it already failed synchronous
    // validation above. A stale imageUrl from a previous file is never
    // rendered here since `error` takes precedence in the JSX below, and
    // the Dialog itself is only open while `file` is truthy.
    if (!file || validationError) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    normalizeOrientation(file)
      .then((url) => {
        if (cancelled) return;
        objectUrl = url;
        setLoadError(null);
        setImageUrl(url);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      })
      .catch(() => !cancelled && setLoadError('Could not read this image.'));

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, validationError]);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageUrl || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await cropImageToBlob(imageUrl, croppedAreaPixels);
      onConfirm(blob);
      onOpenChange(false);
    } catch {
      setLoadError('Could not process this image.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!file} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust photo</DialogTitle>
          <DialogDescription>Drag to reposition, use the slider to zoom.</DialogDescription>
        </DialogHeader>

        <DialogBody>
          {error ? (
            <div className="rounded-lg border border-status-absent/30 bg-status-absent/10 p-3 text-sm text-status-absent">
              {error}
            </div>
          ) : imageUrl ? (
            <>
              <div className="relative h-72 w-full overflow-hidden rounded-lg bg-black">
                <Cropper
                  image={imageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className="flex items-center gap-3">
                <ZoomIn className="h-4 w-4 text-ink-muted" />
                <Slider
                  min={1}
                  max={3}
                  step={0.01}
                  value={[zoom]}
                  onValueChange={([value]) => setZoom(value)}
                />
              </div>
            </>
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-ink-muted">Loading image…</div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!imageUrl || !!error} loading={saving}>
            Save photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
