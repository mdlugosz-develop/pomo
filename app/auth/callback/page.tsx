'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Cookies from 'js-cookie'

// Constants for session management (matching auth-context.tsx)
const ACCESS_TOKEN_KEY = 'access_token'
const LAST_ACTIVITY_KEY = 'last_activity'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Update the last activity timestamp
    const updateLastActivity = () => {
      const now = Date.now()
      Cookies.set(LAST_ACTIVITY_KEY, now.toString(), { expires: 1 }) // 1 day
    }
    
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error during auth callback:', error)
        router.push('/')
        return
      }
      
      if (data.session?.access_token) {
        // Set the access token with expiration
        Cookies.set(ACCESS_TOKEN_KEY, data.session.access_token, { 
          expires: new Date(Date.now() + SESSION_DURATION) 
        })
        updateLastActivity()
        router.push('/') // Redirect to home page after successful sign in
      } else {
        router.push('/')
      }
    }
    
    handleAuthCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
} 