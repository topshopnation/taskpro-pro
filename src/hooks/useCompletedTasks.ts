
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Task } from "@/components/tasks/taskTypes";
import { useCallback } from "react";
import { queryClient } from "@/lib/react-query";
import { toast } from "sonner";

export function useCompletedTasks(timeFilter: string = "all") {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['completedTasks', user?.id, timeFilter],
    queryFn: async () => {
      if (!user) return { tasksByProject: {}, totalCompleted: 0 };

      let query = supabase
        .from('tasks')
        .select(`
          *,
          projects (
            name,
            color
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('updated_at', { ascending: false });

      // Apply time filter
      if (timeFilter !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (timeFilter) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('updated_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const tasks: Task[] = data.map((task: any) => ({
        id: task.id,
        title: task.title,
        notes: task.notes,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        priority: task.priority || 4,
        projectId: task.project_id,
        projectName: task.projects?.name || "No Project",
        projectColor: task.projects?.color,
        completed: task.completed || false,
        favorite: task.favorite || false
      }));

      // Group tasks by project
      const tasksByProject: Record<string, Task[]> = {};
      tasks.forEach(task => {
        const projectName = task.projectName || "No Project";
        if (!tasksByProject[projectName]) {
          tasksByProject[projectName] = [];
        }
        tasksByProject[projectName].push(task);
      });

      return {
        tasksByProject,
        totalCompleted: tasks.length
      };
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

      queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
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

      queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
      toast.success("Task deleted!");
    } catch (error: any) {
      toast.error(`Failed to delete task: ${error.message}`);
    }
  }, [user]);

  return {
    ...(data || { tasksByProject: {}, totalCompleted: 0 }),
    isLoading,
    handleComplete,
    handleDelete
  };
}
