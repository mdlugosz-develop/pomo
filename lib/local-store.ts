import { Task, Workspace } from './types'

export const WORKSPACES_KEY = 'pomo_workspaces'
export const TASKS_KEY = 'pomo_tasks'
export const CURRENT_WORKSPACE_KEY = 'pomo_current_workspace'
// Pre-revamp key: signed-out users' tasks, stored without a workspace
const LEGACY_TASKS_KEY = 'local_tasks'

export const DEFAULT_WORKSPACE_NAME = 'Personal'

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable (e.g. private mode); keep running in memory
  }
}

function readArray<T>(key: string): T[] {
  const value = readJSON<unknown>(key, [])
  return Array.isArray(value) ? (value as T[]) : []
}

export function loadWorkspaces(): Workspace[] {
  return readArray<Workspace>(WORKSPACES_KEY)
}

export function saveWorkspaces(workspaces: Workspace[]): void {
  writeJSON(WORKSPACES_KEY, workspaces)
}

export function loadTasks(): Task[] {
  return readArray<Task>(TASKS_KEY)
}

export function saveTasks(tasks: Task[]): void {
  writeJSON(TASKS_KEY, tasks)
}

export function loadCurrentWorkspaceId(): string | null {
  try {
    return localStorage.getItem(CURRENT_WORKSPACE_KEY)
  } catch {
    return null
  }
}

export function saveCurrentWorkspaceId(id: string | null): void {
  try {
    if (id) localStorage.setItem(CURRENT_WORKSPACE_KEY, id)
    else localStorage.removeItem(CURRENT_WORKSPACE_KEY)
  } catch {
    // ignore
  }
}

export function createWorkspaceRecord(name: string, description?: string): Workspace {
  return {
    id: crypto.randomUUID(),
    name,
    description,
    created_at: new Date().toISOString(),
  }
}

/**
 * Loads persisted state, migrating pre-revamp data on the way:
 * - guarantees at least one workspace exists (creates "Personal" if none)
 * - moves legacy `local_tasks` into `pomo_tasks`, then removes the legacy key
 * - assigns any task without a valid workspace to the first workspace
 * The migrated state is written back so it only runs once.
 */
export function loadAndMigrate(): {
  workspaces: Workspace[]
  tasks: Task[]
  currentWorkspaceId: string
} {
  let workspaces = loadWorkspaces()
  let tasks = loadTasks()

  let legacyTasks: Task[] = []
  let hadLegacy = false
  try {
    hadLegacy = localStorage.getItem(LEGACY_TASKS_KEY) !== null
  } catch {
    // ignore
  }
  if (hadLegacy) legacyTasks = readArray<Task>(LEGACY_TASKS_KEY)

  if (workspaces.length === 0) {
    workspaces = [createWorkspaceRecord(DEFAULT_WORKSPACE_NAME)]
  }
  const fallbackId = workspaces[0].id
  const workspaceIds = new Set(workspaces.map(w => w.id))

  const existingIds = new Set(tasks.map(t => t.id))
  tasks = [...tasks, ...legacyTasks.filter(t => !existingIds.has(t.id))].map(task =>
    workspaceIds.has(task.workspace_id) ? task : { ...task, workspace_id: fallbackId }
  )

  const storedCurrent = loadCurrentWorkspaceId()
  const currentWorkspaceId =
    storedCurrent && workspaceIds.has(storedCurrent) ? storedCurrent : fallbackId

  saveWorkspaces(workspaces)
  saveTasks(tasks)
  saveCurrentWorkspaceId(currentWorkspaceId)
  if (hadLegacy) {
    try {
      localStorage.removeItem(LEGACY_TASKS_KEY)
    } catch {
      // ignore
    }
  }

  return { workspaces, tasks, currentWorkspaceId }
}
