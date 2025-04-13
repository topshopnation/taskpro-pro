
import { Tag } from "@/components/tasks/taskTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const getTaskTags = async (taskId: string): Promise<Tag[]> => {
  try {
    // Use a raw query with type assertion to work around type constraints
    const { data, error } = await (supabase as any)
      .from('task_tags')
      .select('tags(id, name, color)')
      .eq('task_id', taskId);
      
    if (error) throw error;
    
    // Extract tags from the nested structure
    return data.map((item: any) => item.tags as Tag);
  } catch (error: any) {
    toast.error("Failed to fetch task tags", {
      description: error.message
    });
    return [];
  }
};

export const addTaskTag = async (taskId: string, tagId: string, userId: string): Promise<void> => {
  try {
    // Use a raw query with type assertion
    const { error } = await (supabase as any)
      .from('task_tags')
      .insert({
        task_id: taskId,
        tag_id: tagId,
        user_id: userId
      });
      
    if (error) throw error;
  } catch (error: any) {
    toast.error("Failed to add tag to task", {
      description: error.message
    });
    throw error;
  }
};

export const removeTaskTag = async (taskId: string, tagId: string): Promise<void> => {
  try {
    // Use a raw query with type assertion
    const { error } = await (supabase as any)
      .from('task_tags')
      .delete()
      .eq('task_id', taskId)
      .eq('tag_id', tagId);
      
    if (error) throw error;
  } catch (error: any) {
    toast.error("Failed to remove tag from task", {
      description: error.message
    });
    throw error;
  }
};
