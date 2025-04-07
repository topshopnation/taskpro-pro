import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  Home, 
  CheckSquare, 
  ListTodo, 
  Filter, 
  Star, 
  Settings, 
  Plus, 
  ChevronRight,
  Loader2,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { CreateFilterDialog } from "@/components/filters/CreateFilterDialog";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

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

interface DatabaseFilter {
  id: string;
  name: string;
  user_id: string;
  conditions: Json;
  created_at: string;
  updated_at: string;
  favorite?: boolean;
}

interface FavoriteItem extends Project {
  type: 'project' | 'filter';
}

interface AppSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function AppSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: AppSidebarProps) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateFilterOpen, setIsCreateFilterOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<FilterItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return;
    
    setIsLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('favorite', { ascending: false })
        .order('name');
      
      if (error) throw error;
      
      setProjects(data || []);
      
      const favoriteProjects = (data || [])
        .filter(project => project.favorite)
        .map(project => ({ ...project, type: 'project' as const }));
      
      updateFavorites(favoriteProjects, 'project');
    } catch (error: any) {
      toast.error(`Error loading projects: ${error.message}`);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchFilters = async () => {
    if (!user) return;
    
    setIsLoadingFilters(true);
    try {
      const { data, error } = await supabase
        .from('filters')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const standardFilters: FilterItem[] = [
        { id: 'today', name: 'Today', favorite: true },
        { id: 'upcoming', name: 'Upcoming', favorite: false },
        { id: 'priority1', name: 'Priority 1', favorite: false }
      ];
      
      const dbFilters: FilterItem[] = (data || []).map((filter: DatabaseFilter) => ({
        id: filter.id,
        name: filter.name,
        favorite: filter.favorite ?? false
      }));
      
      setFilters([...standardFilters, ...dbFilters]);
      
      const favoriteFilters = [...standardFilters, ...dbFilters]
        .filter(filter => filter.favorite)
        .map(filter => ({ ...filter, type: 'filter' as const }));
      
      updateFavorites(favoriteFilters, 'filter');
    } catch (error: any) {
      toast.error(`Error loading filters: ${error.message}`);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  const updateFavorites = (items: FavoriteItem[], type: 'project' | 'filter') => {
    setFavoriteItems(prev => {
      const filtered = prev.filter(item => item.type !== type);
      return [...filtered, ...items];
    });
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchFilters();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const projectsChannel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${user.id}` },
        () => fetchProjects()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(projectsChannel);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const filtersChannel = supabase
      .channel('filters-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'filters', filter: `user_id=eq.${user.id}` },
        () => fetchFilters()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(filtersChannel);
    };
  }, [user]);

  const SidebarContent = () => (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel>Favorites</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {favoriteItems.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No favorites yet
                </div>
              ) : (
                favoriteItems.map((item) => (
                  <SidebarMenuItem key={`fav-${item.id}-${item.type}`}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.type === "project" ? `/projects/${item.id}` : `/filters/${item.id}`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                            isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.type === "project" ? (
                          <ListTodo className="h-4 w-4" />
                        ) : (
                          <Filter className="h-4 w-4" />
                        )}
                        <span>{item.name}</span>
                        <Star className="h-3 w-3 ml-auto text-yellow-400 fill-yellow-400" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/inbox"
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Inbox className="h-4 w-4" />
                    <span>Inbox</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/completed"
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>Completed</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between mb-2">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setIsCreateProjectOpen(true)}
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
                        onClick={() => setIsMobileMenuOpen(false)}
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

        <SidebarGroup>
          <div className="flex items-center justify-between mb-2">
            <SidebarGroupLabel>Filters</SidebarGroupLabel>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setIsCreateFilterOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Filter</span>
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoadingFilters ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : filters.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No filters found
                </div>
              ) : (
                filters.map((filter) => (
                  <SidebarMenuItem key={filter.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/filters/${filter.id}`}
                        className={({ isActive }) =>
                          `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                            isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Filter className="h-4 w-4" />
                        <span>{filter.name}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
      
      <CreateProjectDialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
      <CreateFilterDialog open={isCreateFilterOpen} onOpenChange={setIsCreateFilterOpen} />
    </ScrollArea>
  );

  return (
    <>
      <Sidebar className="hidden md:block border-r">
        <SidebarContent />
      </Sidebar>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
