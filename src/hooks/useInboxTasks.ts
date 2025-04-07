
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Task } from "@/components/tasks/TaskItem"
import { updateTaskCompletion, deleteTask, toggleTaskFavorite } from "@/utils/taskOperations"

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
        section: task.section,
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
  const { data: inboxTasks, isLoading } = useQuery({
    queryKey: ['inboxTasks', user?.id],
    queryFn: fetchTasks,
    enabled: !!user
  })
  
  // Set up realtime subscription
  useEffect(() => {
    if (!user) return
    
    // Create a Supabase channel for real-time updates
    const channel = supabase
      .channel('public:tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        },
        async () => {
          // Refetch tasks when database changes
          const updatedTasks = await fetchTasks()
          setTasks(updatedTasks)
        }
      )
      .subscribe()
    
    // Clean up the subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])
  
  // Update local state when data is fetched
  useEffect(() => {
    if (inboxTasks) {
      setTasks(inboxTasks)
    }
  }, [inboxTasks])

  // Handle task operations
  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      await updateTaskCompletion(taskId, completed)
      
      // Optimistic update
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      )
    } catch (error) {
      // Error is handled in the taskOperations utility
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      
      // Optimistic update
      setTasks(tasks.filter((task) => task.id !== taskId))
    } catch (error) {
      // Error is handled in the taskOperations utility
    }
  }

  const handleFavoriteToggle = async (taskId: string, favorite: boolean) => {
    try {
      await toggleTaskFavorite(taskId, favorite)
      
      // Optimistic update
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, favorite } : task
        )
      )
    } catch (error) {
      // Error is handled in the taskOperations utility
    }
  }

  return {
    tasks,
    isLoading,
    handleComplete,
    handleDelete,
    handleFavoriteToggle
  }
}
