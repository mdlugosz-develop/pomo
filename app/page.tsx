'use client'

import { TimerDisplay } from '@/components/timer-display'
import { DashboardStats } from '@/components/dashboard-stats'
import { ActivityGrid } from '@/components/activity-grid'
import { useAuth } from '@/contexts/auth-context'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <DashboardStats />
      
      {/* Only show activity grid for logged in users */}
      {user && (
        <ActivityGrid />
      )}
      
      <TimerDisplay />
    </div>
  )
}
