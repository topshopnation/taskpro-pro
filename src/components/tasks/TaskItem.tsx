
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Task } from "@/components/tasks/taskTypes"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-mobile"
import { TaskItemActionContainer } from "./TaskItemActionContainer"
import { useTaskItem } from "./hooks/useTaskItem"
import { TaskItemConfirmDelete } from "./TaskItemConfirmDelete"
import { EditTaskDialog } from "./EditTaskDialog"

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
  const isMobile = useMediaQuery("(max-width: 768px)")

  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isUpdating,
    handleCompletionToggle,
    handlePriorityChange,
    handleDateChange,
    handleDelete
  } = useTaskItem({
    task,
    onComplete,
    onDelete,
    onFavoriteToggle,
    onPriorityChange,
    onDateChange,
  });

  const handleProjectChange = async (projectId: string | null) => {
    if (onProjectChange) {
      await onProjectChange(task.id, projectId)
    }
  }

  const handleDeleteTask = async (taskId: string): Promise<boolean> => {
    try {
      await handleDelete();
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <>
      <div className={cn(
        "group flex items-center gap-3 bg-background border-b border-border/50 hover:bg-accent/50 transition-colors p-3",
        isMobile && "task-item-compact px-2 py-2",
        isCompleted && "opacity-60"
      )}>
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleCompletionToggle}
          disabled={isUpdating}
          aria-label={task.title}
          id={task.id}
          className={cn(isMobile && "mobile-checkbox")}
        />

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "task-title font-medium truncate flex-1",
              isMobile ? "text-sm" : "text-base",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
          </div>

          {task.notes && (
            <p className={cn(
              "truncate task-notes-mobile text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {task.notes}
            </p>
          )}

          <TaskItemActionContainer
            task={task}
            onDeleteClick={() => setIsDeleteDialogOpen(true)}
            onEditClick={() => setIsEditDialogOpen(true)}
            isUpdating={isUpdating}
            onPriorityChange={handlePriorityChange}
            onDateChange={handleDateChange}
            onProjectChange={onProjectChange ? handleProjectChange : undefined}
            onFavoriteToggle={undefined}
          />
        </div>
      </div>

      <TaskItemConfirmDelete
        taskId={task.id}
        taskTitle={task.title}
        taskCompleted={task.completed}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteTask}
        isOpen={isDeleteDialogOpen}
        isUpdating={isUpdating}
        onConfirm={handleDelete}
      />

      <EditTaskDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={task}
      />
    </>
  )
}
