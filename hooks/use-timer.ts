import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

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
  const { user } = useAuth()
  const bellRef = useRef<HTMLAudioElement | null>(null)
  const clickRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number>()
  const isVisibleRef = useRef(true)

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
      if (isVisibleRef.current && isRunning && startTimeRef.current) {
        // Adjust start time to account for time passed while hidden
        const now = performance.now()
        const elapsedWhileHidden = now - startTimeRef.current
        startTimeRef.current = now - elapsedWhileHidden
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isRunning])

  const fetchTimerSettings = useCallback(async () => {
    if (user) {
      const { data, error } = await supabase
        .from('timer_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching timer settings:', error);
        return;
      }

      if (data) {
        const newSettings = {
          focus: data.focus_time * 60,
          shortBreak: data.short_break * 60,
          longBreak: data.long_break * 60,
          longBreakInterval: 4
        };
        setSettings(newSettings);
        setTimeLeft(newSettings[mode]);
      }
    }
  }, [user, mode]);

  useEffect(() => {
    fetchTimerSettings();
  }, [fetchTimerSettings]);

  const resetTimer = useCallback((newMode?: TimerMode) => {
    const timerMode = newMode || mode
    setTimeLeft(settings[timerMode])
    if (newMode) setMode(newMode)
    startTimeRef.current = null
  }, [mode, settings])

  const switchMode = useCallback((newMode: TimerMode, autoStart: boolean = false) => {
    bellRef.current?.play().catch(error => console.error('Error playing sound:', error))
    resetTimer(newMode)
    if (autoStart) {
      setIsRunning(true)
    } else {
      setIsRunning(false)
    }
  }, [resetTimer])

  const toggleTimer = useCallback(() => {
    clickRef.current?.play().catch(error => console.error('Error playing sound:', error))
    setIsRunning(prev => {
      if (!prev) {
        startTimeRef.current = performance.now()
      } else {
        startTimeRef.current = null
      }
      return !prev
    })
  }, [])

  const updateSettings = useCallback(async (newSettings: TimerSettings) => {
    if (user) {
      const { error } = await supabase
        .from('timer_settings')
        .update({
          focus_time: newSettings.focus / 60,
          short_break: newSettings.shortBreak / 60,
          long_break: newSettings.longBreak / 60
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating timer settings:', error);
        return;
      }
    }
    
    setSettings(newSettings);
    setIsRunning(false);
    setTimeLeft(newSettings[mode]);
    startTimeRef.current = null
  }, [mode, user]);

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

  useEffect(() => {
    setTimeLeft(settings[mode])
  }, [settings, mode])

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
      refreshSettings: fetchTimerSettings,
    }
  }
} 