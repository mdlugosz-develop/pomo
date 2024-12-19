"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useTimer, TimerMode, TimerSettings } from '@/hooks/use-timer'

interface TimerContextType {
  mode: TimerMode
  formattedTime: string
  isRunning: boolean
  settings: TimerSettings
  actions: {
    switchMode: (mode: TimerMode) => void
    toggleTimer: () => void
    resetTimer: () => void
    updateSettings: (settings: TimerSettings) => void
  }
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: ReactNode }) {
  const timer = useTimer()

  return (
    <TimerContext.Provider value={timer}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimerContext() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimerContext must be used within a TimerProvider')
  }
  return context
} 