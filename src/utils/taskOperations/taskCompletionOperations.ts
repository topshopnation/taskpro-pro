
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const updateTaskCompletion = async (taskId: string, completed: boolean, taskTitle?: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', taskId);
      
    if (error) throw error;
    
    // No toast notifications here to prevent duplicates
    // The useTaskOperations hook handles all task completion toasts
    
  } catch (error: any) {
    // Only show error toasts here, success is handled by the main hook
    toast.error("Failed to update task", {
      description: error.message,
      duration: 3000
    });
    throw error; // Re-throw to allow for optimistic UI updates to be reverted
  }
};

export const toggleTaskFavorite = async (taskId: string, favorite: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ favorite })
      .eq('id', taskId);
      
    if (error) throw error;
    
    toast.success(favorite ? "Added to favorites" : "Removed from favorites", {
      duration: 2000
    });
  } catch (error: any) {
    toast.error("Failed to update task favorite status", {
      description: error.message,
      duration: 3000
    });
    throw error;
  }
};
