
import { Task } from "@/components/tasks/taskTypes";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTaskItemQueries } from "./useTaskItemQueries";

interface UseTaskItemOperationsProps {
  task: Task;
  onComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void;
  onPriorityChange?: (taskId: string, priority: 1 | 2 | 3 | 4) => void;
  onDateChange?: (taskId: string, date: Date | undefined) => void;
  setIsUpdating: (updating: boolean) => void;
  isUpdating: boolean;
}

export function useTaskItemOperations({
  task,
  onComplete,
  onDelete,
  onFavoriteToggle,
  onPriorityChange,
  onDateChange,
  setIsUpdating,
  isUpdating
}: UseTaskItemOperationsProps) {
  const { completeTask } = useTaskOperations();
  const { invalidateAllTaskQueries } = useTaskItemQueries();

  const handleCompletionToggle = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const success = await completeTask(task.id, !task.completed);
      
      if (success) {
        onComplete(task.id, !task.completed);
      }
    } catch (error: any) {
      console.error("Error in handleCompletionToggle:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: 1 | 2 | 3 | 4) => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      if (onPriorityChange) {
        await onPriorityChange(task.id, newPriority);
      } else {
        // Update database FIRST
        const { error } = await supabase
          .from('tasks')
          .update({ priority: newPriority })
          .eq('id', task.id);
        
        if (error) throw error;
        
        // THEN refetch queries to force UI update with fresh data
        await invalidateAllTaskQueries();
        
        toast.success("Task priority updated", {
          duration: 2000
        });
      }
    } catch (error: any) {
      toast.error(`Error updating task priority: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDateChange = async (date: Date | undefined) => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      if (onDateChange) {
        await onDateChange(task.id, date);
      } else {
        const formattedDate = date ? date.toISOString() : null;
        
        // Update database FIRST
        const { error } = await supabase
          .from('tasks')
          .update({ due_date: formattedDate })
          .eq('id', task.id);
        
        if (error) throw error;
        
        // THEN refetch queries to force UI update with fresh data
        await invalidateAllTaskQueries();
        
        toast.success(date ? "Due date updated" : "Due date removed", {
          duration: 2000
        });
      }
    } catch (error: any) {
      toast.error(`Error updating due date: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);
      
      if (error) throw error;
      
      onDelete(task.id);
    } catch (error: any) {
      toast.error(`Error deleting task: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    handleCompletionToggle,
    handlePriorityChange,
    handleDateChange,
    handleDelete
  };
}
