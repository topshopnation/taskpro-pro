
import { Task } from "@/components/tasks/taskTypes"
import { TaskItem } from "./TaskItem"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useMediaQuery } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface TaskListProps {
  title: string
  tasks: Task[]
  isLoading?: boolean
  emptyMessage?: string
  onComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void
  hideTitle?: boolean
  onTaskEdit?: (task: Task) => void
  onPriorityChange?: (taskId: string, priority: 1 | 2 | 3 | 4) => void
  onDateChange?: (taskId: string, date: Date | undefined) => void
  onProjectChange?: (taskId: string, projectId: string | null) => void
}

export function TaskList({ 
  title, 
  tasks = [], // Default to empty array
  isLoading = false, 
  emptyMessage = "No tasks found", 
  onComplete, 
  onDelete,
  onFavoriteToggle,
  hideTitle = false,
  onTaskEdit,
  onPriorityChange,
  onDateChange,
  onProjectChange
}: TaskListProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Ensure tasks is always an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  
  return (
    <Card className="overflow-hidden">
      {title && !hideTitle && (
        <CardHeader className="pb-1 pt-3">
          <CardTitle className="text-base md:text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(
        !title || hideTitle ? "pt-3 px-3 pb-3" : "py-2 px-3",
        isMobile && "task-list-mobile"
      )}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : safeTasks.length === 0 ? (
          <p className="text-xs md:text-sm text-muted-foreground py-3 text-center">{emptyMessage}</p>
        ) : (
          <div className={cn("space-y-1", isMobile && "space-y-0")}>
            {safeTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onComplete={onComplete}
                onDelete={onDelete}
                onFavoriteToggle={onFavoriteToggle}
                onTaskEdit={onTaskEdit}
                onPriorityChange={onPriorityChange}
                onDateChange={onDateChange}
                onProjectChange={onProjectChange}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
