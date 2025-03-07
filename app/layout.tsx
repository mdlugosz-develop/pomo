import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '@/contexts/auth-context'
import { WorkspaceProvider } from '@/contexts/workspace-context'
import { Sidebar } from '@/components/sidebar'
import { TaskPanel } from '@/components/task-panel'
import { GlobalLoader } from '@/components/global-loader'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { TimerProvider } from '@/contexts/timer-context'
import Link from 'next/link'


export const metadata: Metadata = {
  title: "PomoTime",
  description: "Pomodoro timer for your focus sessions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <TimerProvider>
            <WorkspaceProvider>
              <GlobalLoader>
                <SpeedInsights />
                <Analytics />
                <div className="flex h-screen bg-white">
                  <Sidebar />
                  <main className="flex-1 p-6">
                      {children}
                  </main>
                  <TaskPanel />
                </div>
              </GlobalLoader>
            </WorkspaceProvider>
          </TimerProvider>
        </AuthProvider>
        
        <footer className="text-center p-4 text-sm text-gray-500">
          <div className="flex justify-center gap-4">
            <Link href="/privacy" className="hover:text-gray-700">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-700">
              Terms of Use
            </Link>
          </div>
        </footer>
      </body>
    </html>
  )
}
