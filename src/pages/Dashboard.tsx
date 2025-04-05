
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import AppLayout from "@/components/layout/AppLayout"
import { TaskList } from "@/components/tasks/TaskList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Task } from "@/components/tasks/TaskItem"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const { user } = useAuth()
  
  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    if (!user) return []
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        
      if (error) {
        throw error
      }
      
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
  const { data: fetchedTasks, isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: fetchTasks,
    enabled: !!user
  })
  
  // Update local state when data is fetched
  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks)
    }
  }, [fetchedTasks])
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return
    
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`
      }, async () => {
        // Refetch tasks when changes occur
        const updatedTasks = await fetchTasks()
        setTasks(updatedTasks)
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])
  
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

  // Get tasks due today
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false
    const today = new Date()
    const taskDate = new Date(task.dueDate)
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    )
  })

  // Get favorite tasks
  const favoriteTasks = tasks.filter(task => task.favorite && !task.completed)

  // Get high priority tasks (priority 1)
  const highPriorityTasks = tasks.filter(task => task.priority === 1 && !task.completed)

  // Generate weekly stats based on completed tasks
  const generateWeeklyStats = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
    
    const stats = days.map((name, index) => {
      // Calculate date for this day of the week
      const date = new Date(today)
      const diff = index - dayOfWeek
      date.setDate(date.getDate() + diff)
      
      // Count completed tasks for this day
      const completedCount = tasks.filter(task => {
        if (!task.completed) return false
        const taskDate = new Date(task.dueDate || '')
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        )
      }).length
      
      return { name, completed: completedCount }
    })
    
    return stats
  }

  // Generate project stats based on task completion
  const generateProjectStats = () => {
    // Group tasks by project
    const projectTaskMap: Record<string, { completed: number, total: number, name: string }> = {}
    
    tasks.forEach(task => {
      const projectId = task.projectId || 'Inbox'
      
      if (!projectTaskMap[projectId]) {
        projectTaskMap[projectId] = { completed: 0, total: 0, name: projectId }
      }
      
      projectTaskMap[projectId].total++
      
      if (task.completed) {
        projectTaskMap[projectId].completed++
      }
    })
    
    return Object.values(projectTaskMap)
  }

  const stats = generateWeeklyStats()
  const projectStats = generateProjectStats()

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
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tasks Due Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Favorite Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{favoriteTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">High Priority Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{highPriorityTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="today" className="space-y-4">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="highPriority">High Priority</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          <TabsContent value="today">
            <TaskList
              title="Tasks Due Today"
              tasks={todayTasks}
              emptyMessage="No tasks due today"
              onComplete={handleComplete}
              onDelete={handleDelete}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </TabsContent>
          <TabsContent value="favorites">
            <TaskList
              title="Favorite Tasks"
              tasks={favoriteTasks}
              emptyMessage="No favorite tasks"
              onComplete={handleComplete}
              onDelete={handleDelete}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </TabsContent>
          <TabsContent value="highPriority">
            <TaskList
              title="High Priority Tasks"
              tasks={highPriorityTasks}
              emptyMessage="No high priority tasks"
              onComplete={handleComplete}
              onDelete={handleDelete}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </TabsContent>
          <TabsContent value="stats">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks Completed This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="completed" fill="hsl(var(--primary))" name="Tasks Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={projectStats}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" />
                        <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
