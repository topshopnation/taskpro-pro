
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/components/tasks/TaskItem";
import { useTaskRealtime } from "@/hooks/useTaskRealtime";
import { getEndOfYesterday } from "@/utils/overdueTaskUtils";

export function useOverdueTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchOverdueTasks = useCallback(async () => {
    if (!userId) return [];
    
    // Use end of yesterday as the cutoff point to exclude today's tasks
    const endOfYesterday = getEndOfYesterday();
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(name, color)')
        .eq('user_id', userId)
        .eq('completed', false)
        .lt('due_date', endOfYesterday.toISOString())
        
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
        section: task.section,
        completed: task.completed || false,
        favorite: task.favorite || false
      }));
    } catch (error: any) {
      toast.error("Failed to fetch overdue tasks", {
        description: error.message
      });
      return [];
    }
  }, [userId]);
  
  const { isLoading, refetch } = useQuery({
    queryKey: ['overdue-tasks', userId],
    queryFn: fetchOverdueTasks,
    enabled: !!userId
  });
  
  useEffect(() => {
    if (!userId) return;
    
    fetchOverdueTasks().then(fetchedTasks => {
      setTasks(fetchedTasks);
    }).catch(error => {
      console.error("Error fetching overdue tasks:", error);
    });
  }, [userId, fetchOverdueTasks]);

  useTaskRealtime(userId ? { id: userId } : null, () => {
    fetchOverdueTasks()
      .then(updatedTasks => {
        setTasks(updatedTasks);
      })
      .catch(error => {
        console.error("Error in real-time update:", error);
      });
  });

  return {
    tasks,
    isLoading,
    refetch
  };
}
