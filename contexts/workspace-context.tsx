'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { Task, Workspace } from '../lib/types'

interface WorkspaceContextType {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  tasks: Task[]
  loading: boolean
  error: string | null
  setCurrentWorkspace: (workspace: Workspace) => void
  createWorkspace: (name: string, description?: string) => Promise<void>
  createTask: (title: string, description?: string) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          .eq('user_id', user.id)
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

  // Fetch tasks when currentWorkspace changes
  useEffect(() => {
    if (!currentWorkspace || !user) {
      setTasks([])
      return
    }

    async function fetchTasks() {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('workspace_id', currentWorkspace.id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setTasks(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred')
      }
    }

    fetchTasks()
  }, [currentWorkspace, user])

  // Create a new workspace
  const createWorkspace = async (name: string, description?: string) => {
    if (!user) throw new Error('User must be logged in')

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

  // Create a new task
  const createTask = async (title: string, description?: string) => {
    if (!user) throw new Error('User must be logged in')
    if (!currentWorkspace) throw new Error('No workspace selected')

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title,
            description,
            completed: false,
            workspace_id: currentWorkspace.id,
            user_id: user.id,
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

  // Update a task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
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

  // Delete a task
  const deleteTask = async (taskId: string) => {
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