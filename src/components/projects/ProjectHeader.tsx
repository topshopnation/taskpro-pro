
import { Star, Plus, MoreHorizontal, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProjectHeaderProps {
  projectName: string
  isFavorite: boolean
  onFavoriteToggle: () => void
  onCreateTask: () => void
  onCreateSection: () => void
  onEditProject: () => void
  onDeleteProject: () => void
}

export function ProjectHeader({
  projectName,
  isFavorite,
  onFavoriteToggle,
  onCreateTask,
  onCreateSection,
  onEditProject,
  onDeleteProject
}: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold tracking-tight">{projectName}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onFavoriteToggle}
        >
          <Star 
            className={
              isFavorite
                ? "h-5 w-5 fill-yellow-400 text-yellow-400"
                : "h-5 w-5 text-muted-foreground"
            } 
          />
          <span className="sr-only">
            {isFavorite ? "Remove from favorites" : "Add to favorites"}
          </span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          onClick={onCreateTask} 
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
            <DropdownMenuItem onClick={onCreateSection}>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEditProject}>
              <Edit className="mr-2 h-4 w-4" />
              Rename Project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onDeleteProject}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
