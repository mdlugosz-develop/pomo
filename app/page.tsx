'use client'

import { TimerDisplay } from '@/components/timer-display'
import { DashboardStats } from '@/components/dashboard-stats'
import Script from 'next/script'

export default function Home() {
  return (
    <div className="container max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <Script id="structured-data" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "PomoTime",
          "applicationCategory": "ProductivityApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "operatingSystem": "Any",
          "description": "A Pomodoro timer application that helps users manage tasks efficiently with focused work sessions and scheduled breaks.",
          "url": "https://pomotime.io"
        })
      }} />

      <h1 className="sr-only">PomoTime - Productivity with Pomodoro Technique</h1>
      <p className="sr-only">Boost your productivity with PomoTime, the ultimate Pomodoro timer app. Manage tasks efficiently with focused work sessions and scheduled breaks.</p>
      
      <DashboardStats />

      <TimerDisplay />
    </div>
  )
}
