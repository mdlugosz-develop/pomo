import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that should be accessible without authentication
const publicPaths = [
  '/',                    // Home page
  '/sounds',         // Public API routes
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`)
  )

  if (isPublicPath) {
    return res
  }

  // Check auth status
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and trying to access protected route, redirect to home
  if (!session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 