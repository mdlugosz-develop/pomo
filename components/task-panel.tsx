'use client'

import { useState, KeyboardEvent } from 'react'
import { useWorkspace } from '@/contexts/workspace-context'
import { cn } from '@/lib/utils'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { Input } from './ui/input'
import { useAuth } from '@/contexts/auth-context'
import { Task } from '@/lib/types'

export function TaskPanel() {
  const { user } = useAuth()
  const { currentWorkspace, tasks, createTask, updateTask, deleteTask } = useWorkspace()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)

  // Separate active and completed tasks
  const activeTasks = tasks.filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const completedTasks = tasks.filter(task => task.status === 'completed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

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

  const TaskItem = ({ task }: { task: Task }) => (
    <div
      onClick={() => toggleTaskStatus(task.id, task.status)}
      className={cn(
        "group p-3 rounded-md border transition-colors cursor-pointer",
        task.status === 'completed' 
          ? "bg-gray-50 border-gray-200 hover:border-gray-300" 
          : "hover:border-gray-300"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "text-sm font-medium",
              task.status === 'completed' 
                ? "text-gray-400 line-through" 
                : "text-gray-700"
            )}>
              {task.title}
            </h3>
            {task.due_date && (
              <span className={cn(
                "text-xs",
                task.status === 'completed' 
                  ? "text-gray-400" 
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
                ? "text-gray-400 line-through" 
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
  )

  const TaskList = () => (
    <div className="space-y-4">
      {/* Active Tasks */}
      <div className="space-y-2">
        {activeTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            {showCompleted ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Completed ({completedTasks.length})
          </button>
          
          {showCompleted && (
            <div className="space-y-2 pl-2">
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}

      {tasks.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No tasks yet
        </p>
      )}
    </div>
  )

  if (!user && !currentWorkspace) {
    return (
      <div className="w-[300px] border-l p-4">
        <h2 className="font-medium mb-4">Tasks</h2>
        <div className="mb-4">
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
        <TaskList />
      </div>
    )
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
      <TaskList />
    </div>
  )
}
  