
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
    
    // Store task data for undo functionality
    const taskTitle = task.title;
    const newCompletedState = !task.completed;
    
    try {
      // Update database FIRST
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newCompletedState })
        .eq('id', task.id);
        
      if (error) throw error;
      
      // Wait for ALL queries to refresh completely before proceeding
      await invalidateAllTaskQueries();
      
      // Call the parent handler
      onComplete(task.id, newCompletedState);
      
      // Generate unique toast ID
      const uniqueId = `task-${newCompletedState ? 'complete' : 'incomplete'}-${task.id}-${Date.now()}`;
      
      // Show completion toast with undo functionality
      toast(`"${taskTitle}" ${newCompletedState ? 'completed' : 'marked incomplete'}`, {
        id: uniqueId,
        duration: 5000,
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              // Dismiss this toast when undo is clicked
              toast.dismiss(uniqueId);
              
              // Revert to previous state in database
              const { error: undoError } = await supabase
                .from('tasks')
                .update({ completed: !newCompletedState })
                .eq('id', task.id);
              
              if (undoError) throw undoError;
              
              // Re-invalidate queries after undoing
              await invalidateAllTaskQueries();
              
              // Call parent handler for undo
              onComplete(task.id, !newCompletedState);
              
              // Show success message for undo
              toast.success("Task undone", {
                duration: 3000
              });
            } catch (undoError) {
              console.error("Undo failed:", undoError);
              toast.error("Failed to undo", {
                duration: 3000
              });
            }
          }
        }
      });
      
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
      // Update database FIRST
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
      
      // Update database FIRST
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
