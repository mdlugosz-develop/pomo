'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { Task, Workspace } from '../lib/types'

// Add a key for localStorage
const LOCAL_TASKS_KEY = 'local_tasks'

interface WorkspaceContextType {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  tasks: Task[]
  loading: boolean
  error: string | null
  setCurrentWorkspace: (workspace: Workspace) => void
  createWorkspace: (name: string, description?: string) => Promise<void>
  createTask: (input: CreateTaskInput) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  deleteWorkspace: (workspaceId: string) => Promise<void>
  updateTaskOrder: (updates: TaskOrderUpdate[], isOptimistic?: boolean) => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

interface CreateTaskInput {
  title: string
  description?: string
  status?: 'todo' | 'in_progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  due_date?: string
}

interface TaskOrderUpdate {
  id: string
  order: number
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load local tasks on initial mount
  useEffect(() => {
    if (!user) {
      const localTasks = localStorage.getItem(LOCAL_TASKS_KEY)
      if (localTasks) {
        setTasks(JSON.parse(localTasks))
      }
    }
  }, [])

  // Save tasks to localStorage whenever they change and user is not signed in
  useEffect(() => {
    if (!user) {
      localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks))
    }
  }, [tasks, user])

  // Fetch workspaces when user changes
  useEffect(() => {
    if (!user) {
      setWorkspaces([])
      setCurrentWorkspace(null)
      setTasks([])
      setLoading(false)
      return
    }

    async function fetchWorkspaces() {
      try {
        const { data, error } = await supabase
          .from('workspaces')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setWorkspaces(data)
        if (data.length > 0 && !currentWorkspace) {
          setCurrentWorkspace(data[0])
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspaces()
  }, [user])

  // Modified to fetch ALL tasks for ALL workspaces
  useEffect(() => {
    if (!user || workspaces.length === 0) {
      setTasks([])
      return
    }

    async function fetchTasks() {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .in('workspace_id', workspaces.map(w => w.id))
          .order('order', { ascending: true })
          .order('created_at', { ascending: false })

        if (error) throw error
        setTasks(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred')
      }
    }

    fetchTasks()
  }, [user, workspaces])

  // Add real-time subscription for tasks across all workspaces
  useEffect(() => {
    if (!user || workspaces.length === 0) return

    const channel = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `workspace_id=in.(${workspaces.map(w => w.id).join(',')})`,
        },
        async (payload) => {
          // Refresh all tasks when there's any change
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .in('workspace_id', workspaces.map(w => w.id))
            .order('order', { ascending: true })
            .order('created_at', { ascending: false })

          if (!error && data) {
            setTasks(data)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, workspaces])

  // Create a new workspace
  const createWorkspace = async (name: string, description?: string) => {
    if (!user) {
      setError('You must be signed in to create a workspace')
      throw new Error('You must be signed in to create a workspace')
    }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([
          {
            name,
            description,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setWorkspaces([data, ...workspaces])
      setCurrentWorkspace(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
      throw e
    }
  }

  // Modified createTask function
  const createTask = async ({ 
    title, 
    description, 
    status = 'todo', 
    priority = 'medium',
    due_date 
  }: CreateTaskInput) => {
    if (!user) {
      // Create local task when user is not signed in
      const newTask: Task = {
        id: crypto.randomUUID(), // Generate a local ID
        title,
        description,
        status,
        priority,
        due_date,
        order: (Math.max(0, ...tasks.map(t => t.order ?? 0)) + 1000), // Add order for local tasks
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        workspace_id: '', // No workspace for local tasks
      }
      setTasks([newTask, ...tasks])
      return
    }

    // Database task creation logic with order
    if (!currentWorkspace) throw new Error('No workspace selected')

    try {
      // Calculate the highest current order value
      const maxOrder = Math.max(0, ...tasks.map(t => t.order ?? 0))
      const newOrder = maxOrder + 1000 // Add buffer for future reordering

      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title,
            description,
            status,
            priority,
            due_date,
            order: newOrder,
            workspace_id: currentWorkspace.id,
          },
        ])
        .select()
        .single()

      if (error) throw error
      setTasks([data, ...tasks])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
      throw e
    }
  }

  // Modified updateTask function
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) {
      // Update local task
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ))
      return
    }

    // Existing database update logic...
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
      throw e
    }
  }

  // Modified deleteTask function
  const deleteTask = async (taskId: string) => {
    if (!user) {
      // Delete local task
      setTasks(tasks.filter(task => task.id !== taskId))
      return
    }

    // Existing database delete logic...
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
      throw e
    }
  }

  const deleteWorkspace = async (workspaceId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId)
        .eq('user_id', user.id)

      if (error) throw error

      setWorkspaces(workspaces.filter(w => w.id !== workspaceId))
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(workspaces.find(w => w.id !== workspaceId) || null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
      throw e
    }
  }

  const updateTaskOrder = async (updates: TaskOrderUpdate[], isOptimistic = false) => {
    // Always update local state first for immediate feedback
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
        const update = updates.find(u => u.id === task.id)
        return update ? { ...task, order: update.order } : task
      })
      return updatedTasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    })

    // If this is just an optimistic update, don't sync with database
    if (isOptimistic || !user || !currentWorkspace) return

    try {
      // Find existing tasks to preserve their data
      const existingTasks = tasks.reduce((acc, task) => {
        acc[task.id] = task
        return acc
      }, {} as Record<string, Task>)

      // Batch update all tasks
      const { error } = await supabase.from('tasks').upsert(
        updates.map(update => ({
          ...existingTasks[update.id], // Preserve all existing task data
          id: update.id,
          order: update.order,
          workspace_id: currentWorkspace.id,
          updated_at: new Date().toISOString()
        })),
        {
          onConflict: 'id'
        }
      )

      if (error) {
        console.error('Error updating task order:', error)
        throw error
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
      throw e
    }
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        tasks,
        loading,
        error,
        setCurrentWorkspace,
        createWorkspace,
        createTask,
        updateTask,
        deleteTask,
        deleteWorkspace,
        updateTaskOrder,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}