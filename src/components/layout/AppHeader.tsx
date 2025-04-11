
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/sidebar/SidebarContent";
import { useState, useEffect } from "react";
import { TaskProLogo } from "@/components/ui/taskpro-logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const isMobile = useIsMobile();

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.substring(0, 2).toUpperCase() || "U";

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
        
        // Update favorites
        const favProjects = (data || [])
          .filter(project => project.favorite)
          .map(project => ({
            ...project,
            type: 'project'
          }));
        
        const favFilters = filters
          .filter(filter => filter.favorite)
          .map(filter => ({
            ...filter,
            type: 'filter'
          }));
        
        setFavoriteItems([...favProjects, ...favFilters]);
      } catch (error) {
        console.error('Error fetching projects:', error);
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

        setFilters(data || []);
        
        // Update favorites
        const favProjects = projects
          .filter(project => project.favorite)
          .map(project => ({
            ...project,
            type: 'project'
          }));
        
        const favFilters = (data || [])
          .filter(filter => filter.favorite)
          .map(filter => ({
            ...filter,
            type: 'filter'
          }));
        
        setFavoriteItems([...favProjects, ...favFilters]);
      } catch (error) {
        console.error('Error fetching filters:', error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchProjects();
    fetchFilters();
  }, [user]);

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 w-full items-center justify-between border-b bg-background px-3 md:px-6 shadow-sm">
      <div className="flex items-center gap-1 md:gap-2">
        {isMobile && (
          <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 md:h-10 md:w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SidebarContent 
                onMobileMenuClose={() => setShowSidebar(false)}
                projects={projects}
                filters={filters}
                favoriteItems={favoriteItems}
                isLoadingProjects={isLoadingProjects}
                isLoadingFilters={isLoadingFilters}
              />
            </SheetContent>
          </Sheet>
        )}
        <TaskProLogo size="small" withText className="ml-1" />
      </div>
      <div className="flex items-center">
        <Avatar 
          className="cursor-pointer h-9 w-9 md:h-10 md:w-10"
          onClick={() => navigate("/settings")} 
        >
          <AvatarImage src={user?.avatarUrl || ""} />
          <AvatarFallback className="bg-primary text-primary-foreground flex items-center justify-center text-sm">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
