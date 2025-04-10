
import { Task, TaskItem } from "./TaskItem"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface TaskListProps {
  title: string
  tasks: Task[]
  isLoading?: boolean
  emptyMessage?: string
  onComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void
}

export function TaskList({ 
  title, 
  tasks, 
  isLoading = false, 
  emptyMessage = "No tasks found", 
  onComplete, 
  onDelete,
  onFavoriteToggle
}: TaskListProps) {
  return (
    <Card>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={!title ? "pt-6" : ""}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">{emptyMessage}</p>
        ) : (
          <div className="space-y-1">
            {tasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onComplete={onComplete}
                onDelete={onDelete}
                onFavoriteToggle={onFavoriteToggle}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
