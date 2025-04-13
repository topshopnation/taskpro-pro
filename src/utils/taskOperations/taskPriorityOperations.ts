
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const updateTaskPriority = async (taskId: string, priority: 1 | 2 | 3 | 4): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ priority })
      .eq('id', taskId);
      
    if (error) throw error;
  } catch (error: any) {
    toast.error("Failed to update task priority", {
      description: error.message
    });
    throw error;
  }
};
