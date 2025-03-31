import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import {
  ACCESS_TOKEN_KEY,
  LAST_ACTIVITY_KEY,
  INACTIVITY_TIMEOUT
} from '@/lib/security-constants'

// Add paths that should be accessible without authentication
const publicPaths = [
  '/',                    // Home page
  '/sounds',              // Public API routes
  '/tasks',               // Tasks page
  '/privacy',             // Privacy page
  '/terms',               // Terms page
  '/auth/callback',       // Auth callback page
  '/profile',             // Profile page
  '/about',               // About page
  '/sitemap.xml'          // Sitemap
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`)
  )
  
  // Add specific check for profile path
  const isProfilePath = req.nextUrl.pathname === '/profile'

  // Check auth status
  const sessionCookie = cookies().get(ACCESS_TOKEN_KEY)
  const lastActivityCookie = cookies().get(LAST_ACTIVITY_KEY)
  
  // Check for inactivity timeout
  let isInactive = false
  if (lastActivityCookie) {
    const lastActivity = parseInt(lastActivityCookie.value)
    const now = Date.now()
    isInactive = (now - lastActivity) > INACTIVITY_TIMEOUT
  }
  
  // If token exists and not inactive, consider authenticated
  const isAuthenticated = sessionCookie && !isInactive
  
  // If not authenticated and trying to access protected route or profile, redirect to home
  if (!isAuthenticated && (!isPublicPath || isProfilePath)) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  return res
}

// Update the matcher to explicitly include the profile route
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/profile'
  ],
} 