
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@/components/tasks/TaskItem";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export function useDashboardTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      return data.map((task: any) => ({
        id: task.id,
        title: task.title,
        notes: task.notes,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        priority: task.priority || 4,
        projectId: task.project_id,
        completed: task.completed || false
      }));
    } catch (error: any) {
      console.error("Failed to fetch tasks:", error.message);
      toast.error("Failed to fetch tasks", {
        description: error.message
      });
      return [];
    }
  };
  
  // Use React Query to fetch tasks with proper retry and stale time
  const { data: fetchedTasks, isLoading } = useQuery({
    queryKey: ['dashboard-tasks', user?.id],
    queryFn: fetchTasks,
    enabled: !!user,
    staleTime: 10000, // 10 seconds
    retry: 3,
    retryDelay: 1000,
  });
  
  // Update local state when data is fetched
  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('dashboard-tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`
      }, async () => {
        // Refetch tasks when changes occur
        const updatedTasks = await fetchTasks();
        setTasks(updatedTasks);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Optimistic update
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      );
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Optimistic update
      setTasks(tasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted");
    } catch (error: any) {
      toast.error("Failed to delete task", {
        description: error.message
      });
    }
  };

  // Get tasks due today
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });

  // Get high priority tasks (priority 1)
  const highPriorityTasks = tasks.filter(task => task.priority === 1 && !task.completed);

  return {
    tasks,
    isLoading,
    todayTasks,
    highPriorityTasks,
    handleComplete,
    handleDelete
  };
}
