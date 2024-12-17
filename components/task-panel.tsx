'use client'

import { useState, KeyboardEvent } from 'react'
import { useWorkspace } from '@/contexts/workspace-context'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { Input } from './ui/input'
import { useAuth } from '@/contexts/auth-context'
import { TaskItem } from './task-item'
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

  // Update the sorting to use order first
  const activeTasks = tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => {
      // First sort by order
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER
      if (orderA !== orderB) return orderA - orderB
      // Then by creation date if orders are equal
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const completedTasks = tasks
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
        // Optionally revert the UI if the database update fails
        // fetchTasks() or similar recovery mechanism
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
  