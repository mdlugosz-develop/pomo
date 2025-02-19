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
    }
  }, [])

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
    setIsRunning(prev => !prev)
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
  }, [mode, user]);

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

  useEffect(() => {
    setTimeLeft(settings[mode])
  }, [settings, mode])

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