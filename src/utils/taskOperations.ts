
import { Task } from "@/components/tasks/TaskItem";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tag, TaskTagRelation } from "@/components/tasks/taskTypes";

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
    toast.error("Failed to update task favorite status", {
      description: error.message
    });
    throw error;
  }
};

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

// New functions extracted from useProjectTasks

export const fetchProjectTasks = async (projectId: string, userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return data.map((task: any) => ({
      id: task.id,
      title: task.title,
      notes: task.notes,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      priority: task.priority || 4,
      projectId: task.project_id,
      completed: task.completed || false,
      favorite: task.favorite || false
    }));
  } catch (error: any) {
    toast.error("Failed to fetch tasks", {
      description: error.message
    });
    return [];
  }
};
