
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useCallback } from "react";
import { queryClient } from "@/lib/react-query";
import { Task } from "@/components/tasks/taskTypes";

export function useProjectTasks(projectId: string | undefined) {
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
        .order('created_at', { ascending: false });

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

  const handleComplete = useCallback(async (taskId: string, completed: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
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

      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      toast.success("Task deleted!");
    } catch (error: any) {
      toast.error(`Failed to delete task: ${error.message}`);
    }
  }, [user]);

  // Filter tasks that are not in sections (unsectioned tasks)
  const unsectionedTasks = tasks.filter(task => !task.section);

  return {
    tasks,
    unsectionedTasks,
    isLoadingTasks: isLoading,
    isLoading,
    error,
    handleComplete,
    handleDelete,
    refetch
  };
}
