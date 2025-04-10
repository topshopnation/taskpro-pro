
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { TaskItemPriority } from "./TaskItemPriority"
import { TaskItemDetails } from "./TaskItemDetails"
import { TaskItemActions } from "./TaskItemActions"
import { TaskItemConfirmDelete } from "./TaskItemConfirmDelete"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { Tag } from "./taskTypes"
import { TaskItemDueDate } from "./TaskItemDueDate" 
import { useTaskData } from "./hooks/useTaskData"

export interface Task {
  id: string
  title: string
  notes?: string
  dueDate?: Date
  dueTime?: string
  priority: 1 | 2 | 3 | 4
  projectId: string
  projectName?: string
  projectColor?: string
  completed: boolean
  favorite?: boolean
}

interface TaskItemProps {
  task: Task
  onComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void
}

export function TaskItem({ task, onComplete, onDelete, onFavoriteToggle }: TaskItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const { taskTags, projectName } = useTaskData(task.id, task.projectId)

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

  const handlePriorityChange = async (newPriority: 1 | 2 | 3 | 4) => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ priority: newPriority })
        .eq('id', task.id)
      
      if (error) throw error
      
      toast.success("Task priority updated")
    } catch (error: any) {
      toast.error(`Error updating task priority: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDateChange = async (date: Date | undefined) => {
    setIsUpdating(true)
    try {
      const formattedDate = date ? date.toISOString() : null
      
      const { error } = await supabase
        .from('tasks')
        .update({ due_date: formattedDate })
        .eq('id', task.id)
      
      if (error) throw error
      
      toast.success(date ? "Due date updated" : "Due date removed")
    } catch (error: any) {
      toast.error(`Error updating due date: ${error.message}`)
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
          tags={taskTags}
          projectName={projectName}
        />
        
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <div className="flex items-center space-x-1">
              <TaskItemPriority 
                priority={task.priority} 
                onPriorityChange={handlePriorityChange}
                isUpdating={isUpdating}
              />
              
              <TaskItemDueDate
                dueDate={task.dueDate}
                onDateChange={handleDateChange}
                isUpdating={isUpdating}
              />
              
              <TaskItemActions
                task={task}
                onDeleteClick={() => setIsDeleteDialogOpen(true)}
                isUpdating={isUpdating}
                onFavoriteToggle={onFavoriteToggle}
              />
            </div>
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
