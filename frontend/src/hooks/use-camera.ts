'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'ready' | 'denied' | 'not-found' | 'not-readable';

const CAMERA_ERROR_MESSAGES: Record<CameraStatus, string | null> = {
  idle: null,
  requesting: null,
  ready: null,
  denied: 'Camera access was denied. Allow it in your browser settings and try again.',
  'not-found': 'No camera was found on this device.',
  'not-readable': 'The camera is already in use by another app.',
};

export function cameraErrorMessage(status: CameraStatus): string | null {
  return CAMERA_ERROR_MESSAGES[status];
}

export function useCamera(videoRef: RefObject<HTMLVideoElement | null>) {
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(
    async (mode: 'user' | 'environment' = facingMode) => {
      stop();
      setStatus('requesting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 1280 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus('ready');
      } catch (error) {
        const name = (error as DOMException).name;
        if (name === 'NotAllowedError' || name === 'SecurityError') setStatus('denied');
        else if (name === 'NotFoundError' || name === 'OverconstrainedError') setStatus('not-found');
        else setStatus('not-readable');
      }
    },
    [facingMode, stop, videoRef],
  );

  const toggleFacing = useCallback(() => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    void start(next);
  }, [facingMode, start]);

  // Stops all tracks on unmount — otherwise the browser's camera indicator
  // stays lit even after the user has navigated away.
  useEffect(() => stop, [stop]);

  return { status, start, stop, facingMode, toggleFacing };
}

/** Draws the current video frame to a canvas and returns a JPEG blob capped
 * at 1280px on the long edge — keeps clock-in uploads around 200–500KB. */
export function captureFrame(video: HTMLVideoElement): Promise<Blob> {
  const maxDimension = 1280;
  const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to capture photo'))),
      'image/jpeg',
      0.8,
    );
  });
}
