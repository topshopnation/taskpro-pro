
import { useTaskCompletion } from "@/hooks/taskOperations/useTaskCompletion";
import { useTaskDeletion } from "@/hooks/taskOperations/useTaskDeletion";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";

export function useTaskOperations() {
  const { isLoading: isCompletionLoading, completeTask } = useTaskCompletion();
  const { isLoading: isDeletionLoading, deleteTask } = useTaskDeletion();
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  
  const toggleTaskFavorite = async (taskId: string, favorite: boolean) => {
    setIsFavoriteLoading(true);
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ favorite })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Invalidate all task queries to ensure all components get fresh data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['search-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['inbox-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['filter'] });
      
      toast.success(favorite ? "Added to favorites" : "Removed from favorites", {
        duration: 2000
      });
      
      return true;
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message,
        duration: 4000
      });
      return false;
    } finally {
      setIsFavoriteLoading(false);
    }
  };
  
  // Return combined loading state and operations
  return {
    isLoading: isCompletionLoading || isDeletionLoading || isFavoriteLoading,
    completeTask,
    deleteTask,
    toggleTaskFavorite
  };
}
