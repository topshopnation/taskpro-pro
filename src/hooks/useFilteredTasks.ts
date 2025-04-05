
import { useState, useEffect } from "react";
import { Task } from "@/components/tasks/TaskItem";
import { CustomFilter } from "@/types/filterTypes";
import { supabase } from "@/integrations/supabase/client";
import { filterTasks } from "@/utils/filterUtils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export function useFilteredTasks(filter: CustomFilter | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  // Fetch tasks from Supabase
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
        priority: task.priority || 4,
        projectId: task.project_id,
        section: task.section,
        completed: task.completed || false,
        favorite: task.favorite || false
      }));
    } catch (error: any) {
      toast.error("Failed to fetch tasks", {
        description: error.message
      });
      return [];
    }
  };

  // Initial fetch
  useEffect(() => {
    const loadTasks = async () => {
      const taskData = await fetchTasks();
      setTasks(taskData);
    };

    loadTasks();
  }, [user]);

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
        const updatedTasks = await fetchTasks();
        setTasks(updatedTasks);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Apply filter whenever tasks or filter changes
  useEffect(() => {
    if (filter) {
      const filtered = filterTasks(tasks, filter).filter(task => !task.completed);
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
      
      setTasks(tasks.filter((task) => task.id !== taskId));
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
      
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, favorite } : task
        )
      );
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      });
    }
  };

  return {
    filteredTasks,
    handleComplete,
    handleDelete,
    handleFavoriteToggle
  };
}
