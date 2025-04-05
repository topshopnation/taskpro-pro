
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Task } from "@/components/tasks/TaskItem"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { format, subDays } from "date-fns"

export function useCompletedTasks(timeFilter: string = "all") {
  const [tasks, setTasks] = useState<Task[]>([])
  const { user } = useAuth()

  // Fetch completed tasks from Supabase
  const fetchCompletedTasks = async () => {
    if (!user) return []
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        
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
      toast.error("Failed to fetch completed tasks", {
        description: error.message
      })
      return []
    }
  }
  
  // Use React Query to fetch tasks
  const { data: completedTasks, isLoading } = useQuery({
    queryKey: ['completedTasks', user?.id],
    queryFn: fetchCompletedTasks,
    enabled: !!user
  })
  
  // Update local state when data is fetched
  useEffect(() => {
    if (completedTasks) {
      setTasks(completedTasks)
    }
  }, [completedTasks])
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return
    
    const channel = supabase
      .channel('completed-tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`,
      }, async () => {
        // Refetch tasks when changes occur
        const updatedTasks = await fetchCompletedTasks()
        setTasks(updatedTasks)
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const filteredTasks = tasks.filter(task => {
    if (!task.completed) return false
    
    // Apply time filter if needed
    if (timeFilter === "today") {
      if (!task.dueDate) return false
      const today = new Date()
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === today.getDate() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getFullYear() === today.getFullYear()
      )
    }
    
    if (timeFilter === "week") {
      if (!task.dueDate) return false
      const weekAgo = subDays(new Date(), 7)
      return new Date(task.dueDate) >= weekAgo
    }
    
    return true // "all" filter
  })

  // Group by project
  const groupTasksByProject = () => {
    const tasksByProject: Record<string, Task[]> = {}
    
    filteredTasks.forEach(task => {
      const projectId = task.projectId || "none"
      if (!tasksByProject[projectId]) {
        tasksByProject[projectId] = []
      }
      tasksByProject[projectId].push(task)
    })
    
    return tasksByProject
  }

  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)
        
      if (error) throw error
      
      // Optimistic update
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      )
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
      setTasks(tasks.filter((task) => task.id !== taskId))
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
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, favorite } : task
        )
      )
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      })
    }
  }

  return {
    tasks: filteredTasks,
    tasksByProject: groupTasksByProject(),
    isLoading,
    handleComplete,
    handleDelete,
    handleFavoriteToggle
  }
}
