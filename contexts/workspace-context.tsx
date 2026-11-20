'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Task, Workspace, WorkspaceContextType, CreateTaskInput, TaskOrderUpdate } from '@/lib/types'
import {
  DEFAULT_WORKSPACE_NAME,
  createWorkspaceRecord,
  loadAndMigrate,
  saveCurrentWorkspaceId,
  saveTasks,
  saveWorkspaces,
} from '@/lib/local-store'

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)

  useEffect(() => {
    const state = loadAndMigrate()
    setWorkspaces(state.workspaces)
    setTasks(state.tasks)
    setCurrentWorkspaceId(state.currentWorkspaceId)
    setLoading(false)
  }, [])

  // Persist changes. Skipped while loading so the empty initial state
  // never overwrites what's stored.
  useEffect(() => {
    if (!loading) saveWorkspaces(workspaces)
  }, [workspaces, loading])

  useEffect(() => {
    if (!loading) saveTasks(tasks)
  }, [tasks, loading])

  useEffect(() => {
    if (!loading) saveCurrentWorkspaceId(currentWorkspaceId)
  }, [currentWorkspaceId, loading])

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId) ?? null

  const setCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspaceId(workspace.id)
  }

  const createWorkspace = async (name: string, description?: string) => {
    const workspace = createWorkspaceRecord(name, description || undefined)
    setWorkspaces(prev => [workspace, ...prev])
    setCurrentWorkspaceId(workspace.id)
  }

  const deleteWorkspace = async (workspaceId: string) => {
    const remaining = workspaces.filter(w => w.id !== workspaceId)
    const nextWorkspaces = remaining.length > 0
      ? remaining
      : [createWorkspaceRecord(DEFAULT_WORKSPACE_NAME)]

    setWorkspaces(nextWorkspaces)
    setTasks(prev => prev.filter(task => task.workspace_id !== workspaceId))
    if (currentWorkspaceId === workspaceId || remaining.length === 0) {
      setCurrentWorkspaceId(nextWorkspaces[0].id)
    }
  }

  const createTask = async ({
    title,
    description,
    status = 'todo',
    priority = 'medium',
    due_date,
  }: CreateTaskInput) => {
    if (!currentWorkspace) throw new Error('No workspace selected')
    const workspaceId = currentWorkspace.id
    const now = new Date().toISOString()

    setTasks(prev => {
      const maxOrder = Math.max(
        0,
        ...prev.filter(t => t.workspace_id === workspaceId).map(t => t.order ?? 0)
      )
      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        description,
        status,
        priority,
        due_date,
        order: maxOrder + 1000, // leave gaps for reordering
        created_at: now,
        updated_at: now,
        workspace_id: workspaceId,
      }
      return [newTask, ...prev]
    })
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const now = new Date().toISOString()
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates, updated_at: now } : task
    ))
  }

  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const updateTaskOrder = async (updates: TaskOrderUpdate[]) => {
    const orderById = new Map(updates.map(u => [u.id, u.order]))
    setTasks(prev => prev.map(task =>
      orderById.has(task.id) ? { ...task, order: orderById.get(task.id) } : task
    ))
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
