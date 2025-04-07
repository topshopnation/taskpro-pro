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

export const getTaskTags = async (taskId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('task_tags')
      .select('tags:tag_id(id, name, color)')
      .eq('task_id', taskId);
      
    if (error) throw error;
    
    // Extract tags from the nested structure
    return data.map(item => item.tags);
  } catch (error: any) {
    toast.error("Failed to fetch task tags", {
      description: error.message
    });
    return [];
  }
};

export const addTaskTag = async (taskId: string, tagId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
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
    const { error } = await supabase
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
