import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Task } from "@/components/tasks/TaskItem"
import { cn } from "@/lib/utils"
import { Priority } from "@/components/tasks/TaskPriority"
import { ProjectBadge } from "@/components/projects/ProjectBadge"
import { TaskItemDueDate } from "@/components/tasks/TaskItemDueDate"
import { MoreHorizontal, Star, StarOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskActions } from "@/components/tasks/TaskActions"
import { useTaskCompletion } from "@/hooks/use-task-completion"
import { useTaskFavorite } from "@/hooks/use-task-favorite"

interface TaskItemProps {
  task: Task
  showProject?: boolean
  showDueDate?: boolean
}

export function TaskItem({ task, showProject = false, showDueDate = true }: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(task.completed)
  const [isFavorite, setIsFavorite] = useState(task.favorite)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const { completeTask, uncompleteTask } = useTaskCompletion()
  const { favoriteTask, unfavoriteTask } = useTaskFavorite()

  const handleComplete = async (checked: boolean) => {
    setIsUpdating(true)
    setIsCompleted(checked)
    try {
      if (checked) {
        await completeTask(task.id)
      } else {
        await uncompleteTask(task.id)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleFavorite = async () => {
    setIsUpdating(true)
    setIsFavorite(!isFavorite)
    try {
      if (!isFavorite) {
        await favoriteTask(task.id)
      } else {
        await unfavoriteTask(task.id)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDateChange = async (date: Date | undefined) => {
    setIsUpdating(true)
    try {
      // Optimistically update the task in the UI
      // This assumes that the API call will be successful
      // If it fails, we'll revert the change in the catch block
      // setTask(prev => ({ ...prev, dueDate: date }))
      // Call the API to update the task
      // await updateTaskDueDate(task.id, date)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className={cn(
      "group flex items-center gap-3 p-4 bg-background border-b border-border/50 hover:bg-accent/50 transition-colors",
      isCompleted && "opacity-60"
    )}>
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleComplete}
        disabled={isUpdating}
        aria-label={task.title}
        id={task.id}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={cn(
            "task-title font-medium truncate",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>
          
          {task.priority !== 4 && (
            <Priority priority={task.priority} />
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            disabled={isUpdating}
            className="hover:bg-transparent p-0 -mr-1.5"
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

        <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
          {task.notes && (
            <span className="truncate">{task.notes}</span>
          )}
          
          {showProject && task.projectId && (
            <>
              <span className="mx-1">•</span>
              <ProjectBadge projectId={task.projectId} />
            </>
          )}
          
          {showDueDate && (
            <>
              <span className="mx-1">•</span>
              <TaskItemDueDate
                dueDate={task.dueDate}
                onDateChange={handleDateChange}
                isUpdating={isUpdating}
              />
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <TaskActions taskId={task.id} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowActions(!showActions)}
          className="hover:bg-secondary"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Toggle actions</span>
        </Button>
      </div>
    </div>
  )
}
