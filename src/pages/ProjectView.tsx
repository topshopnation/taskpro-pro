
import { useState } from "react"
import { useParams } from "react-router-dom"
import AppLayout from "@/components/layout/AppLayout"
import { TaskList } from "@/components/tasks/TaskList"
import { Task } from "@/components/tasks/TaskItem"
import { Plus, MoreHorizontal, Star, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
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
  DialogDescription,
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
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { toast } from "sonner"

// Mock data - replace with real data from Supabase
const mockProjects = [
  { id: "inbox", name: "Inbox", favorite: false },
  { id: "work", name: "Work", favorite: true },
  { id: "personal", name: "Personal", favorite: false },
]

const mockSections = [
  { id: "todo", projectId: "work", name: "To Do" },
  { id: "inprogress", projectId: "work", name: "In Progress" },
  { id: "done", projectId: "work", name: "Done" },
]

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
    title: "Schedule team meeting",
    dueDate: new Date("2025-04-08"),
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
    title: "Check client feedback",
    priority: 4,
    projectId: "work",
    section: "done",
    completed: true,
    favorite: false
  }
]

export default function ProjectView() {
  const { id } = useParams()
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false)
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false)
  const [newSectionName, setNewSectionName] = useState("")
  const [newProjectName, setNewProjectName] = useState("")

  // Find current project
  const currentProject = mockProjects.find(project => project.id === id) || { id: "inbox", name: "Inbox", favorite: false }
  
  // Get project sections
  const projectSections = mockSections.filter(section => section.projectId === id)
  
  // Get tasks for each section
  const getSectionTasks = (sectionId: string) => {
    return tasks.filter(task => task.projectId === id && task.section === sectionId && !task.completed)
  }
  
  // Get tasks without sections
  const unsectionedTasks = tasks.filter(task => task.projectId === id && !task.section && !task.completed)

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

  const handleProjectFavoriteToggle = () => {
    // TODO: Update project in Supabase database
    toast.success(currentProject.favorite ? "Removed from favorites" : "Added to favorites")
  }

  const handleProjectRename = () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required")
      return
    }

    // TODO: Update project in Supabase database
    setIsEditProjectOpen(false)
    toast.success("Project renamed successfully")
  }

  const handleProjectDelete = () => {
    // TODO: Delete project from Supabase database
    setIsDeleteProjectOpen(false)
    toast.success("Project deleted successfully")
    // Navigate to dashboard after deletion
  }

  const handleCreateSection = () => {
    if (!newSectionName.trim()) {
      toast.error("Section name is required")
      return
    }

    // TODO: Add section to Supabase database
    setIsCreateSectionOpen(false)
    setNewSectionName("")
    toast.success("Section created successfully")
  }

  const handleSectionChange = (taskId: string, sectionId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, section: sectionId } : task
      )
    )
    toast.success("Task moved to section")
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight">{currentProject.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleProjectFavoriteToggle}
            >
              <Star 
                className={
                  currentProject.favorite
                    ? "h-5 w-5 fill-yellow-400 text-yellow-400"
                    : "h-5 w-5 text-muted-foreground"
                } 
              />
              <span className="sr-only">
                {currentProject.favorite ? "Remove from favorites" : "Add to favorites"}
              </span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsCreateTaskOpen(true)} 
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsCreateSectionOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setNewProjectName(currentProject.name)
                  setIsEditProjectOpen(true)
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Rename Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsDeleteProjectOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Unsectioned tasks */}
        {unsectionedTasks.length > 0 && (
          <div className="mb-8">
            <TaskList
              title={projectSections.length > 0 ? "Unsectioned Tasks" : "Tasks"}
              tasks={unsectionedTasks}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </div>
        )}

        {/* Sections */}
        {projectSections.map(section => (
          <div key={section.id} className="mb-8">
            <TaskList
              title={section.name}
              tasks={getSectionTasks(section.id)}
              emptyMessage={`No tasks in ${section.name}`}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </div>
        ))}

        {/* Dialogs */}
        <CreateTaskDialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen} />

        <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Rename Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="project-name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleProjectRename}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateSectionOpen} onOpenChange={setIsCreateSectionOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="section-name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Enter section name"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateSectionOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSection}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteProjectOpen} onOpenChange={setIsDeleteProjectOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the project and all tasks within it. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleProjectDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}
