
import { FolderIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useTaskProjects } from "@/components/tasks/useTaskProjects"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { queryClient } from "@/lib/react-query"
import { useAuth } from "@/hooks/use-auth"

interface TaskItemProjectProps {
  taskId: string
  projectId?: string
  isUpdating: boolean
  onProjectChange: (projectId: string | null) => Promise<void>
}

export function TaskItemProject({ 
  taskId, 
  projectId, 
  isUpdating,
  onProjectChange
}: TaskItemProjectProps) {
  const [open, setOpen] = useState(false)
  const [isChangingProject, setIsChangingProject] = useState(false)
  const { projects, isLoading } = useTaskProjects()
  const { user } = useAuth()
  
  const currentProject = projects?.find(p => p.id === projectId)
  
  // Helper function to invalidate all relevant queries after successful database updates
  const invalidateAllTaskQueries = async () => {
    const queryKeysToInvalidate = [
      ['tasks'],
      ['today-tasks'],
      ['overdue-tasks'],
      ['inbox-tasks'],
      ['project-tasks', projectId],
      ['project-tasks', null],
      ['search-tasks'],
      ['completedTasks']
    ];

    // Invalidate all filtered-tasks queries
    if (user?.id) {
      const queryCache = queryClient.getQueryCache();
      const allQueries = queryCache.getAll();
      
      allQueries.forEach((query) => {
        const queryKey = query.queryKey;
        if (Array.isArray(queryKey) && queryKey[0] === 'filtered-tasks') {
          queryClient.invalidateQueries({ queryKey });
        }
      });
    }

    // Invalidate all relevant queries
    await Promise.all(queryKeysToInvalidate.map(queryKey => 
      queryClient.invalidateQueries({ queryKey })
    ));
  };
  
  const handleProjectSelect = async (selectedProjectId: string | null) => {
    try {
      setIsChangingProject(true)
      
      // Update database FIRST
      const { error } = await supabase
        .from('tasks')
        .update({ project_id: selectedProjectId })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // THEN invalidate queries to force refetch with fresh data
      await invalidateAllTaskQueries();
      
      // Call the parent handler
      await onProjectChange(selectedProjectId)
      
      toast.success(selectedProjectId ? "Task moved to project" : "Task moved to inbox", {
        duration: 2000
      });
      
      setOpen(false)
    } catch (error) {
      console.error("Failed to change project:", error)
      toast.error("Failed to change project");
    } finally {
      setIsChangingProject(false)
    }
  }
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-7 w-7",
                currentProject?.color ? "text-foreground" : "text-muted-foreground"
              )}
              disabled={isUpdating || isChangingProject}
            >
              {isChangingProject ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FolderIcon 
                  className="h-4 w-4" 
                  style={currentProject?.color ? { color: currentProject.color } : undefined}
                />
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {projectId ? `Project: ${currentProject?.name || ""}` : "Set project"}
        </TooltipContent>
      </Tooltip>
      
      <PopoverContent align="end" className="p-2 w-48">
        <div className="space-y-1">
          <div className="text-xs font-medium mb-1 px-2 pt-1">Project</div>
          
          {isLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <>
              <Button 
                variant={!projectId ? "default" : "ghost"} 
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleProjectSelect(null)}
              >
                Inbox
              </Button>
              
              {projects?.map((project) => (
                <Button 
                  key={project.id}
                  variant={projectId === project.id ? "default" : "ghost"} 
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => handleProjectSelect(project.id)}
                >
                  <div className="flex items-center gap-2">
                    <FolderIcon 
                      className="h-3 w-3"
                      style={project.color ? { color: project.color } : undefined}
                    />
                    <span className="truncate">{project.name}</span>
                  </div>
                </Button>
              ))}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
