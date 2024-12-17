'use client'

import { Home, ListTodo } from 'lucide-react'
import Link from "next/link"
import { AuthButton } from "@/components/auth-button"
import { Workspaces } from '@/components/workspaces'
import { UserProfile } from './user-profile'
import { useAuth } from '@/contexts/auth-context'
import { Clock } from 'lucide-react'

export function Sidebar() {
  const { user } = useAuth()

  return (
    <div className="w-[300px] border-r p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Clock />
        <h1 className="font-medium">PomoTime</h1>
      </div>
      
      <nav className="space-y-2">
        <Link
          href="/"
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

      <Workspaces />

      <div className="mt-auto pb-4">
        {!user && <AuthButton />}
        {user && <UserProfile />}
      </div>
    </div>
  )
}

