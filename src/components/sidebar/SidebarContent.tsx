
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { CreateFilterDialog } from "@/components/filters/CreateFilterDialog";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { SidebarFavorites } from "./SidebarFavorites";
import { SidebarNavigation } from "./SidebarNavigation";
import { SidebarProjects } from "./SidebarProjects";
import { SidebarFilters } from "./SidebarFilters";
import { TaskProLogo } from "@/components/ui/taskpro-logo";

interface FavoriteItem {
  id: string;
  name: string;
  type: 'project' | 'filter';
  color?: string;
}

interface Project {
  id: string;
  name: string;
  favorite: boolean;
  color?: string;
}

interface FilterItem {
  id: string;
  name: string;
  favorite: boolean;
  color?: string;
}

interface SidebarContentProps {
  onMobileMenuClose?: () => void;
  projects?: Project[];
  filters?: FilterItem[];
  favoriteItems?: FavoriteItem[];
  isLoadingProjects?: boolean;
  isLoadingFilters?: boolean;
}

export function SidebarContent({
  projects = [],
  filters = [],
  favoriteItems = [],
  isLoadingProjects = false,
  isLoadingFilters = false,
  onMobileMenuClose = () => {},
}: SidebarContentProps) {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateFilterOpen, setIsCreateFilterOpen] = useState(false);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* TaskPro Logo at the top */}
        <div className="mb-4 hidden md:block">
          <TaskProLogo size="medium" className="mx-auto" />
        </div>
        
        {/* Add Task Button */}
        <div className="mb-4">
          <Button 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setIsCreateTaskOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>

        <SidebarNavigation 
          onMobileMenuClose={onMobileMenuClose} 
        />

        <SidebarFavorites 
          favoriteItems={favoriteItems} 
          onMobileMenuClose={onMobileMenuClose} 
        />

        <SidebarProjects 
          projects={projects}
          isLoadingProjects={isLoadingProjects}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onMobileMenuClose={onMobileMenuClose}
        />

        <SidebarFilters 
          filters={filters}
          isLoadingFilters={isLoadingFilters}
          onOpenCreateFilter={() => setIsCreateFilterOpen(true)}
          onMobileMenuClose={onMobileMenuClose}
        />
      </div>
      
      <CreateTaskDialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen} />
      <CreateProjectDialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
      <CreateFilterDialog open={isCreateFilterOpen} onOpenChange={setIsCreateFilterOpen} />
    </ScrollArea>
  );
}
