import { Home, ListTodo, LogIn, Plus } from 'lucide-react'
import Link from "next/link"

export function Sidebar() {
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
          No workspaces yet. Create one to get started!
        </p>
      </div>

      <div className="mt-auto">
        <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md w-full">
          <LogIn className="w-4 h-4" />
          Login
        </button>
      </div>
    </div>
  )
}

