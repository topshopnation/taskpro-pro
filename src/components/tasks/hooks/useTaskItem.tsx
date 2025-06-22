
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
        // Optimistically update the local task state immediately
        const previousTask = { ...task };
        
        // Update the task in all relevant queries immediately
        queryClient.setQueryData(['tasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((t: Task) => t.id === task.id ? { ...t, priority: newPriority } : t);
        });
        
        queryClient.setQueryData(['today-tasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((t: Task) => t.id === task.id ? { ...t, priority: newPriority } : t);
        });
        
        queryClient.setQueryData(['overdue-tasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((t: Task) => t.id === task.id ? { ...t, priority: newPriority } : t);
        });
        
        queryClient.setQueryData(['inbox-tasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((t: Task) => t.id === task.id ? { ...t, priority: newPriority } : t);
        });
        
        queryClient.setQueryData(['project-tasks', task.projectId], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((t: Task) => t.id === task.id ? { ...t, priority: newPriority } : t);
        });
        
        queryClient.setQueryData(['filtered-tasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((t: Task) => t.id === task.id ? { ...t, priority: newPriority } : t);
        });

        const { error } = await supabase
          .from('tasks')
          .update({ priority: newPriority })
          .eq('id', task.id);
        
        if (error) {
          // Revert optimistic update on error
          queryClient.setQueryData(['tasks'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((t: Task) => t.id === task.id ? previousTask : t);
          });
          
          queryClient.setQueryData(['today-tasks'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((t: Task) => t.id === task.id ? previousTask : t);
          });
          
          queryClient.setQueryData(['overdue-tasks'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((t: Task) => t.id === task.id ? previousTask : t);
          });
          
          queryClient.setQueryData(['inbox-tasks'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((t: Task) => t.id === task.id ? previousTask : t);
          });
          
          queryClient.setQueryData(['project-tasks', task.projectId], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((t: Task) => t.id === task.id ? previousTask : t);
          });
          
          queryClient.setQueryData(['filtered-tasks'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((t: Task) => t.id === task.id ? previousTask : t);
          });
          
          throw error;
        }
        
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
        // Optimistically update the local task state immediately
        const previousTask = { ...task };
        const formattedDate = date ? date.toISOString() : null;
        
        // Update the task in all relevant queries immediately
        queryClient.setQueryData(['tasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((t: Task) => t.id === task.id ? { ...t, dueDate: date } : t);
        });
        
        queryClient.setQueryData(['today-tasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((t: Task) => t.id === task.id ? { ...t, dueDate: date } : t);
        });
        
        queryClient.setQueryData(['overdue-tasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((t: Task) => t.id === task.id ? { ...t, dueDate: date } : t);
        });
        
        queryClient.setQueryData(['inbox-tasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((t: Task) => t.id === task.id ? { ...t, dueDate: date } : t);
        });
        
        queryClient.setQueryData(['project-tasks', task.projectId], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((t: Task) => t.id === task.id ? { ...t, dueDate: date } : t);
        });
        
        queryClient.setQueryData(['filtered-tasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((t: Task) => t.id === task.id ? { ...t, dueDate: date } : t);
        });
        
        const { error } = await supabase
          .from('tasks')
          .update({ due_date: formattedDate })
          .eq('id', task.id);
        
        if (error) {
          // Revert optimistic update on error
          queryClient.setQueryData(['tasks'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((t: Task) => t.id === task.id ? previousTask : t);
          });
          
          queryClient.setQueryData(['today-tasks'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((t: Task) => t.id === task.id ? previousTask : t);
          });
          
          queryClient.setQueryData(['overdue-tasks'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((t: Task) => t.id === task.id ? previousTask : t);
          });
          
          queryClient.setQueryData(['inbox-tasks'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((t: Task) => t.id === task.id ? previousTask : t);
          });
          
          queryClient.setQueryData(['project-tasks', task.projectId], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((t: Task) => t.id === task.id ? previousTask : t);
          });
          
          queryClient.setQueryData(['filtered-tasks'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((t: Task) => t.id === task.id ? previousTask : t);
          });
          
          throw error;
        }
        
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
