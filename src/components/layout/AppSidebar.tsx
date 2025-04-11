
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { SidebarContent } from "@/components/sidebar/SidebarContent";
import { Sidebar } from "@/components/ui/sidebar";

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

interface DatabaseFilter {
  id: string;
  name: string;
  user_id: string;
  conditions: Json;
  created_at: string;
  updated_at: string;
  favorite?: boolean;
  color?: string;
}

interface FavoriteItem {
  id: string;
  name: string;
  type: 'project' | 'filter';
  color?: string;
}

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
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

        // Map the database filters to the FilterItem format
        const mappedFilters: FilterItem[] = (data || []).map((filter: DatabaseFilter) => ({
          id: filter.id,
          name: filter.name,
          favorite: filter.favorite ?? false,
          color: filter.color
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

  // Debug navigation issues
  console.log('Current projects:', projects);
  console.log('Current filters:', filters);
  console.log('Current favorites:', favoriteItems);

  return (
    <Sidebar className={className}>
      <SidebarContent 
        projects={projects}
        filters={filters}
        favoriteItems={favoriteItems}
        isLoadingProjects={isLoadingProjects}
        isLoadingFilters={isLoadingFilters}
      />
    </Sidebar>
  );
}
