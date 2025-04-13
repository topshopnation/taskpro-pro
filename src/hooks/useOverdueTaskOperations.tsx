
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/lib/react-query";

export function useOverdueTaskOperations() {
  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { data: taskData, error: fetchError } = await supabase
        .from('tasks')
        .select('title')
        .eq('id', taskId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      
      // Only show toast for completion, not for marking incomplete
      if (completed) {
        toast(`"${taskData.title}" completed`, {
          action: {
            label: "Undo",
            onClick: () => handleComplete(taskId, false)
          }
        });
      }
      
      return true;
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      });
      return false;
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      toast.success("Task deleted");
      return true;
    } catch (error: any) {
      toast.error("Failed to delete task", {
        description: error.message
      });
      return false;
    }
  };

  const handleFavoriteToggle = async (taskId: string, favorite: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ favorite })
        .eq('id', taskId);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      return true;
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      });
      return false;
    }
  };

  const handlePriorityChange = async (taskId: string, priority: 1 | 2 | 3 | 4) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ priority })
        .eq('id', taskId);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      return true;
    } catch (error: any) {
      toast.error("Failed to update task priority", {
        description: error.message
      });
      return false;
    }
  };

  const handleDateChange = async (taskId: string, date: Date | undefined) => {
    try {
      const formattedDate = date ? date.toISOString() : null;
      
      const { error } = await supabase
        .from('tasks')
        .update({ due_date: formattedDate })
        .eq('id', taskId);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      toast.success(date ? "Due date updated" : "Due date removed");
      return true;
    } catch (error: any) {
      toast.error("Failed to update due date", {
        description: error.message
      });
      return false;
    }
  };

  return {
    handleComplete,
    handleDelete,
    handleFavoriteToggle,
    handlePriorityChange,
    handleDateChange
  };
}
