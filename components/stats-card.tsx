'use client'

import { Loader2 } from 'lucide-react'

interface StatsCardProps {
  title: string
  count: number
  isLoading?: boolean
  ariaLabel?: string
}

export function StatsCard({ title, count, isLoading = false, ariaLabel }: StatsCardProps) {
  return (
    <div className="border rounded-md p-4 bg-white shadow-sm" aria-label={ariaLabel}>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold" aria-live="polite">{count}</div>
        {isLoading && (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" aria-hidden="true" />
        )}
      </div>
    </div>
  )
} 