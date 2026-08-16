'use client';

import { useSyncExternalStore } from 'react';

const query = '(prefers-color-scheme: dark)';

function subscribe(callback: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

/** Charts render to SVG with literal hex fills (not CSS vars), so they need
 * to know the mode explicitly rather than relying on the cascade.
 * useSyncExternalStore is the correct primitive for external browser state
 * like a media query — unlike an effect that calls setState on mount, it
 * has no synchronous-setState-in-effect footgun and no hydration mismatch. */
export function useDarkMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
