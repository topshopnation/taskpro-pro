
import { Star, ListTodo, Filter } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface FavoriteItem {
  id: string;
  name: string;
  type: 'project' | 'filter';
  color?: string;
}

interface SidebarFavoritesProps {
  favoriteItems: FavoriteItem[];
  onMobileMenuClose: () => void;
}

export function SidebarFavorites({ favoriteItems, onMobileMenuClose }: SidebarFavoritesProps) {
  return (
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
                    onClick={onMobileMenuClose}
                  >
                    {item.type === "project" ? (
                      <ListTodo 
                        className="h-4 w-4" 
                        style={item.color ? { color: item.color } : undefined}
                      />
                    ) : (
                      <Filter 
                        className="h-4 w-4" 
                        style={item.color ? { color: item.color } : undefined}
                      />
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
  );
}
