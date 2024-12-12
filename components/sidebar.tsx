'use client'

import { Home, ListTodo, LogIn, Plus } from 'lucide-react'
import Link from "next/link"
import { AuthButton } from "@/components/auth-button"
import { useWorkspace } from '@/contexts/workspace-context'

export function Sidebar() {
const { workspaces } = useWorkspace()
  return (
    <div className="w-[240px] border-r p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-5 h-5 rounded-full border-2 border-black" />
        <h1 className="font-medium">PomoTime</h1>
      </div>
      
      <nav className="space-y-2">
        <Link
          href="#"
          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
        >
          <ListTodo className="w-4 h-4" />
          Tasks
        </Link>
      </nav>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Workspaces</h2>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">
            {workspaces.map((workspace) => (
                <div key={workspace.id}>
                    {workspace.name}
                </div>
            ))}
        </p>
      </div>

      <div className="mt-auto pb-4">
        <AuthButton />
      </div>
    </div>
  )
}

