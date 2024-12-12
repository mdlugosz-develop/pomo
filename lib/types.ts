export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  workspace_id: string
  created_at: string
  user_id: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  created_at: string
  user_id: string
} 