"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Settings } from 'lucide-react'
import { useState, useEffect } from "react"

interface TimerSettings {
  focus: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
}

interface TimerSettingsDialogProps {
  settings: TimerSettings
  onSave: (settings: TimerSettings) => void
}

export function TimerSettingsDialog({ settings, onSave }: TimerSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState(settings)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings, open])

  const handleSave = () => {
    onSave(localSettings)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="focus" className="text-right">
              Focus
            </Label>
            <Input
              id="focus"
              type="number"
              className="col-span-3"
              value={localSettings.focus / 60}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                focus: Math.max(1, parseInt(e.target.value)) * 60
              }))}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shortBreak" className="text-right">
              Short Break
            </Label>
            <Input
              id="shortBreak"
              type="number"
              className="col-span-3"
              value={localSettings.shortBreak / 60}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                shortBreak: Math.max(1, parseInt(e.target.value)) * 60
              }))}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="longBreak" className="text-right">
              Long Break
            </Label>
            <Input
              id="longBreak"
              type="number"
              className="col-span-3"
              value={localSettings.longBreak / 60}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                longBreak: Math.max(1, parseInt(e.target.value)) * 60
              }))}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="interval" className="text-right">
              Long Break Interval
            </Label>
            <Input
              id="interval"
              type="number"
              className="col-span-3"
              value={localSettings.longBreakInterval}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                longBreakInterval: Math.max(1, parseInt(e.target.value))
              }))}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 