
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCallback } from "react";
import { queryClient } from "@/lib/react-query";
import { Task } from "@/components/tasks/taskTypes";
import { useOptimisticTasks } from "@/hooks/useOptimisticTasks";

export const useProjectTasks = (projectId?: string) => {
  const { user } = useAuth();

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ['project-tasks', projectId, user?.id],
    queryFn: async () => {
      if (!user || !projectId) return [];

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
        .eq('project_id', projectId)
        .eq('completed', false);

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
    enabled: !!user && !!projectId,
  });

  const { 
    visibleTasks,
    handleOptimisticComplete,
    handleOptimisticDelete
  } = useOptimisticTasks(tasks);

  // Filter out tasks that have sections (for unsectioned tasks display)
  const unsectionedTasks = visibleTasks.filter(task => !task.section);

  const handleComplete = useCallback(async (taskId: string, completed: boolean) => {
    if (!user) return;

    // Apply optimistic update
    handleOptimisticComplete(taskId, completed);

    // Invalidate queries for consistency across the app
    queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [user, handleOptimisticComplete]);

  const handleDelete = useCallback(async (taskId: string) => {
    if (!user) return;

    // Apply optimistic update
    handleOptimisticDelete(taskId);

    // Invalidate queries for consistency
    queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [user, handleOptimisticDelete]);

  return {
    tasks: visibleTasks,
    unsectionedTasks,
    isLoadingTasks: isLoading,
    handleComplete,
    handleDelete,
    refetch
  };
};
