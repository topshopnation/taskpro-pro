
import { Filter, Plus, Loader2 } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
  const location = useLocation();
  const navigate = useNavigate();
  
  // Only show the top 5 filters in the sidebar, the rest are in the filters page
  const topFilters = filters.slice(0, 5);
  const hasMoreFilters = filters.length > 5;
  
  const handleFilterClick = (filter: FilterItem, e: React.MouseEvent) => {
    e.preventDefault();
    // Use slugified name in URL
    const slugName = filter.name.toLowerCase().replace(/\s+/g, '-');
    console.log("Navigating to filter:", filter.id, slugName);
    navigate(`/filters/${filter.id}/${slugName}`);
    onMobileMenuClose();
  };

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between mb-2">
        <SidebarMenuButton asChild>
          <NavLink
            to="/filters"
            className={({ isActive }) =>
              `flex items-center rounded-md text-sm transition-colors ${
                isActive ? "text-primary font-medium" : "text-sidebar-foreground"
              }`
            }
            onClick={onMobileMenuClose}
          >
            <SidebarGroupLabel>Filters</SidebarGroupLabel>
          </NavLink>
        </SidebarMenuButton>
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
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoadingFilters ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : topFilters.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No filters found
            </div>
          ) : (
            <>
              {topFilters.map((filter) => (
                <SidebarMenuItem key={filter.id}>
                  <SidebarMenuButton asChild>
                    <button
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        location.pathname.includes(`/filters/${filter.id}`) 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                          : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`}
                      onClick={(e) => handleFilterClick(filter, e)}
                    >
                      <Filter 
                        className="h-4 w-4" 
                        style={filter.color ? { color: filter.color } : undefined}
                      />
                      <span className="truncate">{filter.name}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {hasMoreFilters && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/filters"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-muted-foreground hover:text-sidebar-accent-foreground"
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
    </SidebarGroup>
  );
}
