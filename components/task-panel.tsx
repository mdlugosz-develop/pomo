'use client'

import { useState, KeyboardEvent, useEffect } from 'react'
import { useWorkspace } from '@/contexts/workspace-context'
import { Plus, ChevronDown, ChevronRight, ClipboardList, X } from 'lucide-react'
import { Input } from './ui/input'
import { useAuth } from '@/contexts/auth-context'
import { TaskItem } from './task-item'
import { cn } from '@/lib/utils'
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

export function TaskPanel() {
  const { user } = useAuth()
  const { currentWorkspace, tasks, createTask, updateTask, deleteTask, updateTaskOrder } = useWorkspace()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive layout
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Check on initial load
    checkIfMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile)
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )

  // Filter tasks based on authentication status
  const filteredTasks = user 
    ? tasks.filter(task => task.workspace_id === currentWorkspace?.id)
    : tasks.filter(task => !task.workspace_id) // Show local tasks when not authenticated

  // Separate active and completed tasks
  const activeTasks = filteredTasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => {
      if (a.order !== b.order) {
        return (a.order ?? 0) - (b.order ?? 0)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const completedTasks = filteredTasks
    .filter(task => task.status === 'completed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = activeTasks.findIndex(task => task.id === active.id)
      const newIndex = activeTasks.findIndex(task => task.id === over.id)

      // Create a new array with the updated order
      const reorderedTasks = [...activeTasks]
      const [movedTask] = reorderedTasks.splice(oldIndex, 1)
      reorderedTasks.splice(newIndex, 0, movedTask)

      // Calculate new orders
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        order: index * 1000
      }))

      // Update local state immediately
      updateTaskOrder(updates, true)

      // Then sync with database
      try {
        await updateTaskOrder(updates, false)
      } catch (error) {
        console.error('Failed to update task order:', error)
      }
    }
  }

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

  const handlePriorityChange = async (taskId: string, priority: 'low' | 'medium' | 'high') => {
    await updateTask(taskId, { priority })
  }

  const TaskList = () => (
    <div className="space-y-4">
      {/* Active Tasks */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={activeTasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={deleteTask}
                onStatusToggle={toggleTaskStatus}
                onPriorityChange={handlePriorityChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
                <TaskItem
                  key={task.id}
                  task={task}
                  onDelete={deleteTask}
                  onStatusToggle={toggleTaskStatus}
                  onPriorityChange={handlePriorityChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {filteredTasks.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No tasks yet
        </p>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <button 
          className="fixed top-4 right-4 z-30 p-2 bg-white rounded-md shadow-md md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close tasks" : "Open tasks"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
        </button>
      )}

      {/* Task panel */}
      <div 
        className={cn(
          "w-full md:w-[300px] border-l p-4 flex flex-col h-screen bg-white overflow-y-auto z-20",
          "transition-all duration-300 ease-in-out",
          isMobile && !isOpen ? "fixed -right-full" : isMobile ? "fixed right-0" : ""
        )}
      >
        <div className="mb-4">
          <h2 className="font-medium mb-4">
            {user ? (currentWorkspace?.name || 'Select a workspace') : 'Local Tasks'}
          </h2>
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

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
  