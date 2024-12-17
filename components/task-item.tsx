import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { Task } from "@/lib/types"
import { GripVertical } from "lucide-react"
import { TaskPriority } from "./task-priority"

interface TaskItemProps {
  task: Task
  onDelete: (id: string) => void
  onStatusToggle: (id: string, status: string) => void
  onPriorityChange: (id: string, priority: 'low' | 'medium' | 'high') => void
}

export function TaskItem({ 
  task, 
  onDelete, 
  onStatusToggle,
  onPriorityChange 
}: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group p-3 rounded-md border transition-colors",
        task.status === 'completed' 
          ? "bg-gray-50 border-gray-200" 
          : "hover:border-gray-300",
        isDragging && "shadow-lg",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          className="mt-1 opacity-0 group-hover:opacity-40 hover:opacity-100 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              onClick={() => onStatusToggle(task.id, task.status)}
              className={cn(
                "text-sm font-medium cursor-pointer",
                task.status === 'completed' 
                  ? "text-gray-400 line-through" 
                  : "text-gray-700"
              )}
            >
              {task.title}
            </h3>
            <TaskPriority
              priority={task.priority || 'medium'}
              onPriorityChange={(priority) => onPriorityChange(task.id, priority)}
            />
            {task.due_date && (
              <span className={cn(
                "text-xs",
                task.status === 'completed' 
                  ? "text-gray-400" 
                  : "text-gray-500"
              )}>
                Due: {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
          {task.description && (
            <p className={cn(
              "text-sm mt-1",
              task.status === 'completed' 
                ? "text-gray-400 line-through" 
                : "text-gray-500"
            )}>
              {task.description}
            </p>
          )}
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-gray-500"
        >
          ×
        </button>
      </div>
    </div>
  )
} 