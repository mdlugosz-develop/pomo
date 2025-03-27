'use client'

import { useWorkspace } from '@/contexts/workspace-context'
import { StatsCard } from './stats-card'

export function DashboardStats() {
  const { workspaces, tasks, loading } = useWorkspace()
  
  // Count of workspaces
  const workspaceCount = workspaces.length

  // Count of uncompleted tasks across all workspaces
  const uncompletedTasksCount = tasks.filter(task => task.status !== 'completed').length

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <StatsCard 
        title="Active Projects" 
        count={workspaceCount} 
        isLoading={loading} 
      />
      <StatsCard 
        title="Pending Tasks" 
        count={uncompletedTasksCount} 
        isLoading={loading} 
      />
    </div>
  )
} 