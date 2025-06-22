
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";

export function useTaskDeletion() {
  const [isLoading, setIsLoading] = useState(false);
  
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
      
      // Generate a unique toast ID to prevent duplicates
      const uniqueId = `task-delete-${taskId}-${Date.now()}`;
      
      // Add toast with undo option
      toast("Task deleted", {
        id: uniqueId,
        duration: 5000, // Give users time to see and use the undo button
        action: {
          label: "Undo",
          onClick: async () => {
            if (taskData) {
              try {
                // Dismiss this toast when undo is clicked
                toast.dismiss(uniqueId);
                
                const { id, created_at, ...restData } = taskData;
                
                // Restore the task with its original data
                const { error: restoreError } = await supabase
                  .from('tasks')
                  .insert({ id, ...restData });
                  
                if (restoreError) throw restoreError;
                
                // Re-invalidate queries after restoring
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
                queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
                queryClient.invalidateQueries({ queryKey: ['search-tasks'] });
                queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
                
                toast.success("Task restored", {
                  id: `task-restore-success-${taskId}-${Date.now()}`,
                  duration: 3000
                });
              } catch (undoError) {
                toast.error("Failed to restore task", {
                  id: `task-restore-error-${taskId}-${Date.now()}`,
                  duration: 3000
                });
              }
            }
          }
        }
      });
      
      return true;
    } catch (error: any) {
      toast.error("Failed to delete task", {
        description: error.message,
        id: `task-delete-error-${taskId}-${Date.now()}`,
        duration: 4000
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    deleteTask
  };
}
