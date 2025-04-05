
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AppLayout from "@/components/layout/AppLayout"
import { TaskList } from "@/components/tasks/TaskList"
import { Task } from "@/components/tasks/TaskItem"
import { Plus, MoreHorizontal, Star, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"

export default function ProjectView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false)
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false)
  const [newSectionName, setNewSectionName] = useState("")
  const [newProjectName, setNewProjectName] = useState("")
  const [sections, setSections] = useState<{id: string, name: string}[]>([])
  const { user } = useAuth()

  // Fetch project data
  const fetchProject = async () => {
    if (!user || !id) return null
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
        
      if (error) throw error
      
      return {
        id: data.id,
        name: data.name,
        favorite: data.favorite || false
      }
    } catch (error: any) {
      toast.error("Failed to fetch project", {
        description: error.message
      })
      navigate('/')
      return null
    }
  }
  
  // Fetch project tasks
  const fetchTasks = async () => {
    if (!user || !id) return []
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
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
  
  // Use React Query to fetch project
  const { data: currentProject, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', id, user?.id],
    queryFn: fetchProject,
    enabled: !!user && !!id
  })
  
  // Use React Query to fetch tasks
  const { data: projectTasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['projectTasks', id, user?.id],
    queryFn: fetchTasks,
    enabled: !!user && !!id
  })
  
  // Update local states when data is fetched
  useEffect(() => {
    if (projectTasks) {
      setTasks(projectTasks)
    }
    
    if (currentProject) {
      setNewProjectName(currentProject.name)
    }
  }, [projectTasks, currentProject])
  
  // Generate sections from tasks
  useEffect(() => {
    if (tasks.length > 0) {
      const uniqueSections = Array.from(
        new Set(tasks.filter(task => task.section).map(task => task.section))
      ).map(sectionId => {
        // Use section name from task or default to section ID
        // In a real app, you'd want to store section names in the database
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
    if (!user || !id) return
    
    const channel = supabase
      .channel('project-tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${id}`
      }, async () => {
        // Refetch tasks when changes occur
        const updatedTasks = await fetchTasks()
        setTasks(updatedTasks)
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, id])
  
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

  const handleProjectFavoriteToggle = async () => {
    if (!currentProject) return
    
    try {
      const newValue = !currentProject.favorite
      
      const { error } = await supabase
        .from('projects')
        .update({ favorite: newValue })
        .eq('id', id)
        
      if (error) throw error
      
      toast.success(newValue ? "Added to favorites" : "Removed from favorites")
    } catch (error: any) {
      toast.error("Failed to update project", {
        description: error.message
      })
    }
  }

  const handleProjectRename = async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required")
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: newProjectName })
        .eq('id', id)
        
      if (error) throw error
      
      setIsEditProjectOpen(false)
      toast.success("Project renamed successfully")
    } catch (error: any) {
      toast.error("Failed to rename project", {
        description: error.message
      })
    }
  }

  const handleProjectDelete = async () => {
    try {
      // Delete all tasks in this project first
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', id)
        
      if (tasksError) throw tasksError
      
      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      
      setIsDeleteProjectOpen(false)
      toast.success("Project deleted successfully")
      navigate('/') // Navigate to dashboard after deletion
    } catch (error: any) {
      toast.error("Failed to delete project", {
        description: error.message
      })
    }
  }

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      toast.error("Section name is required")
      return
    }

    // Create a section ID from the name (lowercase, no spaces)
    const sectionId = newSectionName.toLowerCase().replace(/\s+/g, '')
    
    // In a real app, you would create a sections table in the database
    // For now, we'll just add a task with the new section to establish it
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: `${newSectionName} section created`,
          user_id: user?.id,
          project_id: id,
          section: sectionId
        })
        
      if (error) throw error
      
      setIsCreateSectionOpen(false)
      setNewSectionName("")
      toast.success("Section created successfully")
    } catch (error: any) {
      toast.error("Failed to create section", {
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

  if (isLoadingProject || isLoadingTasks) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AppLayout>
    )
  }

  if (!currentProject) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
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
              title={sections.length > 0 ? "Unsectioned Tasks" : "Tasks"}
              tasks={unsectionedTasks}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </div>
        )}

        {/* Sections */}
        {sections.map(section => (
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
        <CreateTaskDialog 
          open={isCreateTaskOpen} 
          onOpenChange={setIsCreateTaskOpen} 
          defaultProjectId={id}
        />

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
