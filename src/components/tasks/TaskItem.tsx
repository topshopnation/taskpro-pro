
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { TaskItemPriority } from "./TaskItemPriority"
import { TaskItemDetails } from "./TaskItemDetails"
import { TaskItemFavorite } from "./TaskItemFavorite"
import { TaskItemActions } from "./TaskItemActions"
import { TaskItemConfirmDelete } from "./TaskItemConfirmDelete"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

export interface Task {
  id: string
  title: string
  notes?: string
  dueDate?: Date
  dueTime?: string
  priority: 1 | 2 | 3 | 4
  projectId: string
  section?: string
  completed: boolean
  favorite: boolean
}

interface TaskItemProps {
  task: Task
  onComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onFavoriteToggle: (taskId: string, favorite: boolean) => void
}

export function TaskItem({ task, onComplete, onDelete, onFavoriteToggle }: TaskItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleCompletionToggle = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id)
      
      if (error) throw error
      
      onComplete(task.id, !task.completed)
      toast.success(task.completed ? "Task marked as incomplete" : "Task completed!")
    } catch (error: any) {
      toast.error(`Error updating task: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleFavoriteToggle = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ favorite: !task.favorite })
        .eq('id', task.id)
      
      if (error) throw error
      
      onFavoriteToggle(task.id, !task.favorite)
      toast.success(task.favorite ? "Removed from favorites" : "Added to favorites")
    } catch (error: any) {
      toast.error(`Error updating task: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)
      
      if (error) throw error
      
      setIsDeleteDialogOpen(false)
      onDelete(task.id)
      toast.success("Task deleted")
    } catch (error: any) {
      toast.error(`Error deleting task: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <div className={cn(
        "flex items-start gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors",
        `task-priority-${task.priority}`
      )}>
        <div className="mt-1">
          <Checkbox 
            checked={task.completed} 
            onCheckedChange={handleCompletionToggle}
            disabled={isUpdating}
          />
        </div>
        
        <TaskItemDetails
          title={task.title}
          notes={task.notes}
          dueDate={task.dueDate}
          dueTime={task.dueTime}
          completed={task.completed}
        />
        
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <TaskItemPriority priority={task.priority} />
            
            <TaskItemFavorite
              favorite={task.favorite}
              onToggle={handleFavoriteToggle}
              isUpdating={isUpdating}
            />
            
            <TaskItemActions
              task={task}
              onDeleteClick={() => setIsDeleteDialogOpen(true)}
              isUpdating={isUpdating}
            />
          </TooltipProvider>
        </div>
      </div>

      <TaskItemConfirmDelete 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isUpdating={isUpdating}
      />
    </>
  )
}
