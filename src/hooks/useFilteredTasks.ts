
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/components/tasks/taskTypes";
import { useAuth } from "@/hooks/use-auth";

export function useFilteredTasks(filterId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['filter', filterId, user?.id],
    queryFn: async () => {
      if (!user || !filterId) return [];

      // Fetch filter details
      const { data: filter, error: filterError } = await supabase
        .from('filters')
        .select('*')
        .eq('id', filterId)
        .eq('user_id', user.id)
        .single();

      if (filterError) throw filterError;

      // Fetch all tasks for the user
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            name,
            color
          )
        `)
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      // Transform to Task interface
      const allTasks: Task[] = tasksData.map((task: any) => ({
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

      // Apply filter conditions (simplified filtering logic)
      const filteredTasks = allTasks.filter(task => {
        if (!filter.conditions || !Array.isArray(filter.conditions)) return true;
        
        return filter.conditions.some((condition: any) => {
          switch (condition.type) {
            case 'priority':
              return task.priority.toString() === condition.value;
            case 'project':
              return task.projectId === condition.value;
            case 'due':
              if (condition.value === 'today') {
                const today = new Date();
                return task.dueDate && 
                  task.dueDate.toDateString() === today.toDateString();
              }
              return false;
            default:
              return true;
          }
        });
      });

      return filteredTasks;
    },
    enabled: !!user && !!filterId,
  });
}
