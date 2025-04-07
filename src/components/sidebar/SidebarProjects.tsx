
import { ListTodo, Plus, ChevronRight, Loader2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface Project {
  id: string;
  name: string;
  favorite: boolean;
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
  return (
    <SidebarGroup>
      <div className="flex items-center justify-between mb-2">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
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
          ) : projects.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No projects found
            </div>
          ) : (
            projects.map((project) => (
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
                    <ListTodo className="h-4 w-4" />
                    <span>{project.name}</span>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
