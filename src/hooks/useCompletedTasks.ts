
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@/components/tasks/TaskItem";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { filterCompletedTasksByTime, groupTasksByProject } from "@/utils/taskFilterUtils";
import { updateTaskCompletion, deleteTask } from "@/utils/taskOperations";
import { useTaskRealtime } from "@/hooks/useTaskRealtime";

export function useCompletedTasks(timeFilter: string = "all") {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  // Fetch completed tasks from Supabase
  const fetchCompletedTasks = useCallback(async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true);
        
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
      toast.error("Failed to fetch completed tasks", {
        description: error.message
      });
      return [];
    }
  }, [user]);
  
  // Use React Query to fetch tasks
  const { data: completedTasks, isLoading } = useQuery({
    queryKey: ['completedTasks', user?.id],
    queryFn: fetchCompletedTasks,
    enabled: !!user
  });
  
  // Update local state when data is fetched
  useEffect(() => {
    if (completedTasks) {
      setTasks(completedTasks);
    }
  }, [completedTasks]);
  
  // Setup realtime subscription
  useTaskRealtime(user, async () => {
    const updatedTasks = await fetchCompletedTasks();
    setTasks(updatedTasks);
  });

  const filteredTasks = filterCompletedTasksByTime(tasks, timeFilter);
  const tasksByProject = groupTasksByProject(filteredTasks);

  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      await updateTaskCompletion(taskId, completed);
      
      // Optimistic update
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      );
    } catch (error) {
      // Error is already handled in updateTaskCompletion
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      
      // Optimistic update
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      // Error is already handled in deleteTask
    }
  };

  return {
    tasks: filteredTasks,
    tasksByProject,
    isLoading,
    handleComplete,
    handleDelete
  };
}
