'use client'

import { Workspace } from '@/lib/types'
import { useWorkspace } from '@/contexts/workspace-context'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

export function Workspaces() {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace()

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium">Workspaces</h2>
        <button className="p-1 hover:bg-gray-100 rounded">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1">
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            onClick={() => setCurrentWorkspace(workspace)}
            className={cn(
              "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors",
              currentWorkspace?.id === workspace.id && "bg-gray-100 font-medium"
            )}
          >
            {workspace.name}
          </button>
        ))}
        {workspaces.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">
            No workspaces yet
          </p>
        )}
      </div>
    </div>
  )
} 