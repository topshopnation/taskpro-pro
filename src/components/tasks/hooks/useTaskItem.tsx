
import { useState } from "react";
import { Task } from "@/components/tasks/taskTypes";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/lib/react-query";

interface UseTaskItemProps {
  task: Task;
  onComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void;
  onPriorityChange?: (taskId: string, priority: 1 | 2 | 3 | 4) => void;
  onDateChange?: (taskId: string, date: Date | undefined) => void;
}

export function useTaskItem({
  task,
  onComplete,
  onDelete,
  onFavoriteToggle,
  onPriorityChange,
  onDateChange,
}: UseTaskItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { completeTask } = useTaskOperations();

  const handleCompletionToggle = async () => {
    if (isUpdating) return; // Prevent multiple rapid clicks
    
    setIsUpdating(true);
    try {
      // Use completeTask with optimistic update callback - NO additional toasts here
      const success = await completeTask(task.id, !task.completed, onComplete);
      
      if (!success) {
        // If the operation failed, the optimistic update will be reverted by useTaskOperations
        console.error("Failed to complete task");
      }
    } catch (error: any) {
      console.error("Error in handleCompletionToggle:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: 1 | 2 | 3 | 4) => {
    setIsUpdating(true);
    try {
      if (onPriorityChange) {
        await onPriorityChange(task.id, newPriority);
      } else {
        const { error } = await supabase
          .from('tasks')
          .update({ priority: newPriority })
          .eq('id', task.id);
        
        if (error) throw error;
        
        // Invalidate all task queries to ensure all components get fresh data
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['search-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
        queryClient.invalidateQueries({ queryKey: ['inbox-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['filtered-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['filter'] });
        
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
    setIsUpdating(true);
    try {
      if (onDateChange) {
        await onDateChange(task.id, date);
      } else {
        const formattedDate = date ? date.toISOString() : null;
        
        const { error } = await supabase
          .from('tasks')
          .update({ due_date: formattedDate })
          .eq('id', task.id);
        
        if (error) throw error;
        
        // Invalidate all task queries to ensure all components get fresh data
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['search-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
        queryClient.invalidateQueries({ queryKey: ['inbox-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['filtered-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['filter'] });
        
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
      
      setIsDeleteDialogOpen(false);
      onDelete(task.id);
      // No toast here - the deleteTask function in useTaskOperations handles this
    } catch (error: any) {
      toast.error(`Error deleting task: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isUpdating,
    handleCompletionToggle,
    handlePriorityChange,
    handleDateChange,
    handleDelete
  };
}
