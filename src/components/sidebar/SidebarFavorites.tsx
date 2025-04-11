
import { Star, Filter, ListTodo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
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
    // Use slugified name in URL
    const slugName = item.name.toLowerCase().replace(/\s+/g, '-');
    console.log(`Navigating to ${item.type}:`, item.id, slugName);
    const path = item.type === 'project' 
      ? `/projects/${item.id}/${slugName}` 
      : `/filters/${item.id}/${slugName}`;
    navigate(path);
    onMobileMenuClose();
  };

  const handleRemoveFavorite = async (item: FavoriteItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from(item.type === 'project' ? 'projects' : 'filters')
        .update({ favorite: false })
        .eq('id', item.id);
        
      if (error) throw error;
      
      toast.success(`Removed from favorites`);
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast.error(`Failed to remove from favorites`);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="mb-2">Favorites</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {favoriteItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
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
                  <button 
                    onClick={(e) => handleRemoveFavorite(item, e)}
                    className="ml-auto"
                  >
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </button>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
