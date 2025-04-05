
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { CustomFilter, standardFilters } from "@/types/filterTypes";
import { Filter } from "@/types/supabase";
import { isStandardFilter } from "@/utils/filterUtils";

export function useFilter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditFilterOpen, setIsEditFilterOpen] = useState(false);
  const [isDeleteFilterOpen, setIsDeleteFilterOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");
  
  const fetchFilter = async () => {
    const standardFilter = standardFilters.find(filter => filter.id === id);
    if (standardFilter) {
      return standardFilter;
    }
    
    if (!user || !id) return null;
    
    try {
      const { data, error } = await supabase
        .from('filters')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      
      // Cast the data to include favorite property
      const filterData = data as Filter;
      
      return {
        id: filterData.id,
        name: filterData.name,
        conditions: filterData.conditions,
        logic: "and",
        favorite: filterData.favorite ?? false,
        user_id: filterData.user_id,
        created_at: filterData.created_at || "",
        updated_at: filterData.updated_at || ""
      } as CustomFilter;
    } catch (error: any) {
      toast.error("Failed to fetch filter", {
        description: error.message
      });
      navigate('/');
      return null;
    }
  };
  
  const { data: currentFilter, isLoading } = useQuery({
    queryKey: ['filter', id, user?.id],
    queryFn: fetchFilter,
    enabled: !!user && !!id
  });
  
  const handleFilterFavoriteToggle = async () => {
    if (!currentFilter || isStandardFilter(currentFilter.id)) {
      toast.error("Cannot modify standard filters");
      return;
    }
    
    try {
      const newValue = !currentFilter.favorite;
      
      // Explicitly cast the update object to include favorite
      const updateData = {
        favorite: newValue 
      } as Partial<Filter>;
      
      const { error } = await supabase
        .from('filters')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(newValue ? "Added to favorites" : "Removed from favorites");
    } catch (error: any) {
      toast.error("Failed to update filter", {
        description: error.message
      });
    }
  };

  const handleFilterRename = async () => {
    if (!newFilterName.trim()) {
      toast.error("Filter name is required");
      return;
    }
    
    if (isStandardFilter(id)) {
      toast.error("Cannot modify standard filters");
      return;
    }

    try {
      const { error } = await supabase
        .from('filters')
        .update({ name: newFilterName })
        .eq('id', id);
        
      if (error) throw error;
      
      setIsEditFilterOpen(false);
      toast.success("Filter renamed successfully");
    } catch (error: any) {
      toast.error("Failed to rename filter", {
        description: error.message
      });
    }
  };

  const handleFilterDelete = async () => {
    if (isStandardFilter(id)) {
      toast.error("Cannot delete standard filters");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('filters')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setIsDeleteFilterOpen(false);
      toast.success("Filter deleted successfully");
      navigate('/');
    } catch (error: any) {
      toast.error("Failed to delete filter", {
        description: error.message
      });
    }
  };

  return {
    currentFilter,
    isLoading,
    isEditFilterOpen,
    setIsEditFilterOpen,
    isDeleteFilterOpen,
    setIsDeleteFilterOpen,
    newFilterName,
    setNewFilterName,
    handleFilterFavoriteToggle,
    handleFilterRename,
    handleFilterDelete
  };
}
