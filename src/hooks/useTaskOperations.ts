
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
      
      // Add undo action to toast
      toast(completed ? "Task completed" : "Task marked incomplete", {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await supabase
                .from('tasks')
                .update({ completed: !completed })
                .eq('id', taskId);
              
              // Re-invalidate queries after undoing
              queryClient.invalidateQueries({ queryKey: ['tasks'] });
              queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
              queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
              queryClient.invalidateQueries({ queryKey: ['search-tasks'] });
              queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
              
              toast.success(!completed ? "Task completed" : "Task marked incomplete");
            } catch (undoError) {
              toast.error("Failed to undo");
            }
          }
        }
      });
      
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
    
    // Store task data before deletion for potential undo
    let taskData;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
      
      if (error) throw error;
      taskData = data;
      
      // Now delete the task
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (deleteError) throw deleteError;
      
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['search-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
      
      // Add toast with undo option
      toast("Task deleted", {
        action: {
          label: "Undo",
          onClick: async () => {
            if (taskData) {
              try {
                const { id, created_at, ...restData } = taskData;
                
                // Restore the task with its original data
                await supabase
                  .from('tasks')
                  .insert({ id, ...restData });
                
                // Re-invalidate queries after restoring
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
                queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
                queryClient.invalidateQueries({ queryKey: ['search-tasks'] });
                queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
                
                toast.success("Task restored");
              } catch (undoError) {
                toast.error("Failed to restore task");
              }
            }
          }
        }
      });
      
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
