
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@/components/tasks/TaskItem";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { fetchAllTasks, updateTaskCompletion, deleteTask } from "@/utils/taskOperations";
import { useTaskRealtime } from "@/hooks/useTaskRealtime";

export function useDashboardTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  // Use React Query to fetch tasks with proper retry and stale time
  const { data: fetchedTasks, isLoading } = useQuery({
    queryKey: ['dashboard-tasks', user?.id],
    queryFn: () => fetchAllTasks(user?.id || ''),
    enabled: !!user,
    staleTime: 10000, // 10 seconds
    retry: 3,
    retryDelay: 1000,
  });
  
  // Update local state when data is fetched
  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);
  
  // Subscribe to real-time updates using shared hook
  useTaskRealtime(user, async () => {
    if (user) {
      const updatedTasks = await fetchAllTasks(user.id);
      setTasks(updatedTasks);
    }
  });

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
      // Error is handled in the taskOperations utility
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      
      // Optimistic update
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      // Error is handled in the taskOperations utility
    }
  };

  // Get tasks due today
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });

  // Get high priority tasks (priority 1)
  const highPriorityTasks = tasks.filter(task => task.priority === 1 && !task.completed);

  return {
    tasks,
    isLoading,
    todayTasks,
    highPriorityTasks,
    handleComplete,
    handleDelete
  };
}
