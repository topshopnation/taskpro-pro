
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Task } from "@/components/tasks/taskTypes";

export function useSearchTasks(searchQuery: string) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['search-tasks', searchQuery, user?.id],
    queryFn: async () => {
      if (!user || !searchQuery.trim()) return { tasks: [], allTasks: [] };

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
        .or(`title.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tasks: Task[] = data.map((task: any) => ({
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

      return {
        tasks,
        allTasks: tasks
      };
    },
    enabled: !!user && !!searchQuery.trim(),
  });

  return {
    results: data?.tasks || [],
    tasks: data?.tasks || [],
    allTasks: data?.allTasks || [],
    isLoading: isLoading && !!searchQuery.trim()
  };
}
