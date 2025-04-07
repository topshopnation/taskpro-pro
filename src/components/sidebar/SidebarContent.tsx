
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { CreateFilterDialog } from "@/components/filters/CreateFilterDialog";
import { SidebarFavorites } from "./SidebarFavorites";
import { SidebarNavigation } from "./SidebarNavigation";
import { SidebarProjects } from "./SidebarProjects";
import { SidebarFilters } from "./SidebarFilters";
import { SidebarSettings } from "./SidebarSettings";
import { Filter, ListTodo } from "lucide-react";

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
  projects: Project[];
  filters: FilterItem[];
  favoriteItems: FavoriteItem[];
  isLoadingProjects: boolean;
  isLoadingFilters: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function SidebarContentComponent({
  projects,
  filters,
  favoriteItems,
  isLoadingProjects,
  isLoadingFilters,
  setMobileMenuOpen
}: SidebarContentProps) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateFilterOpen, setIsCreateFilterOpen] = useState(false);

  const handleMobileMenuClose = () => setMobileMenuOpen(false);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <SidebarFavorites 
          favoriteItems={favoriteItems} 
          onMobileMenuClose={handleMobileMenuClose} 
        />

        <SidebarNavigation 
          onMobileMenuClose={handleMobileMenuClose} 
        />

        <SidebarProjects 
          projects={projects}
          isLoadingProjects={isLoadingProjects}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          onMobileMenuClose={handleMobileMenuClose}
        />

        <SidebarFilters 
          filters={filters}
          isLoadingFilters={isLoadingFilters}
          onOpenCreateFilter={() => setIsCreateFilterOpen(true)}
          onMobileMenuClose={handleMobileMenuClose}
        />

        <SidebarSettings 
          onMobileMenuClose={handleMobileMenuClose} 
        />
      </div>
      
      <CreateProjectDialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
      <CreateFilterDialog open={isCreateFilterOpen} onOpenChange={setIsCreateFilterOpen} />
    </ScrollArea>
  );
}
