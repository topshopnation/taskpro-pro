
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCallback, useState } from "react";
import { queryClient } from "@/lib/react-query";
import { Task } from "@/components/tasks/taskTypes";
import { isToday, startOfToday, endOfToday } from "date-fns";

export const useTodayViewTasks = () => {
  const { user } = useAuth();
  const [hiddenTaskIds, setHiddenTaskIds] = useState<Set<string>>(new Set());

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

  // Filter out hidden tasks for optimistic UI updates
  const visibleTasks = tasks.filter(task => !hiddenTaskIds.has(task.id));

  const handleComplete = useCallback(async (taskId: string, completed: boolean) => {
    if (!user) return;

    // Optimistically update UI
    if (completed) {
      // Hide task immediately when marked as complete
      setHiddenTaskIds(prev => new Set(prev).add(taskId));
    } else {
      // Show task immediately when marked as incomplete (undo)
      setHiddenTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }

    // Invalidate queries for consistency across the app
    queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [user]);

  const handleDelete = useCallback(async (taskId: string) => {
    if (!user) return;

    // Optimistically hide the task immediately
    setHiddenTaskIds(prev => new Set(prev).add(taskId));

    // Invalidate queries for consistency
    queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [user]);

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
