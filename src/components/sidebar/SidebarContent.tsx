
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { CreateFilterDialog } from "@/components/filters/CreateFilterDialog";
import { SidebarFavorites } from "./SidebarFavorites";
import { SidebarNavigation } from "./SidebarNavigation";
import { SidebarProjects } from "./SidebarProjects";
import { SidebarFilters } from "./SidebarFilters";
import { SidebarSettings } from "./SidebarSettings";

interface FavoriteItem {
  id: string;
  name: string;
  type: 'project' | 'filter';
}

interface Project {
  id: string;
  name: string;
  favorite: boolean;
}

interface FilterItem {
  id: string;
  name: string;
  favorite: boolean;
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
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateFilterOpen, setIsCreateFilterOpen] = useState(false);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <SidebarNavigation 
          onMobileMenuClose={onMobileMenuClose} 
        />

        {/* Favorites section moved above Projects as requested */}
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

        <SidebarSettings 
          onMobileMenuClose={onMobileMenuClose} 
        />
      </div>
      
      <CreateProjectDialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
      <CreateFilterDialog open={isCreateFilterOpen} onOpenChange={setIsCreateFilterOpen} />
    </ScrollArea>
  );
}
