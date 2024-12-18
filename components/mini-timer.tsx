"use client"

import { useTimerContext } from '@/contexts/timer-context'
import { Button } from './ui/button'
import { Play, Square } from 'lucide-react'

export function MiniTimer() {
  const { formattedTime, isRunning, actions: { toggleTimer } } = useTimerContext()

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono">{formattedTime}</span>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={toggleTimer}
      >
        {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
    </div>
  )
} 