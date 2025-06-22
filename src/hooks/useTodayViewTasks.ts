
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCallback } from "react";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";
import { Task } from "@/components/tasks/taskTypes";
import { isToday, startOfToday, endOfToday } from "date-fns";

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

  const handleComplete = useCallback(async (taskId: string, completed: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(completed ? "Task completed!" : "Task uncompleted!");
    } catch (error: any) {
      toast.error(`Failed to ${completed ? 'complete' : 'uncomplete'} task: ${error.message}`);
    }
  }, [user]);

  const handleDelete = useCallback(async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task deleted!");
    } catch (error: any) {
      toast.error(`Failed to delete task: ${error.message}`);
    }
  }, [user]);

  const handleFavoriteToggle = useCallback(async (taskId: string, favorite: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ favorite })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(favorite ? "Task added to favorites!" : "Task removed from favorites!");
    } catch (error: any) {
      toast.error(`Failed to update favorite status: ${error.message}`);
    }
  }, [user]);

  return {
    tasks,
    isLoading,
    error,
    handleComplete,
    handleDelete,
    handleFavoriteToggle
  };
};
