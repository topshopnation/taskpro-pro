
import { ListTodo, Plus, ChevronRight, Loader2 } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
  const location = useLocation();
  const navigate = useNavigate();
  
  // Filter out any "inbox" project that may be listed
  const filteredProjects = projects.filter(project => project.id !== "inbox");
  
  // Only show the top 5 projects in the sidebar, the rest are in the projects page
  const topProjects = filteredProjects.slice(0, 5);
  const hasMoreProjects = filteredProjects.length > 5;

  const handleProjectClick = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    // Use slugified name in URL
    const slugName = project.name.toLowerCase().replace(/\s+/g, '-');
    console.log("Navigating to project:", project.id, slugName);
    navigate(`/projects/${project.id}/${slugName}`);
    onMobileMenuClose();
  };

  const isProjectsPageActive = location.pathname === '/projects';

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between mb-2">
        <SidebarMenuButton asChild>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center rounded-md text-sm transition-colors ${
                isActive || isProjectsPageActive ? "text-primary font-medium" : "text-sidebar-foreground"
              }`
            }
            onClick={onMobileMenuClose}
          >
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
          </NavLink>
        </SidebarMenuButton>
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
                // Determine if this project is active based on the current path
                const isActive = location.pathname.includes(`/projects/${project.id}`);
                
                return (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <button
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
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
    </SidebarGroup>
  );
}
