
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";

export function useTaskOperations() {
  const [isLoading, setIsLoading] = useState(false);
  
  const completeTask = async (taskId: string, completed: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Invalidate all task queries to ensure all components get fresh data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['search-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
      
      toast.success(completed ? "Task completed" : "Task marked incomplete");
      return true;
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteTask = async (taskId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['search-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
      
      toast.success("Task deleted");
      return true;
    } catch (error: any) {
      toast.error("Failed to delete task", {
        description: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    completeTask,
    deleteTask
  };
}
