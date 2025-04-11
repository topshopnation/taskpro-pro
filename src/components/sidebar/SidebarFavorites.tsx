
import { Star, Loader2, Filter, ListTodo } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

export function SidebarFavorites({ 
  favoriteItems, 
  onMobileMenuClose 
}: SidebarFavoritesProps) {
  const navigate = useNavigate();

  if (favoriteItems.length === 0) {
    return null;
  }

  const handleFavoriteClick = (item: FavoriteItem, e: React.MouseEvent) => {
    e.preventDefault();
    const path = item.type === 'project' ? `/projects/${item.id}` : `/filters/${item.id}`;
    navigate(path);
    onMobileMenuClose();
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="mb-2">Favorites</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {favoriteItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild>
                <a
                  href={item.type === 'project' ? `/projects/${item.id}` : `/filters/${item.id}`}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  onClick={(e) => handleFavoriteClick(item, e)}
                >
                  {item.type === 'project' ? (
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
                  <Star className="h-4 w-4 ml-auto fill-yellow-400 text-yellow-400" />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
