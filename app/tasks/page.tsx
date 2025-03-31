'use client'

import { useWorkspace } from "@/contexts/workspace-context"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AuthButton } from "@/components/auth-button"
import Script from 'next/script'

export default function TasksPage() {
  const { user } = useAuth()
  const { workspaces, tasks, updateTask } = useWorkspace()

  // Show sign-in prompt for unauthenticated users
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-3">Sign in Required</h2>
          <p className="text-gray-500 mb-6">
            Please sign in to view your tasks and workspaces.
          </p>
          <AuthButton />
        </Card>
      </div>
    )
  }

  // Group tasks by workspace and status
  const workspaceData = workspaces.map(workspace => {
    const workspaceTasks = tasks.filter(task => task.workspace_id === workspace.id)
    return {
      ...workspace,
      activeTasks: workspaceTasks.filter(task => task.status !== 'completed'),
      completedTasks: workspaceTasks.filter(task => task.status === 'completed')
    }
  })

  return (
    <div className="h-full flex flex-col">
      <Script id="tasks-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Task Management with Pomodoro Technique",
          "description": "Manage your tasks efficiently with PomoTime using the Pomodoro technique.",
          "url": "https://pomotime.io/tasks"
        })
      }} />

      <div className="flex-none p-6">
        <h1 className="text-2xl font-semibold">Workspaces & Tasks</h1>
      </div>
      
      <div className="flex-1 overflow-auto px-3 sm:px-6 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-4 sm:gap-6">
            {workspaceData.map((workspace) => (
              <Card key={workspace.id} className="p-4 sm:p-6">
                <h2 className="text-xl font-medium mb-4 sm:mb-6">{workspace.name}</h2>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                  {/* Active Tasks */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Active Tasks</h3>
                    <div className="space-y-2">
                      {workspace.activeTasks.map(task => (
                        <div
                          key={task.id}
                          className="p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => updateTask(task.id, { status: 'completed' })}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex-1">{task.title}</span>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs",
                              task.priority === 'high' && "bg-red-100 text-red-700",
                              task.priority === 'medium' && "bg-yellow-100 text-yellow-700",
                              task.priority === 'low' && "bg-green-100 text-green-700"
                            )}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                      {workspace.activeTasks.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No active tasks</p>
                      )}
                    </div>
                  </div>

                  {/* Completed Tasks */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Completed Tasks</h3>
                    <div className="space-y-2">
                      {workspace.completedTasks.map(task => (
                        <div
                          key={task.id}
                          className="p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex-1 text-gray-500 line-through">{task.title}</span>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs opacity-50",
                              task.priority === 'high' && "bg-red-100 text-red-700",
                              task.priority === 'medium' && "bg-yellow-100 text-yellow-700",
                              task.priority === 'low' && "bg-green-100 text-green-700"
                            )}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                      {workspace.completedTasks.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No completed tasks</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {workspaces.length === 0 && (
              <Card className="p-6">
                <p className="text-center text-gray-500">
                  No workspaces found. Create a workspace to start adding tasks.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 