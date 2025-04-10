
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
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  const handleFavoriteToggle = async (item: FavoriteItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (updatingItem) return; // Prevent multiple clicks
    
    setUpdatingItem(`${item.type}-${item.id}`);
    
    try {
      const table = item.type === 'project' ? 'projects' : 'filters';
      
      const { error } = await supabase
        .from(table)
        .update({ favorite: false })
        .eq('id', item.id);
        
      if (error) throw error;
      
      toast.success(`Removed from favorites`);
    } catch (error: any) {
      toast.error(`Failed to update favorite status: ${error.message}`);
    } finally {
      setUpdatingItem(null);
    }
  };

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
                  <div className="flex w-full">
                    <NavLink
                      to={item.type === "project" ? `/projects/${item.id}` : `/filters/${item.id}`}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors flex-grow ${
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
                    </NavLink>
                    <Button
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 ml-auto"
                      onClick={(e) => handleFavoriteToggle(item, e)}
                      disabled={updatingItem === `${item.type}-${item.id}`}
                    >
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="sr-only">Remove from favorites</span>
                    </Button>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
