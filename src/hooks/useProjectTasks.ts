
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Task } from "@/components/tasks/TaskItem"

export function useProjectTasks(projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [sections, setSections] = useState<{id: string, name: string}[]>([])
  const { user } = useAuth()

  // Fetch project tasks
  const fetchTasks = async () => {
    if (!user || !projectId) return []
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        
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
      toast.error("Failed to fetch tasks", {
        description: error.message
      })
      return []
    }
  }
  
  // Use React Query to fetch tasks
  const { data: projectTasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['projectTasks', projectId, user?.id],
    queryFn: fetchTasks,
    enabled: !!user && !!projectId
  })
  
  // Update local states when data is fetched
  useEffect(() => {
    if (projectTasks) {
      setTasks(projectTasks)
    }
  }, [projectTasks])
  
  // Generate sections from tasks
  useEffect(() => {
    if (tasks.length > 0) {
      const uniqueSections = Array.from(
        new Set(tasks.filter(task => task.section).map(task => task.section))
      ).map(sectionId => {
        // Use section name from task or default to section ID
        const sectionNames: Record<string, string> = {
          'todo': 'To Do',
          'inprogress': 'In Progress',
          'done': 'Done'
        }
        
        return {
          id: sectionId as string,
          name: sectionNames[sectionId as string] || sectionId as string
        }
      })
      
      setSections(uniqueSections)
    }
  }, [tasks])
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!user || !projectId) return
    
    const channel = supabase
      .channel('project-tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`
      }, async () => {
        // Refetch tasks when changes occur
        const updatedTasks = await fetchTasks()
        setTasks(updatedTasks)
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, projectId])

  // Get tasks for each section
  const getSectionTasks = (sectionId: string) => {
    return tasks.filter(task => task.section === sectionId && !task.completed)
  }
  
  // Get tasks without sections
  const unsectionedTasks = tasks.filter(task => !task.section && !task.completed)

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

  const handleSectionChange = async (taskId: string, sectionId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ section: sectionId })
        .eq('id', taskId)
        
      if (error) throw error
      
      // Optimistic update
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, section: sectionId } : task
        )
      )
      toast.success("Task moved to section")
    } catch (error: any) {
      toast.error("Failed to move task", {
        description: error.message
      })
    }
  }

  return {
    tasks,
    sections,
    isLoadingTasks,
    unsectionedTasks,
    getSectionTasks,
    handleComplete,
    handleDelete,
    handleFavoriteToggle,
    handleSectionChange
  }
}
