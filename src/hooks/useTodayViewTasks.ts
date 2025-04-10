
import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Task } from "@/components/tasks/TaskItem"
import { useTaskRealtime } from "@/hooks/useTaskRealtime"

export function useTodayViewTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const { user } = useAuth()

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0]
  }

  // Fetch today's tasks with project information
  const fetchTodayTasks = useCallback(async () => {
    if (!user) return []
    
    const todayDate = getTodayDate()
    
    try {
      // First fetch tasks
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*, projects(name, color)')
        .eq('user_id', user.id)
        .eq('completed', false)
        .gte('due_date', `${todayDate}T00:00:00`)
        .lt('due_date', `${todayDate}T23:59:59`)
        
      if (taskError) throw taskError
      
      // Map the data to include project names
      return taskData.map((task: any) => ({
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
      }))
    } catch (error: any) {
      toast.error("Failed to fetch today's tasks", {
        description: error.message
      })
      return []
    }
  }, [user])
  
  // Use React Query to fetch tasks
  const { data: todayTasks, isLoading } = useQuery({
    queryKey: ['today-tasks', user?.id],
    queryFn: fetchTodayTasks,
    enabled: !!user
  })
  
  // Update local state when data is fetched
  useEffect(() => {
    if (todayTasks) {
      setTasks(todayTasks)
    }
  }, [todayTasks])

  // Set up realtime subscription
  useTaskRealtime(user, async () => {
    const updatedTasks = await fetchTodayTasks()
    setTasks(updatedTasks)
  })

  // Task operations
  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)
        
      if (error) throw error
      
      // Optimistic update
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ))
      
      toast.success(completed ? "Task completed" : "Task uncompleted")
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      })
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        
      if (error) throw error
      
      // Optimistic update
      setTasks(prev => prev.filter(task => task.id !== taskId))
      toast.success("Task deleted")
    } catch (error: any) {
      toast.error("Failed to delete task", {
        description: error.message
      })
    }
  }

  const handleFavoriteToggle = async (taskId: string, favorite: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ favorite })
        .eq('id', taskId)
        
      if (error) throw error
      
      // Optimistic update
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, favorite } : task
      ))
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      })
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
