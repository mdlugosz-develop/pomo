import { memo } from 'react'

interface TimerCountdownProps {
  formattedTime: string
}

export const TimerCountdown = memo(function TimerCountdown({ 
  formattedTime 
}: TimerCountdownProps) {
  return (
    <div className="text-4xl sm:text-7xl font-mono border-2 rounded-full px-6 sm:px-12 py-4 sm:py-8 whitespace-nowrap">
      {formattedTime}
    </div>
  )
})
