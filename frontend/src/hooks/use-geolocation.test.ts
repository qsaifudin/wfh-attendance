import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useGeolocation } from './use-geolocation';

describe('useGeolocation', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: vi.fn() } });
  });

  it('starts idle and moves to granted with the reported coordinates', () => {
    (navigator.geolocation.getCurrentPosition as ReturnType<typeof vi.fn>).mockImplementation(
      (success: PositionCallback) => {
        success({
          coords: { latitude: -6.2, longitude: 106.8, accuracy: 12 },
        } as GeolocationPosition);
      },
    );

    const { result } = renderHook(() => useGeolocation());
    expect(result.current.state.status).toBe('idle');

    act(() => result.current.request());

    expect(result.current.state).toEqual({
      status: 'granted',
      latitude: -6.2,
      longitude: 106.8,
      accuracy: 12,
    });
  });

  it('maps PERMISSION_DENIED to a denied state with a recoverable message', () => {
    (navigator.geolocation.getCurrentPosition as ReturnType<typeof vi.fn>).mockImplementation(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 1, PERMISSION_DENIED: 1, TIMEOUT: 3 } as GeolocationPositionError);
      },
    );

    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.request());

    expect(result.current.state.status).toBe('denied');
    expect((result.current.state as { message: string }).message).toMatch(/denied/i);
  });

  it('maps TIMEOUT to a timeout state, distinct from denied', () => {
    (navigator.geolocation.getCurrentPosition as ReturnType<typeof vi.fn>).mockImplementation(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 3, PERMISSION_DENIED: 1, TIMEOUT: 3 } as GeolocationPositionError);
      },
    );

    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.request());

    expect(result.current.state.status).toBe('timeout');
  });

  it('reports unavailable when the browser has no geolocation API at all', () => {
    vi.stubGlobal('navigator', {});
    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.request());
    expect(result.current.state.status).toBe('unavailable');
  });
});
