
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { TaskList } from "@/components/tasks/TaskList"
import { Task } from "@/components/tasks/TaskItem"
import { format, subDays } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

// Mock data - replace with real data from Supabase
const mockTasks: Task[] = [
  {
    id: "5",
    title: "Review weekly reports",
    priority: 2,
    projectId: "work",
    completed: true,
    favorite: false
  },
  {
    id: "6",
    title: "Prepare presentation slides",
    priority: 1,
    projectId: "work",
    section: "done",
    completed: true,
    favorite: false
  },
  {
    id: "7",
    title: "Pay electricity bill",
    priority: 3,
    projectId: "personal",
    completed: true,
    favorite: false
  }
]

export default function CompletedTasks() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [timeFilter, setTimeFilter] = useState("all")

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

  const getProjectName = (projectId: string): string => {
    const projectNames: Record<string, string> = {
      "inbox": "Inbox",
      "work": "Work",
      "personal": "Personal",
      "none": "No Project"
    }
    return projectNames[projectId] || projectId
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
