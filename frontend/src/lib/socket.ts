import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/** Lazily creates the shared realtime connection. WebSocket upgrades don't
 * go through the Next rewrite, so this talks to the backend origin directly
 * — the session cookie still rides along because both run on "localhost". */
export function getSocket(): Socket {
  if (!socket) {
    const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? 'http://localhost:3001';
    socket = io(`${backendOrigin}/realtime`, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
}
