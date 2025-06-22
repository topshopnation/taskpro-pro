
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/components/tasks/taskTypes";
import { useAuth } from "@/hooks/use-auth";
import { standardFilters } from "@/types/filterTypes";

export function useFilteredTasks(filterId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['filter', filterId, user?.id],
    queryFn: async () => {
      if (!user || !filterId) return [];

      // Check if it's a standard filter first
      const standardFilter = standardFilters.find(filter => filter.id === filterId);
      if (standardFilter) {
        // Fetch all tasks for standard filters
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            *,
            projects (
              name,
              color
            )
          `)
          .eq('user_id', user.id)
          .eq('completed', false); // Standard filters typically show uncompleted tasks

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

        // Apply standard filter logic
        return allTasks.filter(task => {
          if (filterId === 'today') {
            const today = new Date();
            return task.dueDate && 
              task.dueDate.toDateString() === today.toDateString();
          } else if (filterId === 'upcoming') {
            const today = new Date();
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return task.dueDate && 
              task.dueDate >= today && 
              task.dueDate <= weekFromNow;
          } else if (filterId === 'priority1') {
            return task.priority === 1;
          }
          return true;
        });
      }

      // Fetch custom filter details
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

      // Parse filter conditions - handle both array and object formats
      let conditions = [];
      if (filter.conditions) {
        if (Array.isArray(filter.conditions)) {
          conditions = filter.conditions;
        } else if (typeof filter.conditions === 'object' && filter.conditions.items) {
          conditions = filter.conditions.items;
        } else if (typeof filter.conditions === 'object') {
          conditions = [filter.conditions];
        }
      }

      if (conditions.length === 0) {
        return allTasks;
      }

      // Apply filter conditions
      const filteredTasks = allTasks.filter(task => {
        const conditionResults = conditions.map((condition: any) => {
          switch (condition.type) {
            case 'priority':
              return task.priority.toString() === condition.value;
            case 'project':
              if (condition.value === 'inbox') {
                return !task.projectId || task.projectId === null;
              }
              return task.projectId === condition.value;
            case 'due':
              if (condition.value === 'today') {
                const today = new Date();
                return task.dueDate && 
                  task.dueDate.toDateString() === today.toDateString();
              }
              if (condition.value === 'this_week') {
                const today = new Date();
                const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                return task.dueDate && 
                  task.dueDate >= today && 
                  task.dueDate <= weekFromNow;
              }
              return false;
            case 'completed':
              return task.completed === (condition.value === 'true');
            case 'favorite':
              return task.favorite === (condition.value === 'true');
            default:
              return true;
          }
        });

        // Apply logic (AND/OR) - get logic from filter conditions or default to 'and'
        const logic = (filter.conditions && typeof filter.conditions === 'object' && filter.conditions.logic) || 'and';
        if (logic === 'and') {
          return conditionResults.every(result => result);
        } else {
          return conditionResults.some(result => result);
        }
      });

      return filteredTasks;
    },
    enabled: !!user && !!filterId,
  });
}
