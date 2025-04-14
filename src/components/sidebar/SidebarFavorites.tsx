
import { Star, ListTodo, Filter, StarOff } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (favoriteItems.length === 0) {
    return null;
  }

  const handleClick = (item: FavoriteItem, e: React.MouseEvent) => {
    e.preventDefault();
    const slugName = item.name.toLowerCase().replace(/\s+/g, '-');
    
    if (item.type === 'project') {
      navigate(`/projects/${item.id}/${slugName}`);
    } else {
      navigate(`/filters/${item.id}/${slugName}`);
    }
    
    onMobileMenuClose();
  };

  const handleUnfavorite = async (item: FavoriteItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return;

    try {
      const table = item.type === 'project' ? 'projects' : 'filters';
      const { error } = await supabase
        .from(table)
        .update({ favorite: false })
        .eq('id', item.id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success(`Removed ${item.name} from favorites`);
    } catch (error) {
      console.error('Error unfavoriting item:', error);
      toast.error('Failed to remove from favorites');
    }
  };
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center">
        <Star className="h-4 w-4 mr-2 text-sidebar-foreground" />
        <span>Favorites</span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {favoriteItems.map((item) => {
            const isProject = item.type === 'project';
            const itemPath = isProject ? `/projects/${item.id}` : `/filters/${item.id}`;
            const isActive = location.pathname.includes(itemPath);
            
            return (
              <SidebarMenuItem key={`${item.type}-${item.id}`}>
                <SidebarMenuButton asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors relative group",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_2px_5px_rgba(0,0,0,0.08)]" 
                        : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                    onClick={(e) => handleClick(item, e)}
                  >
                    {isProject ? (
                      <ListTodo
                        className="h-3.5 w-3.5"
                        style={item.color ? { color: item.color } : undefined}
                      />
                    ) : (
                      <Filter
                        className="h-3.5 w-3.5"
                        style={item.color ? { color: item.color } : undefined}
                      />
                    )}
                    <span className="truncate flex-1">{item.name}</span>
                    <button
                      onClick={(e) => handleUnfavorite(item, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from favorites"
                    >
                      <StarOff className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                    </button>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
