
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Task } from "@/components/tasks/TaskItem"
import { Button } from "@/components/ui/button"
import { Plus, Clock, ArrowDownAZ, ArrowUpZA, Layers, CalendarRange } from "lucide-react"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { TaskList } from "@/components/tasks/TaskList"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function OverdueView() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [groupBy, setGroupBy] = useState<string | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined)
  const { user } = useAuth()

  // Create a function to get today's date in the format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date()
    return format(today, 'yyyy-MM-dd')
  }

  // Fetch overdue tasks
  const fetchOverdueTasks = async () => {
    if (!user) return []
    
    const todayDate = getTodayDate()
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .lt('due_date', `${todayDate}T00:00:00`)
        .not('due_date', 'is', null)
        
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
      toast.error("Failed to fetch overdue tasks", {
        description: error.message
      })
      return []
    }
  }
  
  // Use React Query to fetch tasks
  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ['overdue-tasks', user?.id],
    queryFn: fetchOverdueTasks,
    enabled: !!user
  })

  // Handle task operations
  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)
        
      if (error) throw error
      
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
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      })
    }
  }

  const handleTaskSelect = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId))
    } else {
      setSelectedTasks([...selectedTasks, taskId])
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleDate || selectedTasks.length === 0) {
      toast.error("Please select a date and at least one task")
      return
    }
    
    try {
      const formattedDate = format(rescheduleDate, 'yyyy-MM-dd')
      
      for (const taskId of selectedTasks) {
        const { error } = await supabase
          .from('tasks')
          .update({ due_date: `${formattedDate}T12:00:00` })
          .eq('id', taskId)
          
        if (error) throw error
      }
      
      toast.success(`Rescheduled ${selectedTasks.length} tasks to ${format(rescheduleDate, 'PPP')}`)
      setSelectedTasks([])
      setIsRescheduleOpen(false)
      setRescheduleDate(undefined)
      refetch()
    } catch (error: any) {
      toast.error("Failed to reschedule tasks", {
        description: error.message
      })
    }
  }

  // Sort and group functions
  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      if (sortBy === "title") {
        return sortDirection === "asc" 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      } else if (sortBy === "dueDate") {
        // Handle null or undefined dates
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return sortDirection === "asc" ? 1 : -1
        if (!b.dueDate) return sortDirection === "asc" ? -1 : 1
        
        return sortDirection === "asc" 
          ? a.dueDate.getTime() - b.dueDate.getTime()
          : b.dueDate.getTime() - a.dueDate.getTime()
      } else if (sortBy === "project") {
        const projectA = a.projectId || "none"
        const projectB = b.projectId || "none"
        return sortDirection === "asc" 
          ? projectA.localeCompare(projectB)
          : projectB.localeCompare(projectA)
      }
      return 0
    })
  }

  const groupTasks = (tasksToGroup: Task[]) => {
    if (!groupBy) return { "All Tasks": sortTasks(tasksToGroup) }
    
    const grouped: Record<string, Task[]> = {}
    
    tasksToGroup.forEach(task => {
      let groupKey = ""
      
      if (groupBy === "project") {
        groupKey = task.projectId || "No Project"
      } else if (groupBy === "dueDate") {
        groupKey = task.dueDate 
          ? format(task.dueDate, 'PPP') 
          : "No Due Date"
      } else if (groupBy === "title") {
        // Group by first letter of title
        groupKey = task.title.charAt(0).toUpperCase()
      }
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = []
      }
      grouped[groupKey].push(task)
    })
    
    // Sort each group
    Object.keys(grouped).forEach(key => {
      grouped[key] = sortTasks(grouped[key])
    })
    
    return grouped
  }

  const groupedTasks = groupTasks(tasks)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Overdue</h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* Reschedule Button */}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsRescheduleOpen(true)}
              disabled={selectedTasks.length === 0}
              className={selectedTasks.length > 0 ? "bg-primary/10" : ""}
            >
              <CalendarRange className="h-4 w-4" />
            </Button>
            
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  {sortDirection === "asc" 
                    ? <ArrowDownAZ className="h-4 w-4" /> 
                    : <ArrowUpZA className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setSortBy("title"); setSortDirection("asc"); }}>
                  Sort by Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("title"); setSortDirection("desc"); }}>
                  Sort by Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setSortBy("dueDate"); setSortDirection("asc"); }}>
                  Sort by Due Date (Earliest)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("dueDate"); setSortDirection("desc"); }}>
                  Sort by Due Date (Latest)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setSortBy("project"); setSortDirection("asc"); }}>
                  Sort by Project (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("project"); setSortDirection("desc"); }}>
                  Sort by Project (Z-A)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Group Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Layers className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setGroupBy(null)}>
                  No Grouping
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setGroupBy("title")}>
                  Group by Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("project")}>
                  Group by Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("dueDate")}>
                  Group by Due Date
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              onClick={() => setIsCreateTaskOpen(true)}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </Button>
          </div>
        </div>

        {/* Display grouped tasks */}
        <div className="space-y-6">
          {Object.keys(groupedTasks).length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No overdue tasks</h3>
              <p className="text-muted-foreground mb-4">You're all caught up!</p>
              <Button onClick={() => setIsCreateTaskOpen(true)}>Add a Task</Button>
            </div>
          ) : (
            Object.entries(groupedTasks).map(([group, groupTasks]) => (
              <TaskList
                key={group}
                title={groupBy ? group : "Overdue Tasks"}
                tasks={groupTasks}
                isLoading={isLoading}
                emptyMessage="No tasks in this group"
                onComplete={handleComplete}
                onDelete={handleDelete}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))
          )}
        </div>

        {/* Dialogs */}
        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
        />
        
        <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reschedule Tasks</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={rescheduleDate}
                  onSelect={setRescheduleDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {selectedTasks.length} {selectedTasks.length === 1 ? "task" : "tasks"} selected
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReschedule} 
                disabled={!rescheduleDate || selectedTasks.length === 0}
              >
                Reschedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
