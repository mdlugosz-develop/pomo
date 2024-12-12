import { useState, useEffect, useCallback } from 'react'

export type TimerMode = "focus" | "shortBreak" | "longBreak"

export interface TimerSettings {
  focus: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
}

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25 * 60, // 25 minutes in seconds
  shortBreak: 5 * 60, // 5 minutes in seconds
  longBreak: 15 * 60, // 15 minutes in seconds
  longBreakInterval: 4, // Number of focus sessions before long break
}

export function useTimer() {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS)
  const [mode, setMode] = useState<TimerMode>("focus")
  const [timeLeft, setTimeLeft] = useState(settings.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  const resetTimer = useCallback((newMode?: TimerMode) => {
    const timerMode = newMode || mode
    setTimeLeft(settings[timerMode])
    if (newMode) setMode(newMode)
  }, [mode, settings])

  const switchMode = useCallback((newMode: TimerMode, autoStart: boolean = false) => {
    resetTimer(newMode)
    if (autoStart) {
      setIsRunning(true)
    } else {
      setIsRunning(false)
    }
  }, [resetTimer])

  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev)
  }, [])

  const updateSettings = useCallback((newSettings: TimerSettings) => {
    setSettings(newSettings)
    setIsRunning(false)
    setTimeLeft(newSettings[mode])
  }, [mode])

  const nextSession = useCallback(() => {
    if (mode === "focus") {
      const newSessionCount = sessionCount + 1
      setSessionCount(newSessionCount)
      
      if (newSessionCount % settings.longBreakInterval === 0) {
        switchMode("longBreak", true) // Auto-start the long break
      } else {
        switchMode("shortBreak", true) // Auto-start the short break
      }
    } else {
      switchMode("focus", true) // Auto-start the focus session
    }
  }, [mode, sessionCount, switchMode, settings])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            nextSession()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, nextSession])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    mode,
    timeLeft,
    isRunning,
    sessionCount,
    settings,
    formattedTime: formatTime(timeLeft),
    actions: {
      switchMode: (newMode: TimerMode) => switchMode(newMode, false), // Manual mode switch doesn't auto-start
      toggleTimer,
      resetTimer,
      updateSettings,
    }
  }
} 