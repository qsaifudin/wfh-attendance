/** Minimal "name=value; name2=value2" parser — used where we only have the
 * raw Cookie header (the Socket.IO handshake) and don't want a dependency
 * for one lookup. */
export function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}
