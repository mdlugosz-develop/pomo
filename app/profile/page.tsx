'use client'

import { useAuth } from '@/contexts/auth-context'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async () => {
    try {
      setLoading(true)
      const response = await supabase.auth.updateUser({
        password: newPassword
      })

      if (response.error) {
        throw response.error
      }

      toast({
        title: 'Success',
        description: 'Password updated successfully'
      })
      setNewPassword('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update password',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="container max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>
      
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="w-20 h-20" />
          <div>
            <h2 className="text-xl font-semibold">{user.email}</h2>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Email</h3>
            <Input value={user.email || ''} disabled />
            <p className="text-sm text-muted-foreground mt-1">
              Your email address cannot be changed
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Change Password</h3>
            <div className="flex gap-4">
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button onClick={handlePasswordChange} disabled={loading || !newPassword}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 