'use client'

import { useState, KeyboardEvent } from 'react'
import { useWorkspace } from '@/contexts/workspace-context'
import { cn } from '@/lib/utils'
import { Plus, Check } from 'lucide-react'
import { Input } from './ui/input'

export function TaskPanel() {
  const { currentWorkspace, tasks, createTask, updateTask, deleteTask } = useWorkspace()
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (a.status !== 'completed' && b.status === 'completed') return -1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return
    
    try {
      await createTask({
        title: newTaskTitle.trim(),
        status: 'todo',
        priority: 'medium'
      })
      setNewTaskTitle('')
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateTask()
    }
  }

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    await updateTask(taskId, { 
      status: currentStatus === 'completed' ? 'todo' : 'completed' 
    })
  }

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
      <div className="mb-4">
        <h2 className="font-medium mb-4">Tasks</h2>
        <div className="flex gap-2">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a task..."
            className="flex-1"
          />
          <button
            onClick={handleCreateTask}
            className="p-2 hover:bg-gray-100 rounded"
            disabled={!newTaskTitle.trim()}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTaskStatus(task.id, task.status)}
            className={cn(
              "group p-3 rounded-md border transition-colors cursor-pointer",
              task.status === 'completed' 
                ? "bg-green-50 border-green-200 hover:border-green-300" 
                : "hover:border-gray-300"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "text-sm font-medium",
                    task.status === 'completed' 
                      ? "text-green-600" 
                      : "text-gray-700"
                  )}>
                    {task.title}
                  </h3>
                  {task.due_date && (
                    <span className={cn(
                      "text-xs",
                      task.status === 'completed' 
                        ? "text-green-500" 
                        : "text-gray-500"
                    )}>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className={cn(
                    "text-sm mt-1",
                    task.status === 'completed' 
                      ? "text-green-500" 
                      : "text-gray-500"
                  )}>
                    {task.description}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteTask(task.id)
                }}
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
  