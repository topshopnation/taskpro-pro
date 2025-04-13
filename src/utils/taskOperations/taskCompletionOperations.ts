
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const updateTaskCompletion = async (taskId: string, completed: boolean, taskTitle?: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', taskId);
      
    if (error) throw error;
    
    if (taskTitle) {
      toast(`"${taskTitle}" ${completed ? 'completed' : 'marked incomplete'}`, {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await updateTaskCompletion(taskId, !completed, taskTitle);
            } catch (error) {
              console.error("Failed to undo task completion", error);
            }
          }
        }
      });
    }
  } catch (error: any) {
    toast.error("Failed to update task", {
      description: error.message
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
  } catch (error: any) {
    toast.error("Failed to update task favorite status", {
      description: error.message
    });
    throw error;
  }
};
