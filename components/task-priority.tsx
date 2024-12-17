import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type Priority = 'low' | 'medium' | 'high'

interface TaskPriorityProps {
  priority: Priority
  onPriorityChange: (priority: Priority) => void
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
]

export function TaskPriority({ priority, onPriorityChange }: TaskPriorityProps) {
  const currentPriority = priorities.find(p => p.value === priority)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-6 w-6 p-0 hover:bg-transparent"
          title={currentPriority?.label}
        >
          <div className={cn(
            "w-2 h-2 rounded-full",
            currentPriority?.color
          )} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {priorities.map((p) => (
          <DropdownMenuItem
            key={p.value}
            onClick={() => onPriorityChange(p.value)}
            className="flex items-center gap-2"
          >
            <div className={cn("w-2 h-2 rounded-full", p.color)} />
            <span>{p.label}</span>
            {priority === p.value && (
              <Check className="h-4 w-4 ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 