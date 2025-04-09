
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import AppSidebarContainer from "@/components/sidebar/SidebarContainer";

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

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (error) throw error;

        setProjects(data || []);
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setIsLoadingProjects(false);
      }
    };

    const fetchFilters = async () => {
      try {
        setIsLoadingFilters(true);
        const { data, error } = await supabase
          .from('filters')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (error) throw error;

        // Map the database filters to the FilterItem format, ensuring favorite is included
        const mappedFilters: FilterItem[] = (data || []).map(filter => ({
          id: filter.id,
          name: filter.name,
          favorite: filter.favorite || false,
        }));

        setFilters(mappedFilters);
      } catch (error: any) {
        console.error('Error fetching filters:', error);
        toast.error('Failed to load filters');
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchProjects();
    fetchFilters();

    // Set up real-time listeners
    const projectsSubscription = supabase
      .channel('projects-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${user.id}` },
        () => fetchProjects()
      )
      .subscribe();

    const filtersSubscription = supabase
      .channel('filters-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'filters', filter: `user_id=eq.${user.id}` },
        () => fetchFilters()
      )
      .subscribe();

    return () => {
      projectsSubscription.unsubscribe();
      filtersSubscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    // Create the favorites list from projects and filters
    const favProjects = projects
      .filter(project => project.favorite)
      .map(project => ({
        ...project,
        type: 'project' as const
      }));

    const favFilters = filters
      .filter(filter => filter.favorite)
      .map(filter => ({
        ...filter,
        type: 'filter' as const
      }));

    setFavoriteItems([...favProjects, ...favFilters]);
  }, [projects, filters]);

  return (
    <AppSidebarContainer 
      isMobileMenuOpen={isMobileMenuOpen} 
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      projects={projects}
      filters={filters}
      favoriteItems={favoriteItems}
      isLoadingProjects={isLoadingProjects}
      isLoadingFilters={isLoadingFilters}
    />
  );
}
