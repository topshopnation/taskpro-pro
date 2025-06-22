
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/components/tasks/taskTypes";
import { useAuth } from "@/hooks/use-auth";
import { standardFilters } from "@/types/filterTypes";

export function useFilteredTasks(filterId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['filtered-tasks', filterId, user?.id],
    queryFn: async () => {
      if (!user || !filterId) return [];

      console.log('Fetching tasks for filter:', filterId);

      // Check if it's a standard filter first
      const standardFilter = standardFilters.find(filter => filter.id === filterId);
      if (standardFilter) {
        console.log('Processing standard filter:', standardFilter.name);
        
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
        const allTasks: Task[] = (tasksData || []).map((task: any) => ({
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
        const filteredTasks = allTasks.filter(task => {
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

        console.log('Standard filter results:', filteredTasks.length, 'tasks');
        return filteredTasks;
      }

      // Fetch custom filter details
      console.log('Fetching custom filter details for:', filterId);
      const { data: filter, error: filterError } = await supabase
        .from('filters')
        .select('*')
        .eq('id', filterId)
        .eq('user_id', user.id)
        .single();

      if (filterError) {
        console.error('Filter fetch error:', filterError);
        if (filterError.code === 'PGRST116') {
          // Filter not found, return empty array
          return [];
        }
        throw filterError;
      }

      console.log('Custom filter found:', filter.name, 'conditions:', filter.conditions);

      // Fetch only uncompleted tasks for custom filters
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
        .eq('completed', false); // Only fetch uncompleted tasks for custom filters

      if (tasksError) throw tasksError;

      // Transform to Task interface
      const allTasks: Task[] = (tasksData || []).map((task: any) => ({
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

      console.log('Total uncompleted tasks fetched:', allTasks.length);

      // Parse filter conditions - handle both array and object formats
      let conditions: any[] = [];
      let logic = "and";
      
      if (filter.conditions) {
        if (Array.isArray(filter.conditions)) {
          conditions = filter.conditions;
        } else if (typeof filter.conditions === 'object' && filter.conditions !== null) {
          // Handle object with items property
          const conditionsObj = filter.conditions as any;
          if ('items' in conditionsObj && Array.isArray(conditionsObj.items)) {
            conditions = conditionsObj.items;
            logic = conditionsObj.logic || "and";
          } else {
            // Single condition object
            conditions = [filter.conditions];
          }
        }
      }

      console.log('Parsed conditions:', conditions, 'logic:', logic);

      if (conditions.length === 0) {
        console.log('No conditions, returning all uncompleted tasks');
        return allTasks;
      }

      // Apply filter conditions
      const filteredTasks = allTasks.filter(task => {
        const conditionResults = conditions.map((condition: any) => {
          console.log('Evaluating condition:', condition, 'for task:', task.title);
          
          switch (condition.type) {
            case 'priority':
              const result = task.priority.toString() === condition.value;
              console.log('Priority condition result:', result, 'task priority:', task.priority, 'condition value:', condition.value);
              return result;
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

        // Apply logic (AND/OR)
        const finalResult = logic === 'and' 
          ? conditionResults.every(result => result)
          : conditionResults.some(result => result);
          
        if (finalResult) {
          console.log('Task matches filter:', task.title);
        }
        
        return finalResult;
      });

      console.log('Custom filter results:', filteredTasks.length, 'uncompleted tasks match the filter');
      return filteredTasks;
    },
    enabled: !!user && !!filterId,
  });
}
