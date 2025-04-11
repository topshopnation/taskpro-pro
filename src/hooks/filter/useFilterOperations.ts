
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export function useFilterOperations(filterId: string) {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    } catch (error: any) {
      toast.error("Failed to update favorite status", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = async (name: string, conditions: any, color?: string) => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      
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
      
      const { error } = await supabase
        .from('filters')
        .update({ 
          name, 
          conditions: formattedConditions,
          color: color || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', filterId);
        
      if (error) throw error;
      
      toast.success("Filter updated successfully");
      return true;
    } catch (error: any) {
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
