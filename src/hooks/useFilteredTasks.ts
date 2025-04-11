
import { useState, useEffect } from "react";
import { Task } from "@/components/tasks/TaskItem";
import { CustomFilter } from "@/types/filterTypes";
import { supabase } from "@/integrations/supabase/client";
import { filterTasks } from "@/utils/filterUtils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useFilteredTasks(filter: CustomFilter | null) {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch tasks from Supabase with React Query
  const fetchTasks = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      return data.map((task: any) => ({
        id: task.id,
        title: task.title,
        notes: task.notes,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        dueTime: task.due_date ? new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        priority: task.priority || 4,
        projectId: task.project_id,
        section: task.section,
        completed: task.completed || false,
        favorite: task.favorite || false
      } as Task));
    } catch (error: any) {
      console.error("Failed to fetch tasks:", error.message);
      toast.error("Failed to fetch tasks", {
        description: error.message
      });
      return [];
    }
  };

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: fetchTasks,
    enabled: !!user,
  });

  // Setup realtime subscription
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('all-tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`,
      }, async () => {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Apply filter whenever tasks or filter changes
  useEffect(() => {
    console.log("Filtering tasks. Total tasks:", tasks.length, "Filter:", filter?.name);
    
    if (filter) {
      const filtered = filterTasks(tasks, filter).filter(task => !task.completed);
      console.log("Filtered tasks:", filtered.length);
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks([]);
    }
  }, [tasks, filter]);

  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Optimistic update
      setFilteredTasks(
        filteredTasks.filter(task => task.id !== taskId)
      );

      // Show only one toast with undo capability
      if (completed) {
        toast("Task completed", {
          action: {
            label: "Undo",
            onClick: () => handleComplete(taskId, false)
          },
        });
      }
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
      setFilteredTasks(filteredTasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted");
    } catch (error: any) {
      toast.error("Failed to delete task", {
        description: error.message
      });
    }
  };

  const handleFavoriteToggle = async (taskId: string, favorite: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ favorite })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Optimistic update
      setFilteredTasks(
        filteredTasks.map((task) =>
          task.id === taskId ? { ...task, favorite } : task
        )
      );
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      });
    }
  };

  const handlePriorityChange = async (taskId: string, priority: 1 | 2 | 3 | 4) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ priority })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Optimistic update
      setFilteredTasks(
        filteredTasks.map((task) =>
          task.id === taskId ? { ...task, priority } : task
        )
      );
      
      // Invalidate the query to refresh data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error: any) {
      toast.error("Failed to update task priority", {
        description: error.message
      });
    }
  };

  const handleDateChange = async (taskId: string, dueDate: Date | undefined) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          due_date: dueDate ? dueDate.toISOString() : null 
        })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Optimistic update
      setFilteredTasks(
        filteredTasks.map((task) =>
          task.id === taskId ? { ...task, dueDate } : task
        )
      );
      
      // Invalidate the query to refresh data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error: any) {
      toast.error("Failed to update task due date", {
        description: error.message
      });
    }
  };

  return {
    filteredTasks,
    isLoading,
    handleComplete,
    handleDelete,
    handleFavoriteToggle,
    handlePriorityChange,
    handleDateChange
  };
}
