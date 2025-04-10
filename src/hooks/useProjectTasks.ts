
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Task } from "@/components/tasks/TaskItem";
import { fetchProjectTasks, updateTaskCompletion, deleteTask } from "@/utils/taskOperations";
import { useTaskRealtime } from "@/hooks/useTaskRealtime";

export function useProjectTasks(projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  // Create a memoized fetch function for both initial load and realtime updates
  const fetchTasks = useCallback(async () => {
    if (!user || !projectId) return [];
    return await fetchProjectTasks(projectId, user.id);
  }, [projectId, user]);
  
  // Use React Query to fetch tasks
  const { data: projectTasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['projectTasks', projectId, user?.id],
    queryFn: fetchTasks,
    enabled: !!user && !!projectId
  });
  
  // Update local states when data is fetched
  useEffect(() => {
    if (projectTasks) {
      setTasks(projectTasks);
    }
  }, [projectTasks]);
  
  // Set up realtime subscriptions
  const refetchTasks = useCallback(async () => {
    const updatedTasks = await fetchTasks();
    setTasks(updatedTasks);
  }, [fetchTasks]);
  
  // Use the extracted realtime hook
  useTaskRealtime(user, refetchTasks);

  // Get tasks without sections
  const unsectionedTasks = tasks.filter(task => !task.completed);

  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      await updateTaskCompletion(taskId, completed);
      
      // Optimistic update
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      );
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      
      // Optimistic update
      setTasks(tasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted");
    } catch (error: any) {
      toast.error("Failed to delete task", {
        description: error.message
      });
    }
  };

  return {
    tasks,
    isLoadingTasks,
    unsectionedTasks,
    handleComplete,
    handleDelete
  };
}
