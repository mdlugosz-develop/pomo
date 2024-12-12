'use client'

import { TimerDisplay } from '@/components/timer-display'
import { useAuth } from '@/contexts/auth-context'
import { useWorkspace } from '@/contexts/workspace-context'
import { Info } from '@/components/info'
export default function Home() {
  const { user } = useAuth()
  const { currentWorkspace, loading } = useWorkspace()

  
  return (
    <div>
      <TimerDisplay />
    </div>
  )
}
