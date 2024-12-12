'use client'

import { useWorkspace } from '@/contexts/workspace-context'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { CreateWorkspaceDialog } from './create-workspace-dialog'
import { Trash2 } from 'lucide-react'

export function Workspaces() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, deleteWorkspace } = useWorkspace()
  const { user } = useAuth()

  const handleDelete = async (e: React.MouseEvent, workspaceId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this workspace?')) {
      try {
        await deleteWorkspace(workspaceId)
      } catch (error) {
        console.error('Failed to delete workspace:', error)
      }
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium">Workspaces</h2>
        {user && <CreateWorkspaceDialog />}
      </div>
      <div className="space-y-1">
        {!user ? (
          <p className="text-sm text-gray-500 text-center py-2">
            Sign in to create workspaces
          </p>
        ) : workspaces.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">
            No workspaces yet
          </p>
        ) : (
          workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={cn(
                "group flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors",
                currentWorkspace?.id === workspace.id && "bg-gray-100 font-medium"
              )}
            >
              <button
                className="flex-1 text-left"
                onClick={() => setCurrentWorkspace(workspace)}
              >
                {workspace.name}
              </button>
              <button
                onClick={(e) => handleDelete(e, workspace.id)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 