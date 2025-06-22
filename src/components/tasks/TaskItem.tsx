
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Task } from "@/components/tasks/taskTypes"
import { cn } from "@/lib/utils"
import { TaskItemDueDate } from "@/components/tasks/TaskItemDueDate"
import { MoreHorizontal, Star, StarOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format, isToday, isTomorrow, isYesterday } from "date-fns"
import { useMediaQuery } from "@/hooks/use-mobile"

interface TaskItemProps {
  task: Task
  showProject?: boolean
  showDueDate?: boolean
  onComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void
  onTaskEdit?: (task: Task) => void
  onPriorityChange?: (taskId: string, priority: 1 | 2 | 3 | 4) => void
  onDateChange?: (taskId: string, date: Date | undefined) => void
  onProjectChange?: (taskId: string, projectId: string | null) => void
}

export function TaskItem({ 
  task, 
  showProject = false, 
  showDueDate = true,
  onComplete,
  onDelete,
  onFavoriteToggle,
  onTaskEdit,
  onPriorityChange,
  onDateChange,
  onProjectChange
}: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(task.completed)
  const [isFavorite, setIsFavorite] = useState(task.favorite)
  const [isUpdating, setIsUpdating] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleComplete = async (checked: boolean) => {
    setIsUpdating(true)
    setIsCompleted(checked)
    try {
      onComplete(task.id, checked)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleFavorite = async () => {
    setIsUpdating(true)
    setIsFavorite(!isFavorite)
    try {
      if (onFavoriteToggle) {
        onFavoriteToggle(task.id, !isFavorite)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  return (
    <div className={cn(
      "group flex items-center gap-3 bg-background border-b border-border/50 hover:bg-accent/50 transition-colors",
      isMobile ? "task-item-mobile" : "p-4",
      isCompleted && "opacity-60"
    )}>
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleComplete}
        disabled={isUpdating}
        aria-label={task.title}
        id={task.id}
        className={cn(isMobile && "mobile-checkbox")}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={cn(
            "task-title font-medium truncate",
            isMobile ? "text-lg" : "text-base",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            disabled={isUpdating}
            className="hover:bg-transparent p-0 -mr-1.5 h-6 w-6"
          >
            {isFavorite ? (
              <Star className="h-4 w-4 text-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {isFavorite ? "Unfavorite" : "Favorite"}
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {task.notes && (
            <span className={cn(
              "truncate",
              isMobile ? "text-base" : "text-sm"
            )}>{task.notes}</span>
          )}
          
          {task.dueDate && (
            <Badge variant="outline" className={cn(
              "whitespace-nowrap",
              isMobile ? "text-sm px-3 py-1" : "text-[11px] px-2 py-0.5"
            )}>
              {formatDueDate(task.dueDate)}
              {task.dueTime && ` ${task.dueTime}`}
            </Badge>
          )}
          
          {showProject && task.projectName && task.projectName !== "No Project" && (
            <Badge variant="secondary" className={cn(
              "whitespace-nowrap",
              isMobile ? "text-sm px-3 py-1" : "text-[11px] px-2 py-0.5"
            )}>
              {task.projectName}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onTaskEdit && onTaskEdit(task)}
          className={cn(
            "hover:bg-secondary",
            isMobile ? "h-8 w-8" : "h-7 w-7"
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Edit task</span>
        </Button>
      </div>
    </div>
  )
}
