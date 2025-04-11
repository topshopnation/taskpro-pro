
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

export function useFilterOperations(filterId: string) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async (currentFavorite: boolean) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('filters')
        .update({ favorite: !currentFavorite })
        .eq('id', filterId);
        
      if (error) throw error;
      
      toast.success(!currentFavorite ? "Added to favorites" : "Removed from favorites");
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['filter', filterId, user.id] });
      queryClient.invalidateQueries({ queryKey: ['filter-names', user.id] });
    } catch (error: any) {
      toast.error("Failed to update favorite status", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = async (name: string, conditions: any, color?: string) => {
    if (!user || !filterId) return false;
    
    try {
      setIsLoading(true);
      
      console.log("Updating filter:", filterId);
      console.log("New filter conditions:", conditions);
      
      // Ensure conditions are in the correct format
      const formattedConditions = conditions;
      if (typeof formattedConditions !== 'object') {
        throw new Error("Invalid filter conditions format");
      }
      
      // Make sure conditions has items array and logic property
      if (!formattedConditions.items) {
        formattedConditions.items = [];
      }
      
      if (!formattedConditions.logic) {
        formattedConditions.logic = "and";
      }
      
      const updateData = { 
        name, 
        conditions: formattedConditions,
        color: color || null,
        updated_at: new Date().toISOString()
      };
      
      console.log("Updating with data:", updateData);
      
      const { data, error } = await supabase
        .from('filters')
        .update(updateData)
        .eq('id', filterId)
        .select();
        
      if (error) {
        console.error("Error updating filter:", error);
        throw error;
      }
      
      console.log("Filter update response:", data);
      
      toast.success("Filter updated successfully");
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['filter', filterId, user.id] });
      queryClient.invalidateQueries({ queryKey: ['filter-names', user.id] });
      
      return true;
    } catch (error: any) {
      console.error("Failed to update filter:", error);
      toast.error("Failed to update filter", {
        description: error.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFilter = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('filters')
        .delete()
        .eq('id', filterId);
        
      if (error) throw error;
      
      toast.success("Filter deleted successfully");
      
      // Invalidate relevant queries after deletion
      queryClient.invalidateQueries({ queryKey: ['filter-names', user.id] });
      
      navigate('/today'); // Navigate to Today view after deletion
    } catch (error: any) {
      toast.error("Failed to delete filter", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    toggleFavorite,
    updateFilter,
    deleteFilter
  };
}
