import { useState, useEffect, useCallback, useRef } from 'react'

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

const TIMER_SETTINGS_KEY = 'pomo_timer_settings'

function loadTimerSettings(): TimerSettings | null {
  try {
    const raw = localStorage.getItem(TIMER_SETTINGS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const valid = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n > 0
    if (!valid(parsed?.focus) || !valid(parsed?.shortBreak) || !valid(parsed?.longBreak)) return null
    return {
      ...DEFAULT_SETTINGS,
      focus: parsed.focus,
      shortBreak: parsed.shortBreak,
      longBreak: parsed.longBreak,
      longBreakInterval: valid(parsed.longBreakInterval) ? parsed.longBreakInterval : DEFAULT_SETTINGS.longBreakInterval,
    }
  } catch {
    return null
  }
}

function saveTimerSettings(settings: TimerSettings): void {
  try {
    localStorage.setItem(TIMER_SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Storage unavailable; settings still apply for this session
  }
}

export function useTimer() {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS)
  const [mode, setMode] = useState<TimerMode>("focus")
  const [timeLeft, setTimeLeft] = useState(settings.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const bellRef = useRef<HTMLAudioElement | null>(null)
  const clickRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number>()
  const isVisibleRef = useRef(true)
  const pausedTimeRef = useRef<number | null>(null)

  // Initialize audio elements
  useEffect(() => {
    bellRef.current = new Audio('/sounds/bell.mp3')
    clickRef.current = new Audio('/sounds/click.wav')

    return () => {
      if (bellRef.current) {
        bellRef.current.pause()
        bellRef.current = null
      }
      if (clickRef.current) {
        clickRef.current.pause()
        clickRef.current = null
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible'
      
      if (isVisibleRef.current) {
        if (isRunning && startTimeRef.current) {
          // Adjust start time to account for time passed while hidden
          const now = performance.now()
          const elapsedWhileHidden = now - startTimeRef.current
          startTimeRef.current = now - elapsedWhileHidden
        } else if (!isRunning && pausedTimeRef.current) {
          // Restore the paused time when returning to the tab
          setTimeLeft(pausedTimeRef.current)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isRunning])

  // Load saved timer settings once on mount (settings are stored in seconds)
  useEffect(() => {
    const saved = loadTimerSettings()
    if (saved) {
      setSettings(saved)
      setTimeLeft(saved.focus)
    }
  }, [])

  const resetTimer = useCallback((newMode?: TimerMode) => {
    const timerMode = newMode || mode
    setTimeLeft(settings[timerMode])
    if (newMode) setMode(newMode)
    startTimeRef.current = null
    pausedTimeRef.current = null
  }, [mode, settings])

  const switchMode = useCallback((newMode: TimerMode, autoStart: boolean = false) => {
    bellRef.current?.play().catch(error => console.error('Error playing sound:', error))
    resetTimer(newMode)
    if (autoStart) {
      // The countdown loop only ticks while startTimeRef is set, and
      // resetTimer clears it, so start the clock for the new session here.
      startTimeRef.current = performance.now()
      setIsRunning(true)
    } else {
      setIsRunning(false)
    }
  }, [resetTimer])

  const toggleTimer = useCallback(() => {
    clickRef.current?.play().catch(error => console.error('Error playing sound:', error))
    setIsRunning(prev => {
      if (!prev) {
        // Starting the timer
        const now = performance.now()
        if (pausedTimeRef.current) {
          // When resuming, we want to start from the paused time
          // Calculate how much time has elapsed since the timer started
          const elapsedBeforePause = settings[mode] - pausedTimeRef.current
          // Set the start time to now minus the elapsed time
          startTimeRef.current = now - (elapsedBeforePause * 1000)
        } else {
          // Starting fresh
          startTimeRef.current = now
        }
       
      } else {
        // Pausing the timer
        startTimeRef.current = null
        pausedTimeRef.current = timeLeft
      }
      return !prev
    })
  }, [timeLeft, mode, settings])

  const updateSettings = useCallback((newSettings: TimerSettings) => {
    saveTimerSettings(newSettings)
    setSettings(newSettings);
    setIsRunning(false);
    setTimeLeft(newSettings[mode]);
    startTimeRef.current = null
    pausedTimeRef.current = null
  }, [mode]);

  const nextSession = useCallback(() => {
    if (mode === "focus") {
      const newSessionCount = sessionCount + 1
      setSessionCount(newSessionCount)
      
      if (newSessionCount % settings.longBreakInterval === 0) {
        switchMode("longBreak", true)
      } else {
        switchMode("shortBreak", true)
      }
    } else {
      switchMode("focus", true)
    }
  }, [mode, sessionCount, switchMode, settings])

  // Timer update logic using requestAnimationFrame
  useEffect(() => {
    const updateTimer = () => {
      if (isRunning && startTimeRef.current) {
        const now = performance.now()
        const elapsed = Math.floor((now - startTimeRef.current) / 1000)
        const remaining = Math.max(0, settings[mode] - elapsed)
        
        setTimeLeft(remaining)
        
        if (remaining <= 0) {
          nextSession()
        } else {
          animationFrameRef.current = requestAnimationFrame(updateTimer)
        }
      }
    }

    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(updateTimer)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRunning, mode, settings, nextSession])

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
      switchMode: (newMode: TimerMode) => switchMode(newMode, false),
      toggleTimer,
      resetTimer,
      updateSettings,
    }
  }
} 