export type TaskStatus = 'todo' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  created_at: string
  updated_at: string
  order?: number
  workspace_id: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string
}

export interface TaskOrderUpdate {
  id: string
  order: number
}

export interface WorkspaceContextType {
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
  updateTaskOrder: (updates: TaskOrderUpdate[]) => Promise<void>
}
