
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export function useFilterOperations(filterId: string) {
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Toggle favorite status of a filter
  const toggleFavorite = async (currentFavorite: boolean) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('filters')
        .update({ favorite: !currentFavorite })
        .eq('id', filterId);
        
      if (error) throw error;
      
      // Success notification
      toast.success(`Filter ${!currentFavorite ? 'added to' : 'removed from'} favorites`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['filter', filterId] });
      queryClient.invalidateQueries({ queryKey: ['filters'] });
      
      return true;
    } catch (error: any) {
      toast.error("Failed to update filter", {
        description: error.message
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update filter name and conditions
  const updateFilter = async (name: string, conditions: any, color?: string) => {
    if (!name.trim()) {
      toast.error("Filter name cannot be empty");
      return false;
    }
    
    setIsUpdating(true);
    try {
      console.log("Updating filter with conditions:", conditions);
      
      // Prepare update data
      const updateData: Record<string, any> = {
        name: name.trim(),
        conditions: conditions,
        updated_at: new Date().toISOString()
      };
      
      // Add color if provided
      if (color !== undefined) {
        updateData.color = color;
      }
      
      const { error } = await supabase
        .from('filters')
        .update(updateData)
        .eq('id', filterId);
        
      if (error) throw error;
      
      // Success notification
      toast.success("Filter updated successfully");
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['filter', filterId] });
      queryClient.invalidateQueries({ queryKey: ['filters'] });
      
      return true;
    } catch (error: any) {
      toast.error("Failed to update filter", {
        description: error.message
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete a filter
  const deleteFilter = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('filters')
        .delete()
        .eq('id', filterId);
        
      if (error) throw error;
      
      // Success notification
      toast.success("Filter deleted successfully");
      
      // Navigate away and invalidate queries
      navigate('/today');
      queryClient.invalidateQueries({ queryKey: ['filters'] });
      
      return true;
    } catch (error: any) {
      toast.error("Failed to delete filter", {
        description: error.message
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    toggleFavorite,
    updateFilter,
    deleteFilter
  };
}
