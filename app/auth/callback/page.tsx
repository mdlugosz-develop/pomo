'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Cookies from 'js-cookie'
import {
  ACCESS_TOKEN_KEY,
  LAST_ACTIVITY_KEY,
  SESSION_DURATION,
  DEBUG_AUTH
} from '@/lib/security-constants'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Update the last activity timestamp
    const updateLastActivity = () => {
      const now = Date.now()
      Cookies.set(LAST_ACTIVITY_KEY, now.toString(), { expires: 1 }) // 1 day
      if (DEBUG_AUTH) {
        console.log('Auth callback: Setting last activity timestamp')
      }
    }
    
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      if (DEBUG_AUTH) {
        console.log('Auth callback: Processing authentication')
      }
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
        if (DEBUG_AUTH) {
          console.log('Auth callback: Authentication successful, redirecting')
        }
        router.push('/') // Redirect to home page after successful sign in
      } else {
        if (DEBUG_AUTH) {
          console.log('Auth callback: No session data, redirecting to home')
        }
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