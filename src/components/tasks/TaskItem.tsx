
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { TaskItemPriority } from "./TaskItemPriority"
import { TaskItemDetails } from "./TaskItemDetails"
import { TaskItemActions } from "./TaskItemActions"
import { TaskItemConfirmDelete } from "./TaskItemConfirmDelete"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { Tag } from "./taskTypes"

export interface Task {
  id: string
  title: string
  notes?: string
  dueDate?: Date
  dueTime?: string
  priority: 1 | 2 | 3 | 4
  projectId: string
  completed: boolean
  favorite?: boolean
}

interface TaskItemProps {
  task: Task
  onComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
}

export function TaskItem({ task, onComplete, onDelete }: TaskItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [taskTags, setTaskTags] = useState<Tag[]>([])
  const [projectName, setProjectName] = useState<string>("")
  const { user } = useAuth()

  useEffect(() => {
    const fetchTaskTags = async () => {
      if (!user) return;
      
      try {
        // Use type assertion to bypass TypeScript constraints
        const { data, error } = await (supabase as any)
          .from('task_tags')
          .select('tags(id, name, color)')
          .eq('task_id', task.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Extract tags from the nested structure and properly type them
        const tags = data.map((item: any) => item.tags as Tag);
        setTaskTags(tags);
      } catch (error: any) {
        console.error("Failed to fetch task tags:", error.message);
      }
    };
    
    fetchTaskTags();
  }, [task.id, user]);

  // Fetch project name if projectId exists
  useEffect(() => {
    const fetchProjectName = async () => {
      if (!task.projectId || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('name')
          .eq('id', task.projectId)
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProjectName(data.name);
        }
      } catch (error: any) {
        console.error("Failed to fetch project name:", error.message);
      }
    };
    
    fetchProjectName();
  }, [task.projectId, user]);

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
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ priority: newPriority })
        .eq('id', task.id);
      
      if (error) throw error;
      
      toast.success("Task priority updated");
      // The parent component will reload the tasks after Supabase triggers update
    } catch (error: any) {
      toast.error(`Error updating task priority: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

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
            <TaskItemPriority 
              priority={task.priority} 
              onPriorityChange={handlePriorityChange}
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
