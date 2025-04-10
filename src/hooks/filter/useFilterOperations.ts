
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { isStandardFilter } from "@/utils/filterUtils";

export function useFilterOperations(filterId?: string) {
  const navigate = useNavigate();

  const handleFilterFavoriteToggle = async (currentFilter: any) => {
    if (!currentFilter || isStandardFilter(currentFilter.id)) {
      toast.error("Cannot modify standard filters");
      return;
    }
    
    try {
      const newValue = !currentFilter.favorite;
      
      // Explicitly cast the update object to include favorite
      const updateData = {
        favorite: newValue 
      };
      
      const { error } = await supabase
        .from('filters')
        .update(updateData)
        .eq('id', filterId);
        
      if (error) throw error;
      
      toast.success(newValue ? "Added to favorites" : "Removed from favorites");
    } catch (error: any) {
      toast.error("Failed to update filter", {
        description: error.message
      });
    }
  };

  const handleFilterRename = async (newFilterName: string, filterColor?: string) => {
    if (!newFilterName.trim()) {
      toast.error("Filter name is required");
      return;
    }
    
    if (isStandardFilter(filterId)) {
      toast.error("Cannot modify standard filters");
      return;
    }

    try {
      const updateData: {
        name: string;
        color?: string;
      } = {
        name: newFilterName
      };
      
      if (filterColor) {
        updateData.color = filterColor;
      }

      const { error } = await supabase
        .from('filters')
        .update(updateData)
        .eq('id', filterId);
        
      if (error) throw error;
      
      toast.success("Filter updated successfully");
      return true;
    } catch (error: any) {
      toast.error("Failed to update filter", {
        description: error.message
      });
      return false;
    }
  };

  const handleFilterDelete = async () => {
    if (isStandardFilter(filterId)) {
      toast.error("Cannot delete standard filters");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('filters')
        .delete()
        .eq('id', filterId);
        
      if (error) throw error;
      
      toast.success("Filter deleted successfully");
      navigate('/today'); // Navigate to Today page instead of home
      return true;
    } catch (error: any) {
      toast.error("Failed to delete filter", {
        description: error.message
      });
      return false;
    }
  };
  
  const handleFilterColorChange = async (color: string, currentFilter: any, isEditOpen: boolean) => {
    if (!currentFilter || isStandardFilter(currentFilter.id)) {
      toast.error("Cannot modify standard filters");
      return;
    }
    
    // If we're not in the edit dialog, update the color immediately
    if (!isEditOpen) {
      try {
        const { error } = await supabase
          .from('filters')
          .update({ color })
          .eq('id', filterId);
          
        if (error) throw error;
        
        toast.success("Filter color updated");
      } catch (error: any) {
        toast.error("Failed to update filter color", {
          description: error.message
        });
      }
    }
    
    return color;
  };

  return {
    handleFilterFavoriteToggle,
    handleFilterRename,
    handleFilterDelete,
    handleFilterColorChange
  };
}
