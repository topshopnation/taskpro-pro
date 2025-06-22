
import { Task } from "@/components/tasks/taskTypes";
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
  const { invalidateAllTaskQueries } = useTaskItemQueries();

  const handleCompletionToggle = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      // Update database FIRST
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id);
        
      if (error) throw error;
      
      // Wait for ALL queries to refresh completely
      await invalidateAllTaskQueries();
      
      // THEN call the parent handler (which may show its own toast)
      onComplete(task.id, !task.completed);
    } catch (error: any) {
      console.error("Error in handleCompletionToggle:", error);
      toast.error("Failed to update task", {
        description: error.message
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: 1 | 2 | 3 | 4) => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      // Always update database directly - no conditional logic
      const { error } = await supabase
        .from('tasks')
        .update({ priority: newPriority })
        .eq('id', task.id);
      
      if (error) throw error;
      
      // Wait for ALL queries to refresh completely
      await invalidateAllTaskQueries();
      
      // Call parent handler if provided
      if (onPriorityChange) {
        await onPriorityChange(task.id, newPriority);
      }
      
      toast.success("Task priority updated", {
        duration: 2000
      });
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
      const formattedDate = date ? date.toISOString() : null;
      
      // Always update database directly - no conditional logic  
      const { error } = await supabase
        .from('tasks')
        .update({ due_date: formattedDate })
        .eq('id', task.id);
      
      if (error) throw error;
      
      // Wait for ALL queries to refresh completely
      await invalidateAllTaskQueries();
      
      // Call parent handler if provided
      if (onDateChange) {
        await onDateChange(task.id, date);
      }
      
      toast.success(date ? "Due date updated" : "Due date removed", {
        duration: 2000
      });
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
      
      // Wait for ALL queries to refresh completely
      await invalidateAllTaskQueries();
      
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
