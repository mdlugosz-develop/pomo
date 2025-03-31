'use client'

import { Home, ListTodo, Info, Menu, X } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { AuthButton } from "@/components/auth-button"
import { Workspaces } from '@/components/workspaces'
import { UserProfile } from './user-profile'
import { useAuth } from '@/contexts/auth-context'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MiniTimer } from './mini-timer'
import { useState, useEffect } from 'react'

export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const showMiniTimer = pathname !== '/'
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive layout
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Check on initial load
    checkIfMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile)
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Close sidebar when clicking on a link on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button 
          className="fixed top-4 left-4 z-30 p-2 bg-white rounded-md shadow-md md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "w-full md:w-[300px] border-r p-4 flex flex-col h-screen bg-white z-20",
          "transition-all duration-300 ease-in-out",
          isMobile && !isOpen ? "fixed -left-full" : isMobile ? "fixed left-0" : ""
        )}
        aria-label="Application navigation"
      >
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" onClick={handleLinkClick}>
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
        
        <nav className="space-y-2 mb-6" aria-label="Main Navigation">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md",
              pathname === "/" && "bg-gray-100"
            )}
            aria-current={pathname === "/" ? "page" : undefined}
            onClick={handleLinkClick}
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
            onClick={handleLinkClick}
          >
            <ListTodo className="w-4 h-4" aria-hidden="true" />
            <span>Tasks Overview</span>
          </Link>
          <Link
            href="/about"
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md",
              pathname === "/about" && "bg-gray-100"
            )}
            aria-current={pathname === "/about" ? "page" : undefined}
            onClick={handleLinkClick}
          >
            <Info className="w-4 h-4" aria-hidden="true" />
            <span>About</span>
          </Link>
        </nav>

        <Workspaces />

        {showMiniTimer && (
          <div className="mt-4 p-3 border rounded-lg bg-white" aria-label="Mini timer">
            <MiniTimer />
          </div>
        )}

        <div className="mt-auto pt-4">
          {!user && <AuthButton />}
          {user && <UserProfile />}
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}

