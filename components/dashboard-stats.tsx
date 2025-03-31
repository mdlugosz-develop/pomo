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
    <section aria-labelledby="dashboard-stats-heading">
      <h2 id="dashboard-stats-heading" className="text-xl font-semibold mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatsCard 
          title="Active Projects" 
          count={workspaceCount} 
          isLoading={loading} 
          ariaLabel={`${workspaceCount} active projects`}
        />
        <StatsCard 
          title="Pending Tasks" 
          count={uncompletedTasksCount} 
          isLoading={loading} 
          ariaLabel={`${uncompletedTasksCount} pending tasks`}
        />
      </div>
    </section>
  )
} 