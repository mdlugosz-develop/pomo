'use client'

import { useWorkspace } from '@/contexts/workspace-context'

export function GlobalLoader({ children }: { children: React.ReactNode }) {
  const { loading } = useWorkspace()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  return <>{children}</>
} 