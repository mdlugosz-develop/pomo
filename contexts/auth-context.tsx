'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import Cookies from 'js-cookie'

const ACCESS_TOKEN_KEY = 'access_token'
const LAST_ACTIVITY_KEY = 'last_activity'
// Session timeout after 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
// Token refresh interval - refresh token every 23 hours
const TOKEN_REFRESH_INTERVAL = 23 * 60 * 60 * 1000 // 23 hours in milliseconds
// Inactivity timeout - 1 minute (for testing)
const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 1 minute in milliseconds

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signUpWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Check for inactivity
  const checkInactivity = () => {
    const lastActivity = Cookies.get(LAST_ACTIVITY_KEY)
    if (lastActivity) {
      const inactiveTime = Date.now() - parseInt(lastActivity)
      console.log(`Inactivity check: ${inactiveTime / 1000}s since last activity, timeout at ${INACTIVITY_TIMEOUT / 1000}s`)
      if (inactiveTime > INACTIVITY_TIMEOUT) {
        console.log('User inactive, signing out')
        signOut()
      }
    }
  }

  // Update the last activity timestamp
  const updateLastActivity = () => {
    const now = Date.now()
    console.log('Activity detected, updating timestamp')
    Cookies.set(LAST_ACTIVITY_KEY, now.toString(), { expires: 1 }) // 1 day
  }

  // Function to refresh the token
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        // If refresh fails, force sign out
        await signOut()
        return
      }
      
      if (data.session?.access_token) {
        // Set the refreshed access token with expiration
        Cookies.set(ACCESS_TOKEN_KEY, data.session.access_token, { 
          expires: new Date(Date.now() + SESSION_DURATION)
        })
        updateLastActivity()
      }
    } catch (err) {
      console.error('Failed to refresh session:', err)
    }
  }

  // Setup activity tracking
  useEffect(() => {
    const setupActivityTracking = () => {
      // Update activity on user interactions
      const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
      
      const handleUserActivity = () => {
        updateLastActivity()
      }
      
      events.forEach(event => {
        window.addEventListener(event, handleUserActivity)
      })
      
      // Initialize
      updateLastActivity()
      
      // Set up periodic inactivity checks - check every 10 seconds for testing
      activityTimerRef.current = setInterval(checkInactivity, 5 * 60 * 1000) 
      
      return () => {
        events.forEach(event => {
          window.removeEventListener(event, handleUserActivity)
        })
        if (activityTimerRef.current) {
          clearInterval(activityTimerRef.current)
        }
      }
    }
    
    if (user) {
      setupActivityTracking()
    }
    
    return () => {
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current)
      }
    }
  }, [user])

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
      // Set access token if session exists, with expiration
      if (data.session?.access_token) {
        Cookies.set(ACCESS_TOKEN_KEY, data.session.access_token, { 
          expires: new Date(Date.now() + SESSION_DURATION) 
        })
        updateLastActivity()
        
        // Set up token refresh timer
        refreshTimerRef.current = setInterval(refreshSession, TOKEN_REFRESH_INTERVAL)
      }
      setLoading(false)
    })

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      // Update access token on auth state change, with expiration
      if (session?.access_token) {
        Cookies.set(ACCESS_TOKEN_KEY, session.access_token, { 
          expires: new Date(Date.now() + SESSION_DURATION) 
        })
        updateLastActivity()
        
        // Reset the refresh timer
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current)
        }
        refreshTimerRef.current = setInterval(refreshSession, TOKEN_REFRESH_INTERVAL)
      } else {
        Cookies.remove(ACCESS_TOKEN_KEY)
        Cookies.remove(LAST_ACTIVITY_KEY)
        
        // Clear the refresh timer
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current)
          refreshTimerRef.current = null
        }
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
      // Clear the refresh timer
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) throw error
    
    // Set access token after successful sign in, with expiration
    if (data.session?.access_token) {
      Cookies.set(ACCESS_TOKEN_KEY, data.session.access_token, { 
        expires: new Date(Date.now() + SESSION_DURATION) 
      })
      updateLastActivity()
    }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    
    // Set access token after successful sign up (if session is available immediately), with expiration
    if (data.session?.access_token) {
      Cookies.set(ACCESS_TOKEN_KEY, data.session.access_token, { 
        expires: new Date(Date.now() + SESSION_DURATION) 
      })
      updateLastActivity()
    }
  }

  const signUpWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) throw error
    
    // Note: The access token will be handled by the auth state change listener
    // after the OAuth redirect with proper expiration
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Remove access token and last activity timestamp after sign out
    Cookies.remove(ACCESS_TOKEN_KEY)
    Cookies.remove(LAST_ACTIVITY_KEY)
    
    // Clear the refresh timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signUpWithGoogle, 
      signOut, 
      refreshSession 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}