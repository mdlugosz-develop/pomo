'use client'

import { Plus } from 'lucide-react'
import { useWorkspace } from '@/contexts/workspace-context'
import { cn } from '@/lib/utils'

export function TaskPanel() {
  const { currentWorkspace, tasks, createTask, updateTask, deleteTask } = useWorkspace()

  if (!currentWorkspace) {
    return (
      <div className="w-[300px] border-l p-4">
        <h2 className="font-medium mb-4">Tasks</h2>
        <p className="text-sm text-gray-500 text-center py-4">
          Select a workspace to see tasks
        </p>
      </div>
    )
  }

  return (
    <div className="w-[300px] border-l p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">Tasks</h2>
        <button className="p-1 hover:bg-gray-100 rounded">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-3 rounded-md border hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => updateTask(task.id, { completed: e.target.checked })}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "text-sm font-medium",
                  task.completed && "line-through text-gray-500"
                )}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className={cn(
                    "text-sm text-gray-500 mt-1",
                    task.completed && "line-through"
                  )}>
                    {task.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No tasks yet
          </p>
        )}
      </div>
    </div>
  )
}
  