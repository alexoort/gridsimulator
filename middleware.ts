import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  // Allow access to welcome page, root path, and auth API
  if (
    request.nextUrl.pathname === '/welcome' ||
    request.nextUrl.pathname === '/api/auth' ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/dashboard'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  // If no token, redirect to welcome page
  if (!token) {
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  try {
    // Verify token
    await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to welcome page
    return NextResponse.redirect(new URL('/welcome', request.url));
  }
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - welcome
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!welcome|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 