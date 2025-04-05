
import { useState } from "react"
import { useParams } from "react-router-dom"
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

// Mock data - replace with real data from Supabase
const mockFilters = [
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

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Finish project proposal",
    notes: "Include all the requirements and budget estimation",
    dueDate: new Date(),
    priority: 1,
    projectId: "work",
    section: "todo",
    completed: false,
    favorite: true
  },
  {
    id: "2",
    title: "Schedule team meeting",
    dueDate: new Date(),
    priority: 2,
    projectId: "work",
    section: "todo",
    completed: false,
    favorite: false
  },
  {
    id: "3",
    title: "Research API documentation",
    dueDate: new Date("2025-04-09"),
    priority: 3,
    projectId: "work",
    section: "inprogress",
    completed: false,
    favorite: false
  },
  {
    id: "4",
    title: "Buy groceries",
    dueDate: new Date("2025-04-06"),
    priority: 3,
    projectId: "personal",
    completed: false,
    favorite: false
  }
]

export default function FilterView() {
  const { id } = useParams()
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [isEditFilterOpen, setIsEditFilterOpen] = useState(false)
  const [isDeleteFilterOpen, setIsDeleteFilterOpen] = useState(false)
  const [newFilterName, setNewFilterName] = useState("")

  // Find current filter
  const currentFilter = mockFilters.find(filter => filter.id === id) || 
    { id: "unknown", name: "Unknown Filter", conditions: [], logic: "and", favorite: false }
  
  // Filter tasks based on conditions
  const filterTasks = (tasks: Task[], filter: typeof currentFilter) => {
    if (filter.conditions.length === 0) return tasks

    return tasks.filter(task => {
      const results = filter.conditions.map(condition => {
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

  const filteredTasks = filterTasks(tasks, currentFilter).filter(task => !task.completed)

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

  const handleFilterFavoriteToggle = () => {
    // TODO: Update filter in Supabase database
    toast.success(currentFilter.favorite ? "Removed from favorites" : "Added to favorites")
  }

  const handleFilterRename = () => {
    if (!newFilterName.trim()) {
      toast.error("Filter name is required")
      return
    }

    // TODO: Update filter in Supabase database
    setIsEditFilterOpen(false)
    toast.success("Filter renamed successfully")
  }

  const handleFilterDelete = () => {
    // TODO: Delete filter from Supabase database
    setIsDeleteFilterOpen(false)
    toast.success("Filter deleted successfully")
    // Navigate to dashboard after deletion
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
