
import { useCallback } from "react";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useOverdueTaskOperations() {
  const { completeTask, deleteTask } = useTaskOperations();

  const handleComplete = useCallback(async (taskId: string, completed: boolean, onOptimisticUpdate?: (taskId: string, completed: boolean) => void) => {
    const success = await completeTask(taskId, completed, onOptimisticUpdate);
    
    if (success) {
      // Invalidate overdue tasks query
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
    }
    
    return success;
  }, [completeTask]);

  const handleDelete = useCallback(async (taskId: string, onOptimisticUpdate?: (taskId: string) => void) => {
    if (onOptimisticUpdate) {
      onOptimisticUpdate(taskId);
    }
    
    const success = await deleteTask(taskId);
    
    if (success) {
      // Invalidate overdue tasks query
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
    }
    
    return success;
  }, [deleteTask]);

  const handleFavoriteToggle = useCallback(async (taskId: string, favorite: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ favorite })
        .eq('id', taskId);
      
      if (error) throw error;
      
      toast.success(favorite ? "Added to favorites" : "Removed from favorites", {
        duration: 2000
      });
      
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      return Promise.resolve();
    } catch (error: any) {
      toast.error(`Error updating favorite: ${error.message}`);
      return Promise.reject(error);
    }
  }, []);

  const handlePriorityChange = useCallback(async (taskId: string, priority: 1 | 2 | 3 | 4) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ priority })
        .eq('id', taskId);
      
      if (error) throw error;
      
      toast.success("Task priority updated", {
        duration: 2000
      });
      
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      return Promise.resolve();
    } catch (error: any) {
      toast.error(`Error updating priority: ${error.message}`);
      return Promise.reject(error);
    }
  }, []);

  const handleDateChange = useCallback(async (taskId: string, date: Date | undefined) => {
    try {
      const formattedDate = date ? date.toISOString() : null;
      
      const { error } = await supabase
        .from('tasks')
        .update({ due_date: formattedDate })
        .eq('id', taskId);
      
      if (error) throw error;
      
      toast.success(date ? "Due date updated" : "Due date removed", {
        duration: 2000
      });
      
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      return Promise.resolve();
    } catch (error: any) {
      toast.error(`Error updating due date: ${error.message}`);
      return Promise.reject(error);
    }
  }, []);

  return {
    handleComplete,
    handleDelete,
    handleFavoriteToggle,
    handlePriorityChange,
    handleDateChange
  };
}
