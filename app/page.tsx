'use client'

import { TimerDisplay } from '@/components/timer-display'
import { DashboardStats } from '@/components/dashboard-stats'

export default function Home() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <DashboardStats />

      <TimerDisplay />
    </div>
  )
}
