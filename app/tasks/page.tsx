'use client'

import { useWorkspace } from "@/contexts/workspace-context"


export default function TasksPage() {
  const { workspaces } = useWorkspace()

  
  return (
    <div>
      <span>Tasks</span>
      <div>
        {workspaces.map((workspace) => (
          <span key={workspace.id}>{workspace.name}</span>
        ))}
      </div>
    </div>
  )
} 