
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Task } from "@/components/tasks/taskTypes";
import { filterCompletedTasksByTime, groupTasksByProject } from "@/utils/taskFilterUtils";

export function useCompletedTasks(timeFilter: string = "all") {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['completedTasks', user?.id, timeFilter],
    queryFn: async () => {
      if (!user) return { tasksByProject: {}, totalCompleted: 0 };

      // Fetch completed tasks with project information
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
        .eq('completed', true);

      if (error) throw error;

      // Transform data to match Task interface
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

      // Filter tasks by time
      const filteredTasks = filterCompletedTasksByTime(tasks, timeFilter);
      
      // Group tasks by project
      const tasksByProject = groupTasksByProject(filteredTasks);
      
      return {
        tasksByProject,
        totalCompleted: filteredTasks.length
      };
    },
    enabled: !!user,
  });
}
