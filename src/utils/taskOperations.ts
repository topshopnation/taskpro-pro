
import { Task } from "@/components/tasks/TaskItem";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const updateTaskCompletion = async (taskId: string, completed: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', taskId);
      
    if (error) throw error;
  } catch (error: any) {
    toast.error("Failed to update task", {
      description: error.message
    });
    throw error; // Re-throw to allow for optimistic UI updates to be reverted
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
      
    if (error) throw error;
    
    toast.success("Task deleted");
  } catch (error: any) {
    toast.error("Failed to delete task", {
      description: error.message
    });
    throw error;
  }
};

export const toggleTaskFavorite = async (taskId: string, favorite: boolean): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ favorite })
      .eq('id', taskId);
      
    if (error) throw error;
  } catch (error: any) {
    toast.error("Failed to update task", {
      description: error.message
    });
    throw error;
  }
};
