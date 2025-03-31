"use client"

import { Brain, Coffee, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TimerMode } from '@/hooks/use-timer'
import { TimerSettingsDialog } from '@/components/timer-settings-dialog'
import { TimerCountdown } from '@/components/timer-countdown'
import { useTimerContext } from '@/contexts/timer-context'

export function TimerDisplay() {
  const { 
    mode, 
    formattedTime, 
    isRunning,
    settings,
    actions: { switchMode, toggleTimer, resetTimer, updateSettings }
  } = useTimerContext()

  const modes = [
    { id: "focus" as TimerMode, label: "Focus", icon: Brain },
    { id: "shortBreak" as TimerMode, label: "Short Break", icon: Coffee },
    { id: "longBreak" as TimerMode, label: "Long Break", icon: Clock },
   ]

  return (
    <section aria-labelledby="timer-heading">
      <h2 id="timer-heading" className="text-xl font-semibold mb-4">Pomodoro Timer</h2>
      <Card className="w-full min-w-0">
        <CardContent className="pt-6 overflow-hidden">
          {/* Timer Mode Selection */}
          <nav aria-label="Timer modes" className="flex flex-wrap justify-center gap-2 mb-8 px-2">
            {modes.map((modeOption) => (
              <Button
                key={modeOption.id}
                variant={mode === modeOption.id ? "default" : "ghost"}
                className="gap-2 whitespace-nowrap"
                onClick={() => switchMode(modeOption.id)}
                aria-pressed={mode === modeOption.id}
                aria-label={`${modeOption.label} mode`}
              >
                <modeOption.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {modeOption.label}
              </Button>
            ))}
          </nav>

          {/* Timer Display */}
          <div className="flex justify-center mb-8" aria-live="polite" role="timer">
            <TimerCountdown formattedTime={formattedTime} />
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-2" role="group" aria-label="Timer controls">
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleTimer}
              aria-label={isRunning ? "Stop timer" : "Start timer"}
            >
              {isRunning ? <StopIcon className="h-4 w-4" aria-hidden="true" /> : <PlayIcon className="h-4 w-4" aria-hidden="true" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => resetTimer()}
              aria-label="Reset timer"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            </Button>
            <TimerSettingsDialog 
              settings={settings}
              onSave={updateSettings}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

// Simple icon components to match the design
function PlayIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function StopIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="6" y="6" width="12" height="12" />
    </svg>
  )
}

function RefreshCcw(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 2v6h6" />
      <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
      <path d="M21 22v-6h-6" />
      <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
    </svg>
  )
}


