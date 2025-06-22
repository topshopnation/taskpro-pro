
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";

export function useTaskCompletion() {
  const [isLoading, setIsLoading] = useState(false);
  
  const completeTask = async (taskId: string, completed: boolean, onOptimisticUpdate?: (taskId: string, completed: boolean) => void): Promise<boolean> => {
    if (isLoading) return false; // Prevent concurrent operations
    
    setIsLoading(true);
    
    // Store task data before update for potential undo
    let taskData;
    try {
      // First get the current task data
      const { data: currentTask, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
        
      if (fetchError) throw fetchError;
      taskData = currentTask;
      
      // Call optimistic update callback if provided
      if (onOptimisticUpdate) {
        onOptimisticUpdate(taskId, completed);
      }
      
      // Now update the task
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
      queryClient.invalidateQueries({ queryKey: ['inbox-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      
      // Generate a unique toast ID to prevent duplicates and handle cleanup
      const uniqueId = `task-${completed ? 'complete' : 'incomplete'}-${taskId}-${Date.now()}`;
      
      // Dismiss any existing completion toasts for this task to prevent overlaps
      toast.dismiss(`task-complete-${taskId}`);
      toast.dismiss(`task-incomplete-${taskId}`);
      toast.dismiss(`task-undo-${taskId}`);
      
      // Only show undo toast - no completion confirmation toast at all
      toast(`"${taskData.title}" ${completed ? 'completed' : 'marked incomplete'}`, {
        id: uniqueId,
        duration: 5000, // Give users time to see and use the undo button
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              // Dismiss this toast when undo is clicked
              toast.dismiss(uniqueId);
              
              // Call optimistic update callback for undo if provided
              if (onOptimisticUpdate) {
                onOptimisticUpdate(taskId, !completed);
              }
              
              // Revert to previous state
              const { error: undoError } = await supabase
                .from('tasks')
                .update({ completed: !completed })
                .eq('id', taskId);
              
              if (undoError) throw undoError;
              
              // Re-invalidate queries after undoing
              queryClient.invalidateQueries({ queryKey: ['tasks'] });
              queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
              queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
              queryClient.invalidateQueries({ queryKey: ['search-tasks'] });
              queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
              queryClient.invalidateQueries({ queryKey: ['inbox-tasks'] });
              queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
              
              // Show success message for undo
              toast.success("Task undone", {
                id: `task-undo-success-${taskId}-${Date.now()}`,
                duration: 3000
              });
            } catch (undoError) {
              // If undo fails, revert the optimistic update
              if (onOptimisticUpdate) {
                onOptimisticUpdate(taskId, completed);
              }
              toast.error("Failed to undo", {
                id: `task-undo-error-${taskId}-${Date.now()}`,
                duration: 3000
              });
            }
          }
        }
      });
      
      return true;
    } catch (error: any) {
      // If there's an error, revert the optimistic update
      if (onOptimisticUpdate) {
        onOptimisticUpdate(taskId, !completed);
      }
      toast.error("Failed to update task", {
        description: error.message,
        id: `task-error-${taskId}-${Date.now()}`,
        duration: 4000
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    completeTask
  };
}
