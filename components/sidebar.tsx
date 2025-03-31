'use client'

import { Home, ListTodo } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { AuthButton } from "@/components/auth-button"
import { Workspaces } from '@/components/workspaces'
import { UserProfile } from './user-profile'
import { useAuth } from '@/contexts/auth-context'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MiniTimer } from './mini-timer'

export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const showMiniTimer = pathname !== '/'

  return (
    <aside className="w-[300px] border-r p-4 flex flex-col h-full" aria-label="Application navigation">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/">
          <Image 
            src="/images/logo.png"
            alt="PomoTime Logo"
            width={35}
            height={35}
            priority
          />
        </Link>
        <h1 className="font-medium">PomoTime</h1>
      </div>
      
      <nav className="space-y-2" aria-label="Main Navigation">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md",
            pathname === "/" && "bg-gray-100"
          )}
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/tasks"
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md",
            pathname === "/tasks" && "bg-gray-100"
          )}
          aria-current={pathname === "/tasks" ? "page" : undefined}
        >
          <ListTodo className="w-4 h-4" aria-hidden="true" />
          <span>Tasks Overview</span>
        </Link>
      </nav>

      <Workspaces />

      {showMiniTimer && (
        <div className="mt-4 p-3 border rounded-lg bg-white" aria-label="Mini timer">
          <MiniTimer />
        </div>
      )}

      <div className="mt-auto pb-4">
        {!user && <AuthButton />}
        {user && <UserProfile />}
      </div>
    </aside>
  )
}

