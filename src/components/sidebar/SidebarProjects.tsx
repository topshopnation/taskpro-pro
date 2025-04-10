
import { ListTodo, Plus, ChevronRight, Loader2 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
  // Filter out any "inbox" project that may be listed
  const filteredProjects = projects.filter(project => project.id !== "inbox");
  
  // Only show the top 5 projects in the sidebar, the rest are in the projects page
  const topProjects = filteredProjects.slice(0, 5);
  const hasMoreProjects = filteredProjects.length > 5;

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between mb-2">
        <SidebarMenuButton asChild>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center rounded-md text-sm transition-colors ${
                isActive ? "text-primary font-medium" : "text-sidebar-foreground"
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
              {topProjects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={`/projects/${project.id}`}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                      onClick={onMobileMenuClose}
                    >
                      <ListTodo 
                        className="h-4 w-4" 
                        style={project.color ? { color: project.color } : undefined}
                      />
                      <span className="truncate">{project.name}</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {hasMoreProjects && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/projects"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-muted-foreground hover:text-sidebar-accent-foreground"
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
