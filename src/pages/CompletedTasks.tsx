
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import AppLayout from "@/components/layout/AppLayout"
import { TaskList } from "@/components/tasks/TaskList"
import { Task } from "@/components/tasks/TaskItem"
import { format, subDays } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"

export default function CompletedTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeFilter, setTimeFilter] = useState("all")
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
  const tasksByProject: Record<string, Task[]> = {}
  
  filteredTasks.forEach(task => {
    const projectId = task.projectId || "none"
    if (!tasksByProject[projectId]) {
      tasksByProject[projectId] = []
    }
    tasksByProject[projectId].push(task)
  })

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

  const getProjectName = (projectId: string): string => {
    // In a real app, you'd fetch this from the database
    const projectNames: Record<string, string> = {
      "inbox": "Inbox",
      "work": "Work",
      "personal": "Personal",
      "none": "No Project"
    }
    return projectNames[projectId] || projectId
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Completed Tasks</h1>
          <div className="flex items-center gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {Object.keys(tasksByProject).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No completed tasks found</p>
          </div>
        ) : (
          Object.entries(tasksByProject).map(([projectId, projectTasks]) => (
            <div key={projectId} className="mb-8">
              <TaskList
                title={getProjectName(projectId)}
                tasks={projectTasks}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onFavoriteToggle={handleFavoriteToggle}
              />
            </div>
          ))
        )}
      </div>
    </AppLayout>
  )
}
