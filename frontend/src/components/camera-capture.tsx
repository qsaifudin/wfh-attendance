'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cameraErrorMessage, captureFrame, useCamera } from '@/hooks/use-camera';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClear?: () => void;
}

/** Live camera evidence for clock-in — captured once per session, never
 * croppable (that would defeat the point of a live capture). */
export function CameraCapture({ onCapture, onClear }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, start, stop, facingMode, toggleFacing } = useCamera(videoRef);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  useEffect(() => {
    void start();
    // Only on mount — toggling facing mode restarts the stream itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleCapture = async () => {
    if (!videoRef.current) return;
    const blob = await captureFrame(videoRef.current);
    setPreviewBlob(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    stop();
    onCapture(blob);
  };

  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
    onClear?.();
    void start();
  };

  const errorMessage = cameraErrorMessage(status);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- object URL, not an optimizable remote asset
          <img src={previewUrl} alt="Clock-in proof" className="h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : undefined}
          />
        )}
        {status === 'requesting' && !previewUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
            Starting camera…
          </div>
        )}
      </div>

      {errorMessage && !previewUrl && (
        <div className="rounded-lg border border-status-absent/30 bg-status-absent/10 p-3 text-sm text-status-absent">
          <p>{errorMessage}</p>
          <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={() => start()}>
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </Button>
        </div>
      )}

      <div className="flex justify-center gap-2">
        {!previewBlob ? (
          <>
            <Button type="button" variant="secondary" size="icon" onClick={toggleFacing} aria-label="Switch camera">
              <SwitchCamera className="h-4 w-4" />
            </Button>
            <Button type="button" onClick={handleCapture} disabled={status !== 'ready'}>
              <Camera className="h-4 w-4" /> Capture photo
            </Button>
          </>
        ) : (
          <Button type="button" variant="secondary" onClick={handleRetake}>
            <RefreshCw className="h-4 w-4" /> Retake
          </Button>
        )}
      </div>
    </div>
  );
}
