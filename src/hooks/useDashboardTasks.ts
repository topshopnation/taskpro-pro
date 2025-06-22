
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Task } from "@/components/tasks/taskTypes";
import { isToday, startOfToday, endOfToday } from "date-fns";

export function useDashboardTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-tasks', user?.id],
    queryFn: async () => {
      if (!user) return { todayTasks: [], highPriorityTasks: [], allTasks: [] };

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
        .eq('completed', false);

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

      const today = new Date();
      const todayTasks = tasks.filter(task => 
        task.dueDate && isToday(task.dueDate)
      );

      const highPriorityTasks = tasks.filter(task => task.priority === 1);

      return {
        todayTasks,
        highPriorityTasks,
        allTasks: tasks
      };
    },
    enabled: !!user,
  });
}
