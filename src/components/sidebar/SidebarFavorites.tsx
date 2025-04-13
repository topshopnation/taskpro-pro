
import { Star, ListTodo, Filter } from "lucide-react";
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
  
  // Don't show the favorites section if there are no favorites
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
  
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center">
        <Star className="h-4 w-4 mr-2 text-sidebar-foreground" />
        <span>Favorites</span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {favoriteItems.map((item) => {
            // Determine if this item is active based on the current path
            const isProject = item.type === 'project';
            const itemPath = isProject ? `/projects/${item.id}` : `/filters/${item.id}`;
            const isActive = location.pathname.includes(itemPath);
            
            return (
              <SidebarMenuItem key={`${item.type}-${item.id}`}>
                <SidebarMenuButton asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_2px_5px_rgba(0,0,0,0.08)]" 
                        : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                    onClick={(e) => handleClick(item, e)}
                  >
                    {isProject ? (
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
                    <span className="truncate">{item.name}</span>
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
