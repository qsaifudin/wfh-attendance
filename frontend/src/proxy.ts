import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Proxy (formerly "middleware", renamed in Next.js 16) runs Node.js by
// default now — jose still works fine there, and it stays the right choice
// since it's also what verifies the same token in requests that do run on
// the Edge in other deployments, and it shares the same secret with the
// backend, giving this a real server-side RBAC guard, not just a
// client-side redirect.
const COOKIE_NAME = process.env.COOKIE_NAME ?? 'wfh_token';
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? '');

interface SessionPayload {
  sub: number;
  role: 'ADMIN' | 'EMPLOYEE';
}

async function readSession(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secret);
    return payload;
  } catch {
    return null;
  }
}

const ADMIN_PREFIX = '/admin';
const EMPLOYEE_PATHS = ['/dashboard', '/attendance', '/profile'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSession(request);

  const homeFor = (role: SessionPayload['role']) =>
    role === 'ADMIN' ? '/admin' : '/dashboard';

  if (pathname === '/login') {
    if (session) return NextResponse.redirect(new URL(homeFor(session.role), request.url));
    return NextResponse.next();
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(session ? homeFor(session.role) : '/login', request.url));
  }

  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
  const isEmployeeRoute = EMPLOYEE_PATHS.some((p) => pathname.startsWith(p));

  if (isAdminRoute || isEmployeeRoute) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isAdminRoute && session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (isEmployeeRoute && session.role !== 'EMPLOYEE') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/attendance/:path*', '/profile/:path*', '/admin/:path*'],
};
