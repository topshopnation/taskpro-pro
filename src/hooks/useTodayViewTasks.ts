
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCallback } from "react";
import { queryClient } from "@/lib/react-query";
import { Task } from "@/components/tasks/taskTypes";
import { startOfToday, endOfToday } from "date-fns";
import { useOptimisticTasks } from "@/hooks/useOptimisticTasks";

export const useTodayViewTasks = () => {
  const { user } = useAuth();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['today-tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            name,
            color
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', false)
        .gte('due_date', startOfToday().toISOString())
        .lte('due_date', endOfToday().toISOString());

      if (error) throw error;

      return data.map((task: any): Task => ({
        id: task.id,
        title: task.title,
        notes: task.notes,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        priority: task.priority || 4,
        projectId: task.project_id,
        projectName: task.projects?.name,
        projectColor: task.projects?.color,
        completed: task.completed || false,
        favorite: task.favorite || false
      }));
    },
    enabled: !!user,
  });

  const { 
    visibleTasks,
    handleOptimisticComplete,
    handleOptimisticDelete
  } = useOptimisticTasks(tasks);

  const handleComplete = useCallback(async (taskId: string, completed: boolean) => {
    if (!user) return;

    // Apply optimistic update
    handleOptimisticComplete(taskId, completed);

    // Invalidate queries for consistency across the app
    queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [user, handleOptimisticComplete]);

  const handleDelete = useCallback(async (taskId: string) => {
    if (!user) return;

    // Apply optimistic update
    handleOptimisticDelete(taskId);

    // Invalidate queries for consistency
    queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [user, handleOptimisticDelete]);

  const handleFavoriteToggle = useCallback(async (taskId: string, favorite: boolean) => {
    if (!user) return;

    // Just invalidate queries for UI updates
    queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [user]);

  return {
    tasks: visibleTasks,
    isLoading,
    error,
    handleComplete,
    handleDelete,
    handleFavoriteToggle
  };
};
