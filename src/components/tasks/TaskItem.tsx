
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { TaskItemPriority } from "./TaskItemPriority"
import { TaskItemDetails } from "./TaskItemDetails"
import { TaskItemActions } from "./TaskItemActions"
import { TaskItemConfirmDelete } from "./TaskItemConfirmDelete"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { useTaskData } from "./hooks/useTaskData"
import { useTaskOperations } from "@/hooks/useTaskOperations"
import { TaskItemDueDate } from "./TaskItemDueDate"
import { supabase } from "@/integrations/supabase/client"
import { EditTaskDialog } from "./EditTaskDialog"

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
  onTaskEdit?: (task: Task) => void
  onPriorityChange?: (taskId: string, priority: 1 | 2 | 3 | 4) => void
  onDateChange?: (taskId: string, date: Date | undefined) => void
}

export function TaskItem({ 
  task, 
  onComplete, 
  onDelete, 
  onFavoriteToggle,
  onTaskEdit,
  onPriorityChange,
  onDateChange
}: TaskItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const { taskTags, projectName } = useTaskData(task.id, task.projectId)
  const { completeTask } = useTaskOperations()

  const handleCompletionToggle = async () => {
    setIsUpdating(true)
    try {
      await completeTask(task.id, !task.completed)
      onComplete(task.id, !task.completed)
    } catch (error: any) {
      toast.error(`Error updating task: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePriorityChange = async (newPriority: 1 | 2 | 3 | 4) => {
    setIsUpdating(true)
    try {
      if (onPriorityChange) {
        await onPriorityChange(task.id, newPriority)
      } else {
        const { error } = await supabase
          .from('tasks')
          .update({ priority: newPriority })
          .eq('id', task.id)
        
        if (error) throw error
        
        toast.success("Task priority updated")
      }
    } catch (error: any) {
      toast.error(`Error updating task priority: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDateChange = async (date: Date | undefined) => {
    setIsUpdating(true)
    try {
      if (onDateChange) {
        await onDateChange(task.id, date)
      } else {
        const formattedDate = date ? date.toISOString() : null
        
        const { error } = await supabase
          .from('tasks')
          .update({ due_date: formattedDate })
          .eq('id', task.id)
        
        if (error) throw error
        
        toast.success(date ? "Due date updated" : "Due date removed")
      }
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

  const handleTaskClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLElement && 
      (e.target.closest('button') || 
       e.target.closest('input[type="checkbox"]') ||
       e.target.getAttribute('role') === 'checkbox')
    ) {
      return;
    }
    
    if (onTaskEdit) {
      onTaskEdit(task);
    } else {
      setIsEditDialogOpen(true);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "flex items-start gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer",
          `task-priority-${task.priority}`
        )}
        onClick={handleTaskClick}
      >
        <div className="mt-1" onClick={e => e.stopPropagation()}>
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
        
        <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
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
                onEditClick={() => onTaskEdit ? onTaskEdit(task) : setIsEditDialogOpen(true)}
                isUpdating={isUpdating}
                onFavoriteToggle={onFavoriteToggle}
              />
            </div>
          </TooltipProvider>
        </div>
      </div>

      <TaskItemConfirmDelete 
        taskId={task.id}
        taskTitle={task.title}
        taskCompleted={task.completed}
        onDelete={async (id) => {
          await onDelete(id);
          return true;
        }}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        isUpdating={isUpdating}
      />

      {!onTaskEdit && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={task}
        />
      )}
    </>
  )
}
