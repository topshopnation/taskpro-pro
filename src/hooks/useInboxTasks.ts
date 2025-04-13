
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth-context"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Task } from "@/components/tasks/TaskItem"
import { updateTaskCompletion, deleteTask } from "@/utils/taskOperations"
import { useTaskRealtime } from "@/hooks/useTaskRealtime"

export function useInboxTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const { user } = useAuth()

  // Fetch inbox tasks (tasks with no project_id)
  const fetchTasks = async () => {
    if (!user) return []
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .is('project_id', null)
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('due_date', { ascending: true, nullsFirst: false })
        
      if (error) throw error
      
      return data.map((task: any) => ({
        id: task.id,
        title: task.title,
        notes: task.notes,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        priority: task.priority || 4,
        projectId: task.project_id,
        completed: task.completed || false,
        favorite: task.favorite || false
      }))
    } catch (error: any) {
      toast.error("Failed to fetch inbox tasks", {
        description: error.message
      })
      return []
    }
  }
  
  // Use React Query to fetch tasks
  const { data: inboxTasks, isLoading, refetch } = useQuery({
    queryKey: ['inboxTasks', user?.id],
    queryFn: fetchTasks,
    enabled: !!user
  })
  
  // Set up realtime subscription using the shared hook
  useTaskRealtime(user, async () => {
    // Directly refetch data from the database to ensure we get updated data
    refetch();
  })
  
  // Update local state when data is fetched
  useEffect(() => {
    if (inboxTasks) {
      setTasks(inboxTasks)
    }
  }, [inboxTasks])

  // Handle task operations
  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      // Get the task title for the toast
      const task = tasks.find(t => t.id === taskId);
      const taskTitle = task?.title || '';
      
      await updateTaskCompletion(taskId, completed, taskTitle)
      
      // Optimistic update
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      )
      
      // Toast is now handled in the updateTaskCompletion function
    } catch (error) {
      // Error is handled in the taskOperations utility
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      // Get the task title for the toast
      const task = tasks.find(t => t.id === taskId);
      const taskTitle = task?.title || '';
      
      await deleteTask(taskId, taskTitle)
      
      // Optimistic update
      setTasks(tasks.filter((task) => task.id !== taskId))
    } catch (error) {
      // Error is handled in the taskOperations utility
    }
  }

  return {
    tasks,
    isLoading,
    handleComplete,
    handleDelete,
    refetch
  }
}
