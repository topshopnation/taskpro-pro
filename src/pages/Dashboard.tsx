
import { useState } from "react"
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

// Mock data - replace with real data from Supabase
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Finish project proposal",
    notes: "Include all the requirements and budget estimation",
    dueDate: new Date("2025-04-10"),
    priority: 1,
    projectId: "work",
    section: "todo",
    completed: false,
    favorite: true
  },
  {
    id: "2",
    title: "Buy groceries",
    dueDate: new Date("2025-04-06"),
    priority: 3,
    projectId: "personal",
    completed: false,
    favorite: false
  },
  {
    id: "3",
    title: "Schedule team meeting",
    dueDate: new Date("2025-04-08"),
    priority: 2,
    projectId: "work",
    completed: false,
    favorite: true
  }
]

const stats = [
  { name: 'Mon', completed: 4 },
  { name: 'Tue', completed: 3 },
  { name: 'Wed', completed: 5 },
  { name: 'Thu', completed: 2 },
  { name: 'Fri', completed: 6 },
  { name: 'Sat', completed: 1 },
  { name: 'Sun', completed: 0 },
]

const projectStats = [
  { name: 'Work', completed: 12, total: 20 },
  { name: 'Personal', completed: 8, total: 15 },
  { name: 'Inbox', completed: 5, total: 7 },
]

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  
  const handleComplete = (taskId: string, completed: boolean) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed } : task
      )
    )
  }

  const handleDelete = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const handleFavoriteToggle = (taskId: string, favorite: boolean) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, favorite } : task
      )
    )
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
