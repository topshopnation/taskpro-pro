
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useOverdueTaskOperations() {
  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);
        
      if (error) throw error;
      
      toast.success(completed ? "Task completed" : "Task uncompleted");
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
      return true;
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      });
      return false;
    }
  };

  return {
    handleComplete,
    handleDelete,
    handleFavoriteToggle
  };
}
