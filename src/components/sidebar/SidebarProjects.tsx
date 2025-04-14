import { ListTodo, Plus, ChevronRight, Star, StarOff, Loader2, ChevronDown } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

interface Project {
  id: string;
  name: string;
  favorite: boolean;
  color?: string;
}

interface SidebarProjectsProps {
  projects: Project[];
  isLoadingProjects: boolean;
  onOpenCreateProject: () => void;
  onMobileMenuClose: () => void;
}

export function SidebarProjects({
  projects,
  isLoadingProjects,
  onOpenCreateProject,
  onMobileMenuClose
}: SidebarProjectsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleProjectClick = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    const slugName = project.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/projects/${project.id}/${slugName}`);
    onMobileMenuClose();
  };

  const handleFavoriteToggle = async (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    try {
      const newValue = !project.favorite;
      
      const { error } = await supabase
        .from('projects')
        .update({ favorite: newValue })
        .eq('id', project.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success(newValue ? "Added to favorites" : "Removed from favorites");
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const filteredProjects = projects.filter(project => project.id !== "inbox");
  
  const topProjects = filteredProjects.slice(0, 5);
  const hasMoreProjects = filteredProjects.length > 5;

  const isProjectsPageActive = location.pathname === '/projects';

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between mb-2">
        <CollapsibleTrigger asChild onClick={() => setIsOpen(!isOpen)}>
          <SidebarMenuButton asChild>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md text-sm transition-colors",
                  isActive ? "text-primary font-medium" : "text-sidebar-foreground"
                )
              }
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(!isOpen);
              }}
            >
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", !isOpen && "-rotate-90")} />
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
            </NavLink>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5"
          onClick={onOpenCreateProject}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add Project</span>
        </Button>
      </div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoadingProjects ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : topProjects.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No projects found
                </div>
              ) : (
                <>
                  {topProjects.map((project) => {
                    const isActive = location.pathname.includes(`/projects/${project.id}`);
                    
                    return (
                      <SidebarMenuItem key={project.id} className="group">
                        <SidebarMenuButton asChild>
                          <button
                            className={cn(
                              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_2px_5px_rgba(0,0,0,0.08)]" 
                                : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            )}
                            onClick={(e) => handleProjectClick(project, e)}
                          >
                            <ListTodo 
                              className="h-4 w-4" 
                              style={project.color ? { color: project.color } : undefined}
                            />
                            <span className="truncate">{project.name}</span>
                            <ChevronRight className="h-4 w-4 ml-auto" />
                            <button
                              onClick={(e) => handleFavoriteToggle(project, e)}
                              className="absolute right-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              title={project.favorite ? "Remove from favorites" : "Add to favorites"}
                            >
                              <div className="group/star">
                                <div className="block group-hover/star:hidden">
                                  {project.favorite ? (
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                  ) : (
                                    <StarOff className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                  )}
                                </div>
                                <div className="hidden group-hover/star:block">
                                  {project.favorite ? (
                                    <StarOff className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                  ) : (
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                  )}
                                </div>
                              </div>
                            </button>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                  
                  {hasMoreProjects && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to="/projects"
                          className={({ isActive }) => cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                            isActive || isProjectsPageActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_2px_5px_rgba(0,0,0,0.08)]"
                              : "text-muted-foreground hover:text-sidebar-accent-foreground"
                          )}
                          onClick={onMobileMenuClose}
                        >
                          <span className="truncate">View all projects...</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
