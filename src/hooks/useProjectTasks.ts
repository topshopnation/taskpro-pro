
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth-context"
import { Task } from "@/components/tasks/TaskItem"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { fetchProjectTasks } from "@/utils/taskOperations"
import { useTaskRealtime } from "@/hooks/useTaskRealtime"

export function useProjectTasks(projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [unsectionedTasks, setUnsectionedTasks] = useState<Task[]>([])
  const { user } = useAuth()
  
  // Fetch tasks using React Query
  const { data: projectTasks, isLoading, refetch } = useQuery({
    queryKey: ['projectTasks', projectId, user?.id],
    queryFn: async () => {
      if (!projectId || !user) return []
      return fetchProjectTasks(projectId, user.id)
    },
    enabled: !!projectId && !!user
  })
  
  // Set up realtime subscription
  useTaskRealtime(user, async () => {
    refetch();
  })
  
  // Process tasks when data is fetched
  useEffect(() => {
    if (projectTasks) {
      setTasks(projectTasks)
      
      // Filter out completed tasks and organize by section
      const incompleteTasks = projectTasks.filter(task => !task.completed)
      setUnsectionedTasks(incompleteTasks)
    }
  }, [projectTasks])
  
  // Handle marking task as complete/incomplete
  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      // Find the task to get its title for toast
      const task = tasks.find(t => t.id === taskId);
      const taskTitle = task?.title;
      
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)
      
      if (error) throw error
      
      // Optimistic UI update
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ))
      
      setUnsectionedTasks(prevTasks => 
        completed
          ? prevTasks.filter(task => task.id !== taskId)
          : [...prevTasks.filter(task => task.id !== taskId), 
             { ...tasks.find(t => t.id === taskId)!, completed }]
      )
      
      // Show toast with undo action
      if (taskTitle) {
        toast(`"${taskTitle}" ${completed ? 'completed' : 'marked incomplete'}`, {
          id: `task-complete-${taskId}`,
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                const { error } = await supabase
                  .from('tasks')
                  .update({ completed: !completed })
                  .eq('id', taskId)
                
                if (error) throw error
                
                // Refetch to update UI
                refetch()
              } catch (err) {
                console.error("Failed to undo task completion", err)
                toast.error("Failed to undo action")
              }
            }
          }
        })
      }
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      })
    }
  }
  
  // Handle task deletion
  const handleDelete = async (taskId: string) => {
    try {
      // Store deleted task data for potential restore
      const deletedTask = tasks.find(task => task.id === taskId);
      const taskTitle = deletedTask?.title;
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
      
      if (error) throw error
      
      // Optimistic UI update
      setTasks(tasks.filter(task => task.id !== taskId))
      setUnsectionedTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
      
      // Show toast with success message
      if (taskTitle) {
        toast(`"${taskTitle}" deleted`, {
          description: "Task has been permanently deleted."
        })
      } else {
        toast.success("Task deleted")
      }
    } catch (error: any) {
      toast.error("Failed to delete task", {
        description: error.message
      })
    }
  }
  
  return {
    tasks,
    unsectionedTasks,
    isLoadingTasks: isLoading,
    handleComplete,
    handleDelete,
    refetch
  }
}
