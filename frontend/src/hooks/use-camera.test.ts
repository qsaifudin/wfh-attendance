import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createRef } from 'react';
import { useCamera } from './use-camera';

function mockGetUserMedia(implementation: () => Promise<MediaStream>) {
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn(implementation) } });
}

describe('useCamera', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('goes from requesting to ready on a successful getUserMedia call', async () => {
    const fakeStream = { getTracks: () => [] } as unknown as MediaStream;
    mockGetUserMedia(() => Promise.resolve(fakeStream));

    const videoRef = createRef<HTMLVideoElement>();
    const { result } = renderHook(() => useCamera(videoRef));

    expect(result.current.status).toBe('idle');
    await act(async () => { await result.current.start(); });

    await waitFor(() => expect(result.current.status).toBe('ready'));
  });

  it('maps NotAllowedError to "denied", distinct from a missing camera', async () => {
    mockGetUserMedia(() => Promise.reject(Object.assign(new Error(), { name: 'NotAllowedError' })));

    const videoRef = createRef<HTMLVideoElement>();
    const { result } = renderHook(() => useCamera(videoRef));
    await act(async () => { await result.current.start(); });

    await waitFor(() => expect(result.current.status).toBe('denied'));
  });

  it('maps NotFoundError to "not-found"', async () => {
    mockGetUserMedia(() => Promise.reject(Object.assign(new Error(), { name: 'NotFoundError' })));

    const videoRef = createRef<HTMLVideoElement>();
    const { result } = renderHook(() => useCamera(videoRef));
    await act(async () => { await result.current.start(); });

    await waitFor(() => expect(result.current.status).toBe('not-found'));
  });

  it('stops all tracks on unmount, so the browser camera indicator turns off', async () => {
    const stop = vi.fn();
    const fakeStream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
    mockGetUserMedia(() => Promise.resolve(fakeStream));

    const videoRef = createRef<HTMLVideoElement>();
    const { result, unmount } = renderHook(() => useCamera(videoRef));
    await act(async () => { await result.current.start(); });
    await waitFor(() => expect(result.current.status).toBe('ready'));

    unmount();
    expect(stop).toHaveBeenCalled();
  });
});
