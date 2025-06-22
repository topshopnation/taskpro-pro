
import { Filter, Plus, Star, StarOff, Loader2, ChevronDown } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

interface FilterItem {
  id: string;
  name: string;
  favorite: boolean;
  color?: string;
}

interface SidebarFiltersProps {
  filters: FilterItem[];
  isLoadingFilters: boolean;
  onOpenCreateFilter: () => void;
  onMobileMenuClose: () => void;
}

export function SidebarFilters({
  filters,
  isLoadingFilters,
  onOpenCreateFilter,
  onMobileMenuClose
}: SidebarFiltersProps) {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleFilterClick = (filter: FilterItem, e: React.MouseEvent) => {
    e.preventDefault();
    const slugName = filter.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/filters/${filter.id}/${slugName}`);
    onMobileMenuClose();
  };

  const handleFavoriteToggle = async (filter: FilterItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    try {
      const newValue = !filter.favorite;
      
      const { error } = await supabase
        .from('filters')
        .update({ favorite: newValue })
        .eq('id', filter.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success(newValue ? "Added to favorites" : "Removed from favorites");
    } catch (error: any) {
      console.error('Error updating filter:', error);
      toast.error('Failed to update filter');
    }
  };

  const isFiltersPageActive = location.pathname === '/filters';
  
  const hasMoreFilters = filters.length > 5;

  return (
    <SidebarGroup>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between mb-2">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton asChild>
              <NavLink
                to="/filters"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md text-sm transition-colors",
                    isActive ? "text-primary font-medium" : "text-sidebar-foreground"
                  )
                }
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(!isOpen);
                }}
              >
                <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", !isOpen && "-rotate-90")} />
                <SidebarGroupLabel>Filters</SidebarGroupLabel>
              </NavLink>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5"
            onClick={onOpenCreateFilter}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add Filter</span>
          </Button>
        </div>
        <CollapsibleContent>
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
                <>
                  {filters.map((filter) => {
                    const slugName = filter.name.toLowerCase().replace(/\s+/g, '-');
                    const isActive = location.pathname.includes(`/filters/${filter.id}`);
                    
                    return (
                      <SidebarMenuItem key={filter.id} className="group">
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={`/filters/${filter.id}/${slugName}`}
                            className={({ isActive }) => cn(
                              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_2px_5px_rgba(0,0,0,0.08)]" 
                                : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            )}
                            onClick={onMobileMenuClose}
                          >
                            <Filter 
                              className="h-4 w-4" 
                              style={filter.color ? { color: filter.color } : undefined}
                            />
                            <span className="truncate">{filter.name}</span>
                            <button
                              onClick={(e) => handleFavoriteToggle(filter, e)}
                              className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              title={filter.favorite ? "Remove from favorites" : "Add to favorites"}
                            >
                              <div className="group/star">
                                <div className="block group-hover/star:hidden">
                                  {filter.favorite ? (
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                  ) : (
                                    <StarOff className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                  )}
                                </div>
                                <div className="hidden group-hover/star:block">
                                  {filter.favorite ? (
                                    <StarOff className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                  ) : (
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                  )}
                                </div>
                              </div>
                            </button>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                  
                  {hasMoreFilters && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to="/filters"
                          className={({ isActive }) => cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                            isActive || isFiltersPageActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_2px_5px_rgba(0,0,0,0.08)]"
                              : "text-muted-foreground hover:text-sidebar-accent-foreground"
                          )}
                          onClick={onMobileMenuClose}
                        >
                          <span className="truncate">View all filters...</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}
