
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useFilterOperations(filterId: string) {
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const toggleFavorite = async (newFavoriteValue: boolean) => {
    if (!user || !filterId) return false;

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('filters')
        .update({ favorite: newFavoriteValue })
        .eq('id', filterId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['filter', filterId, user.id] });
      
      toast.success(newFavoriteValue ? "Added to favorites" : "Removed from favorites");
      return true;
    } catch (error: any) {
      console.error('Error updating filter favorite:', error);
      toast.error('Failed to update filter favorite status');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateFilter = async (name: string, conditions: any, color?: string) => {
    if (!user || !filterId) return false;

    try {
      setIsUpdating(true);
      
      const updateData: {
        name: string;
        conditions: any;
        color?: string;
        updated_at: string;
      } = {
        name,
        conditions,
        updated_at: new Date().toISOString()
      };
      
      if (color) {
        updateData.color = color;
      }

      const { error } = await supabase
        .from('filters')
        .update(updateData)
        .eq('id', filterId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['filter', filterId, user.id] });
      
      toast.success("Filter updated successfully");
      return true;
    } catch (error: any) {
      console.error('Error updating filter:', error);
      toast.error('Failed to update filter');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteFilter = async () => {
    if (!user || !filterId) return false;

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('filters')
        .delete()
        .eq('id', filterId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Filter deleted successfully");
      navigate('/filters');
      return true;
    } catch (error: any) {
      console.error('Error deleting filter:', error);
      toast.error('Failed to delete filter');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    toggleFavorite,
    updateFilter,
    deleteFilter,
    isUpdating
  };
}
