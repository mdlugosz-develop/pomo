'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import Cookies from 'js-cookie'

const ACCESS_TOKEN_KEY = 'access_token'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
      // Set access token if session exists
      if (data.session?.access_token) {
        Cookies.set(ACCESS_TOKEN_KEY, data.session.access_token)
      }
      setLoading(false)
    })

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      // Update access token on auth state change
      if (session?.access_token) {
        Cookies.set(ACCESS_TOKEN_KEY, session.access_token)
      } else {
        Cookies.remove(ACCESS_TOKEN_KEY)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) throw error
    
    // Set access token after successful sign in
    if (data.session?.access_token) {
      Cookies.set(ACCESS_TOKEN_KEY, data.session.access_token)
    }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    
    // Set access token after successful sign up (if session is available immediately)
    if (data.session?.access_token) {
      Cookies.set(ACCESS_TOKEN_KEY, data.session.access_token)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Remove access token after sign out
    Cookies.remove(ACCESS_TOKEN_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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