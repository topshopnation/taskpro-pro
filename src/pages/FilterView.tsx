
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AppLayout from "@/components/layout/AppLayout"
import { TaskList } from "@/components/tasks/TaskList"
import { Task } from "@/components/tasks/TaskItem"
import { MoreHorizontal, Star, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"

// Standard filter definitions (not from database)
const standardFilters = [
  { 
    id: "today", 
    name: "Today", 
    conditions: [{ type: "due", operator: "equals", value: "today" }],
    logic: "and",
    favorite: true 
  },
  { 
    id: "upcoming", 
    name: "Upcoming", 
    conditions: [{ type: "due", operator: "equals", value: "this_week" }],
    logic: "and",
    favorite: false 
  },
  { 
    id: "priority1", 
    name: "Priority 1", 
    conditions: [{ type: "priority", operator: "equals", value: "1" }],
    logic: "and",
    favorite: false 
  },
]

export default function FilterView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isEditFilterOpen, setIsEditFilterOpen] = useState(false)
  const [isDeleteFilterOpen, setIsDeleteFilterOpen] = useState(false)
  const [newFilterName, setNewFilterName] = useState("")
  const { user } = useAuth()

  // Find current filter
  const isStandardFilter = standardFilters.some(filter => filter.id === id)
  
  // Fetch filter from database if it's not a standard filter
  const fetchFilter = async () => {
    // Return standard filter if it matches
    const standardFilter = standardFilters.find(filter => filter.id === id)
    if (standardFilter) {
      return standardFilter
    }
    
    if (!user || !id) return null
    
    try {
      const { data, error } = await supabase
        .from('filters')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
        
      if (error) throw error
      
      return {
        id: data.id,
        name: data.name,
        conditions: data.conditions,
        logic: "and", // Default logic
        favorite: data.favorite || false
      }
    } catch (error: any) {
      toast.error("Failed to fetch filter", {
        description: error.message
      })
      navigate('/')
      return null
    }
  }
  
  // Fetch all tasks for filtering
  const fetchTasks = async () => {
    if (!user) return []
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
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
  
  // Use React Query to fetch filter
  const { data: currentFilter, isLoading: isLoadingFilter } = useQuery({
    queryKey: ['filter', id, user?.id],
    queryFn: fetchFilter,
    enabled: !!user && !!id
  })
  
  // Use React Query to fetch tasks
  const { data: allTasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['allTasks', user?.id],
    queryFn: fetchTasks,
    enabled: !!user
  })
  
  // Update local states when data is fetched
  useEffect(() => {
    if (allTasks) {
      setTasks(allTasks)
    }
    
    if (currentFilter) {
      setNewFilterName(currentFilter.name)
    }
  }, [allTasks, currentFilter])
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return
    
    const channel = supabase
      .channel('all-tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`,
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
  
  // Filter tasks based on conditions
  const filterTasks = (tasks: Task[], filter: any) => {
    if (!filter || !filter.conditions || filter.conditions.length === 0) return tasks

    return tasks.filter(task => {
      const results = filter.conditions.map((condition: any) => {
        if (condition.type === "due" && condition.value === "today" && task.dueDate) {
          const today = new Date()
          const taskDate = new Date(task.dueDate)
          return (
            taskDate.getDate() === today.getDate() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getFullYear() === today.getFullYear()
          )
        }
        
        if (condition.type === "due" && condition.value === "this_week" && task.dueDate) {
          const today = new Date()
          const taskDate = new Date(task.dueDate)
          const dayDiff = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          return dayDiff >= 0 && dayDiff <= 7
        }
        
        if (condition.type === "priority" && condition.value === "1") {
          return task.priority === 1
        }
        
        if (condition.type === "project") {
          return task.projectId === condition.value
        }
        
        return false
      })
      
      // Apply logic (AND/OR)
      if (filter.logic === "and") {
        return results.every(Boolean)
      } else {
        return results.some(Boolean)
      }
    })
  }

  const filteredTasks = currentFilter ? filterTasks(tasks, currentFilter).filter(task => !task.completed) : []

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

  const handleFilterFavoriteToggle = async () => {
    if (!currentFilter || isStandardFilter) {
      toast.error("Cannot modify standard filters")
      return
    }
    
    try {
      const newValue = !currentFilter.favorite
      
      const { error } = await supabase
        .from('filters')
        .update({ favorite: newValue })
        .eq('id', id)
        
      if (error) throw error
      
      toast.success(newValue ? "Added to favorites" : "Removed from favorites")
    } catch (error: any) {
      toast.error("Failed to update filter", {
        description: error.message
      })
    }
  }

  const handleFilterRename = async () => {
    if (!newFilterName.trim()) {
      toast.error("Filter name is required")
      return
    }
    
    if (isStandardFilter) {
      toast.error("Cannot modify standard filters")
      return
    }

    try {
      const { error } = await supabase
        .from('filters')
        .update({ name: newFilterName })
        .eq('id', id)
        
      if (error) throw error
      
      setIsEditFilterOpen(false)
      toast.success("Filter renamed successfully")
    } catch (error: any) {
      toast.error("Failed to rename filter", {
        description: error.message
      })
    }
  }

  const handleFilterDelete = async () => {
    if (isStandardFilter) {
      toast.error("Cannot delete standard filters")
      return
    }
    
    try {
      const { error } = await supabase
        .from('filters')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      
      setIsDeleteFilterOpen(false)
      toast.success("Filter deleted successfully")
      navigate('/') // Navigate to dashboard after deletion
    } catch (error: any) {
      toast.error("Failed to delete filter", {
        description: error.message
      })
    }
  }

  if (isLoadingFilter || isLoadingTasks) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AppLayout>
    )
  }

  if (!currentFilter) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-2xl font-bold mb-4">Filter not found</h1>
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight">{currentFilter.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleFilterFavoriteToggle}
              disabled={isStandardFilter}
            >
              <Star 
                className={
                  currentFilter.favorite
                    ? "h-5 w-5 fill-yellow-400 text-yellow-400"
                    : "h-5 w-5 text-muted-foreground"
                } 
              />
              <span className="sr-only">
                {currentFilter.favorite ? "Remove from favorites" : "Add to favorites"}
              </span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {!isStandardFilter && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setNewFilterName(currentFilter.name)
                    setIsEditFilterOpen(true)
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Rename Filter
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteFilterOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Filter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <TaskList
          title="Filtered Tasks"
          tasks={filteredTasks}
          emptyMessage="No tasks match this filter"
          onComplete={handleComplete}
          onDelete={handleDelete}
          onFavoriteToggle={handleFavoriteToggle}
        />

        {/* Dialogs */}
        <Dialog open={isEditFilterOpen} onOpenChange={setIsEditFilterOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Rename Filter</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="filter-name"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  placeholder="Enter filter name"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditFilterOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleFilterRename}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteFilterOpen} onOpenChange={setIsDeleteFilterOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this filter. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleFilterDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}
