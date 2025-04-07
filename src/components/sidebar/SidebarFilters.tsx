
import { Filter, Plus, Loader2 } from "lucide-react";
import { NavLink } from "react-router-dom";
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
  return (
    <SidebarGroup>
      <div className="flex items-center justify-between mb-2">
        <SidebarGroupLabel>Filters</SidebarGroupLabel>
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
                    onClick={onMobileMenuClose}
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
  );
}
