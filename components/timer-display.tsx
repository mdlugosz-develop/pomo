"use client"

import { Brain, Coffee, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTimer, TimerMode } from '@/hooks/use-timer'
import { TimerSettingsDialog } from '@/components/timer-settings-dialog'

export function TimerDisplay() {
  const { 
    mode, 
    formattedTime, 
    isRunning,
    settings,
    actions: { switchMode, toggleTimer, resetTimer, updateSettings }
  } = useTimer()

  const modes = [
    { id: "focus" as TimerMode, label: "Focus", icon: Brain },
    { id: "shortBreak" as TimerMode, label: "Short Break", icon: Coffee },
    { id: "longBreak" as TimerMode, label: "Long Break", icon: Clock },
   ]

  return (
    <Card className="w-full min-w-0">
      <CardContent className="pt-6 overflow-hidden">
        {/* Timer Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 px-2">
          {modes.map((modeOption) => (
            <Button
              key={modeOption.id}
              variant={mode === modeOption.id ? "default" : "ghost"}
              className="gap-2 whitespace-nowrap"
              onClick={() => switchMode(modeOption.id)}
            >
              <modeOption.icon className="h-4 w-4 flex-shrink-0" />
              {modeOption.label}
            </Button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="flex justify-center mb-8">
          <div className="text-4xl sm:text-7xl font-mono border-2 rounded-full px-6 sm:px-12 py-4 sm:py-8 whitespace-nowrap">
            {formattedTime}
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleTimer}
          >
            {isRunning ? <StopIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => resetTimer()}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <TimerSettingsDialog 
            settings={settings}
            onSave={updateSettings}
          />
        </div>
      </CardContent>
    </Card>
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


