
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { useProject } from "@/hooks/useProject"
import { useProjectTasks } from "@/hooks/useProjectTasks"
import { ProjectHeader } from "@/components/projects/ProjectHeader"
import { ProjectDialogs } from "@/components/projects/ProjectDialogs"
import { ProjectLoadingState } from "@/components/projects/ProjectLoadingState"
import { ProjectSections } from "@/components/projects/ProjectSections"
import { Button } from "@/components/ui/button"
import { ArrowDownAZ, ArrowUpZA, Layers } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { Task } from "@/components/tasks/TaskItem"

export default function ProjectView() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false)
  const [newSectionName, setNewSectionName] = useState("")
  const [sortBy, setSortBy] = useState<string>("title")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [groupBy, setGroupBy] = useState<string | null>("section") // Default to section grouping

  // Use custom hooks for project data and tasks
  const {
    id,
    currentProject,
    isLoadingProject,
    isEditProjectOpen,
    setIsEditProjectOpen,
    isDeleteProjectOpen,
    setIsDeleteProjectOpen,
    newProjectName,
    setNewProjectName,
    handleProjectFavoriteToggle,
    handleProjectRename,
    handleProjectDelete
  } = useProject()

  const {
    isLoadingTasks,
    unsectionedTasks,
    sections,
    getSectionTasks,
    handleComplete,
    handleDelete,
    handleFavoriteToggle
  } = useProjectTasks(id)

  const isLoading = isLoadingProject || isLoadingTasks

  // Sort tasks function
  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
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
      }
      return 0
    })
  }

  // Sort sections tasks
  const sortedUnsectionedTasks = sortTasks(unsectionedTasks)
  
  // Apply sorting to section tasks
  const getSortedSectionTasks = (sectionName: string) => {
    const sectionTasks = getSectionTasks(sectionName)
    return sortTasks(sectionTasks)
  }

  return (
    <AppLayout>
      <ProjectLoadingState 
        isLoading={isLoading} 
        projectExists={!!currentProject} 
      />
      
      {!isLoading && currentProject && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <ProjectHeader 
              projectName={currentProject.name}
              isFavorite={currentProject.favorite}
              onFavoriteToggle={handleProjectFavoriteToggle}
              onCreateTask={() => setIsCreateTaskOpen(true)}
              onCreateSection={() => setIsCreateSectionOpen(true)}
              onEditProject={() => {
                setNewProjectName(currentProject.name)
                setIsEditProjectOpen(true)
              }}
              onDeleteProject={() => setIsDeleteProjectOpen(true)}
            />
            <div className="flex items-center space-x-2">
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
                  <DropdownMenuItem onClick={() => setGroupBy("section")}>
                    Group by Section
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setGroupBy("title")}>
                    Group by Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setGroupBy("dueDate")}>
                    Group by Due Date
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <ProjectSections 
            unsectionedTasks={sortedUnsectionedTasks}
            sections={sections}
            getSectionTasks={getSortedSectionTasks}
            handleComplete={handleComplete}
            handleDelete={handleDelete}
            handleFavoriteToggle={handleFavoriteToggle}
          />

          <ProjectDialogs 
            projectId={id}
            isCreateTaskOpen={isCreateTaskOpen}
            setIsCreateTaskOpen={setIsCreateTaskOpen}
            isEditProjectOpen={isEditProjectOpen}
            setIsEditProjectOpen={setIsEditProjectOpen}
            isDeleteProjectOpen={isDeleteProjectOpen}
            setIsDeleteProjectOpen={setIsDeleteProjectOpen}
            isCreateSectionOpen={isCreateSectionOpen}
            setIsCreateSectionOpen={setIsCreateSectionOpen}
            newSectionName={newSectionName}
            setNewSectionName={setNewSectionName}
            newProjectName={newProjectName}
            setNewProjectName={setNewProjectName}
            handleProjectRename={handleProjectRename}
            handleProjectDelete={handleProjectDelete}
          />
        </div>
      )}
    </AppLayout>
  )
}
