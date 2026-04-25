import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const adminRoutes = ['/admin'];
const publicRoutes = ['/login', '/signup', '/forgot-password', '/pricing', '/', '/blog', '/docs', '/privacy', '/terms'];

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const token = process.env.NEXTAUTH_SECRET
    ? await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    : null;

  const isPublic = publicRoutes.some((r) => pathname === r || pathname.startsWith('/api/'));
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!token || !['ADMIN', 'SUPER_ADMIN'].includes(String(token.role))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/interviews/:path*', '/hackathons/:path*', '/tests/:path*', '/settings/:path*', '/settings', '/billing', '/notifications'],
};
