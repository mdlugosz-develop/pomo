import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only allow access to the root path '/'
  if (pathname == '/no') {
    // Redirect to the root path
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Match all paths except api routes, static files, and other Next.js internal routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 