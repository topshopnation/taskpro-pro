
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryClient } from "@/lib/react-query";

export function useTaskOperations() {
  const [isLoading, setIsLoading] = useState(false);
  
  const completeTask = async (taskId: string, completed: boolean) => {
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
      
      // Generate a unique toast ID to prevent duplicates
      const uniqueId = `task-complete-${taskId}-${Date.now()}`;
      
      // Only show toast with undo action - removing separate "task completed" notification
      toast(completed ? `"${taskData.title}" completed` : `"${taskData.title}" marked incomplete`, {
        id: uniqueId,
        duration: 3000, // Ensure toast stays for 3 seconds
        action: {
          label: "Undo",
          onClick: async () => {
            try {
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
            } catch (undoError) {
              toast.error("Failed to undo", {
                id: `task-undo-error-${taskId}-${Date.now()}`
              });
            }
          }
        }
      });
      
      return true;
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message,
        id: `task-error-${taskId}-${Date.now()}`
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
      
      // Generate a unique toast ID to prevent duplicates
      const uniqueId = `task-delete-${taskId}-${Date.now()}`;
      
      // Add toast with undo option
      toast("Task deleted", {
        id: uniqueId,
        duration: 3000, // Ensure toast stays for 3 seconds
        action: {
          label: "Undo",
          onClick: async () => {
            if (taskData) {
              try {
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
              } catch (undoError) {
                toast.error("Failed to restore task", {
                  id: `task-restore-error-${taskId}-${Date.now()}`
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
        id: `task-delete-error-${taskId}-${Date.now()}`
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
