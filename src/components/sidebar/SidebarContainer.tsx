
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SidebarContent } from "@/components/sidebar/SidebarContent";

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

interface FavoriteItem {
  id: string;
  name: string;
  type: 'project' | 'filter';
  color?: string;
}

interface SidebarContainerProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  projects?: Project[];
  filters?: FilterItem[];
  favoriteItems?: FavoriteItem[];
  isLoadingProjects?: boolean;
  isLoadingFilters?: boolean;
  className?: string; // Added this line to fix the TypeScript error
}

const AppSidebarContainer = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  projects = [],
  filters = [],
  favoriteItems = [],
  isLoadingProjects = false,
  isLoadingFilters = false,
  className
}: SidebarContainerProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex h-full flex-col">
            <div className="h-full p-4 pt-0">
              <SidebarContent 
                onMobileMenuClose={() => setIsMobileMenuOpen(false)}
                projects={projects}
                filters={filters}
                favoriteItems={favoriteItems}
                isLoadingProjects={isLoadingProjects}
                isLoadingFilters={isLoadingFilters}
              />
            </div>
            <div className="p-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Close Menu
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={`hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:block ${className}`}>
        <div className="flex h-full flex-col">
          <div className="p-4">
            <SidebarContent 
              projects={projects}
              filters={filters}
              favoriteItems={favoriteItems}
              isLoadingProjects={isLoadingProjects}
              isLoadingFilters={isLoadingFilters}
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebarContainer;
