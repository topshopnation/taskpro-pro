
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Task } from "@/components/tasks/TaskItem";
import { toast } from "sonner";

export function useSearchTasks(query: string) {
  const { user } = useAuth();
  const [results, setResults] = useState<Task[]>([]);
  
  const fetchSearchResults = async () => {
    if (!user || !query.trim()) return [];
    
    try {
      // Use ilike for case-insensitive search
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(name, color)')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,notes.ilike.%${query}%`)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      return data.map((task: any) => ({
        id: task.id,
        title: task.title,
        notes: task.notes,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        priority: task.priority || 4,
        projectId: task.project_id,
        projectName: task.projects?.name || 'No Project',
        projectColor: task.projects?.color,
        completed: task.completed || false,
        favorite: task.favorite || false
      }));
    } catch (error: any) {
      toast.error("Failed to search tasks", {
        description: error.message
      });
      return [];
    }
  };
  
  const { data, isLoading } = useQuery({
    queryKey: ['search-tasks', query, user?.id],
    queryFn: fetchSearchResults,
    enabled: !!user && query.trim().length > 0
  });
  
  // Set results when data changes
  useState(() => {
    if (data) {
      setResults(data);
    } else {
      setResults([]);
    }
  });
  
  return {
    results: data || [],
    isLoading: isLoading && query.trim().length > 0
  };
}
