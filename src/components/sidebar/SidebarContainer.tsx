
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { 
  Sidebar,
  SidebarContent as SidebarContentUI,
} from "@/components/ui/sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { SidebarContentComponent } from "./SidebarContent";

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

  return (
    <>
      <Sidebar className="hidden md:block border-r">
        <SidebarContentUI>
          <SidebarContentComponent
            projects={projects}
            filters={filters}
            favoriteItems={favoriteItems}
            isLoadingProjects={isLoadingProjects}
            isLoadingFilters={isLoadingFilters}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </SidebarContentUI>
      </Sidebar>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SidebarContentComponent
            projects={projects}
            filters={filters}
            favoriteItems={favoriteItems}
            isLoadingProjects={isLoadingProjects}
            isLoadingFilters={isLoadingFilters}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
