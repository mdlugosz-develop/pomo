export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  workspace_id: string
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  created_at: string
  user_id: string
} 