
import { Task } from "@/components/tasks/taskTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fetch functions for dashboard tasks
export const fetchAllTasks = async (userId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
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

// Functions extracted from useProjectTasks
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
