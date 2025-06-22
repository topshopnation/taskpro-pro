
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Task } from "@/components/tasks/taskTypes";
import { startOfDay } from "date-fns";

export function useOverdueTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['overdue-tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const today = startOfDay(new Date());
      
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
        .not('due_date', 'is', null)
        .lt('due_date', today.toISOString());

      if (error) throw error;

      return data.map((task: any): Task => ({
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
    },
    enabled: !!user,
  });
}
