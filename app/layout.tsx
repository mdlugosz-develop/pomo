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
  title: "PomoTime - Productivity with Pomodoro Technique",
  description: "Boost your productivity with PomoTime, the ultimate Pomodoro timer app. Manage tasks efficiently with focused work sessions and scheduled breaks to maximize your productivity and maintain mental freshness.",
  keywords: "pomodoro timer, productivity app, task management, time management, focus sessions, pomodoro technique",
  authors: [{ name: "PomoTime Team" }],
  creator: "PomoTime",
  publisher: "PomoTime",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    title: "PomoTime - Productivity with Pomodoro Technique",
    description: "Boost your productivity with PomoTime, the ultimate Pomodoro timer app. Manage tasks efficiently with focused work sessions and scheduled breaks.",
    url: "https://pomotime.io",
    siteName: "PomoTime",
    images: [
      {
        url: "https://pomotime.io/images/logo.png",
        width: 800,
        height: 600,
        alt: "PomoTime Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PomoTime - Productivity with Pomodoro Technique",
    description: "Manage tasks efficiently with focused work sessions using the Pomodoro technique",
    images: ["https://pomotime.io/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/images/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <TimerProvider>
            <WorkspaceProvider>
              <GlobalLoader>
                <SpeedInsights />
                <Analytics />
                <div className="flex flex-1 bg-white">
                  <Sidebar />
                  <main className="flex-1 p-6 overflow-y-auto">
                      {children}
                  </main>
                  <TaskPanel />
                </div>
              </GlobalLoader>
            </WorkspaceProvider>
          </TimerProvider>
        </AuthProvider>
        
        <footer className="text-center p-4 text-sm text-gray-500 mt-auto" role="contentinfo">
          <div className="flex justify-center gap-4">
            <nav aria-label="Legal pages">
              <ul className="flex gap-4">
                <li>
                  <Link href="/privacy" className="hover:text-gray-700">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-gray-700">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap.xml" className="hover:text-gray-700">
                    Sitemap
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <p className="mt-2">
            <small>&copy; {new Date().getFullYear()} PomoTime. All rights reserved.</small>
          </p>
        </footer>
      </body>
    </html>
  )
}
