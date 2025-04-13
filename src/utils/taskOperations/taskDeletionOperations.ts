
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const deleteTask = async (taskId: string, taskTitle?: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
      
    if (error) throw error;
    
    toast.success(taskTitle ? `"${taskTitle}" deleted` : "Task deleted");
  } catch (error: any) {
    toast.error("Failed to delete task", {
      description: error.message
    });
    throw error;
  }
};
