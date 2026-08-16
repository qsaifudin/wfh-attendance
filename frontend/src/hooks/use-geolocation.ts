'use client';

import { useCallback, useState } from 'react';

export type GeolocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'granted'; latitude: number; longitude: number; accuracy: number }
  | { status: 'denied'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'timeout'; message: string };

/** Requests the position once, on demand — never polled, never watched in
 * the background. Every failure mode gets its own message and the caller
 * can always retry, so a misclicked "block" prompt never locks anyone out. */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' });

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'unavailable', message: 'This browser does not support geolocation.' });
      return;
    }

    setState({ status: 'requesting' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'granted',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setState({
            status: 'denied',
            message: 'Location access was denied. Allow it in your browser settings and try again.',
          });
        } else if (error.code === error.TIMEOUT) {
          setState({ status: 'timeout', message: 'Getting your location took too long. Try again.' });
        } else {
          setState({ status: 'unavailable', message: 'Could not determine your location.' });
        }
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }, []);

  return { state, request };
}
