'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { LogIn, LogOut } from "lucide-react"
import { SignInDialog } from "./sign-in-dialog"
import { ComingSoonDialog } from "./coming-soon-dialog"

export function AuthButton() {
  const { user, signOut } = useAuth()
  const [showSignInDialog, setShowSignInDialog] = useState(false)
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSignUpClick = () => {
    setShowSignInDialog(false)
    setShowComingSoonDialog(true)
  }

  const handleSignInClick = () => {
    setShowComingSoonDialog(false)
    setShowSignInDialog(true)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={user ? handleSignOut : () => setShowSignInDialog(true)}
      >
        {user ? (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </>
        )}
      </Button>

      <SignInDialog 
        isOpen={showSignInDialog} 
        onClose={() => setShowSignInDialog(false)}
        onSignUpClick={handleSignUpClick}
      />

      <ComingSoonDialog
        isOpen={showComingSoonDialog}
        onClose={() => setShowComingSoonDialog(false)}
      />
    </>
  )
} 