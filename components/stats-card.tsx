'use client'

import { Loader2 } from 'lucide-react'

interface StatsCardProps {
  title: string
  count: number
  isLoading?: boolean
}

export function StatsCard({ title, count, isLoading = false }: StatsCardProps) {
  return (
    <div className="border rounded-md p-4 bg-white shadow-sm">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">{count}</div>
        {isLoading && (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>
    </div>
  )
} 